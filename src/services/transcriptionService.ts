/**
 * Transcription Service
 * 
 * This service handles audio transcription using Hume AI and report generation using Google's Gemini model.
 * It provides methods for sending audio to Hume, checking transcription status, and generating clinical reports.
 */

import { generatePrompt } from '@/utils/promptGenerator';

/**
 * Sends audio blob to Hume AI for transcription
 * @param audioBlob Audio blob to transcribe
 * @returns Promise resolving to job ID for status checking
 */
export async function sendAudioToHume(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'session.wav');

  try {
    const res = await fetch('https://api.hume.ai/v0/batch/audio', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': import.meta.env.VITE_HUME_API_KEY,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Hume API error: ${errorData.message || res.statusText}`);
    }

    const data = await res.json();
    return data.job_id; // Return job ID to later check the status
  } catch (error) {
    console.error('Error sending audio to Hume:', error);
    throw error;
  }
}

/**
 * Checks the status of a transcription job and retrieves the result when done
 * @param jobId Hume job ID from sendAudioToHume
 * @returns Promise resolving to transcription text
 */
export async function checkTranscription(jobId: string): Promise<string> {
  try {
    const res = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}`, {
      headers: {
        'X-Hume-Api-Key': import.meta.env.VITE_HUME_API_KEY,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Hume API error: ${errorData.message || res.statusText}`);
    }

    const data = await res.json();
    
    if (data.state === 'done') {
      return data.results?.transcriptions?.[0]?.text || '';
    }
    
    if (data.state === 'failed') {
      throw new Error(`Transcription failed: ${data.error || 'Unknown error'}`);
    }

    throw new Error('Transcription not ready yet');
  } catch (error) {
    console.error('Error checking transcription status:', error);
    throw error;
  }
}

/**
 * Polls the Hume API for transcription results with exponential backoff
 * @param jobId Hume job ID to poll
 * @param maxAttempts Maximum number of attempts
 * @param initialDelay Initial delay in ms
 * @returns Promise resolving to transcription text
 */
export async function pollForTranscription(
  jobId: string, 
  maxAttempts: number = 30, 
  initialDelay: number = 2000
): Promise<string> {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    try {
      const result = await checkTranscription(jobId);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'Transcription not ready yet') {
        // Wait and try again
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
        delay = Math.min(delay * 1.5, 10000); // Exponential backoff with max 10s
      } else {
        // Other error, rethrow
        throw error;
      }
    }
  }
  
  throw new Error('Maximum polling attempts reached. Transcription timed out.');
}

/**
 * Generates a clinical report from transcription text using Google's Gemini
 * @param transcription Transcription text
 * @returns Promise resolving to report text
 */
export async function generateClinicalReport(
  transcription: string, 
  format: 'SOAP' | 'BIRP' | 'DAP' | 'Scribbled Notes'
): Promise<string> {  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + 
      import.meta.env.VITE_GEMINI_API_KEY, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { 
                  text: prompt
                }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No report generated.';
  } catch (error) {
    console.error('Error generating clinical report:', error);
    throw error;
  }
}

/**
 * Processes an audio file:
 * 1. Sends to Hume for transcription
 * 2. Polls until transcription is complete
 * 3. Sends transcription to Gemini for report generation
 * 
 * @param audioBlob Audio blob to process
 * @param progressCallback Optional callback for progress updates
 * @returns Object containing transcription and report
 */
export async function processAudioSession(
  audioBlob: Blob,
  progressCallback?: (stage: string, progress: number) => void
): Promise<{ transcription: string; report: string }> {
  try {
    // Update progress
    progressCallback?.('transcription', 10);
    
    // 1. Send audio to Hume
    const jobId = await sendAudioToHume(audioBlob);
    
    progressCallback?.('transcription', 30);
    
    // 2. Poll for transcription result
    const transcription = await pollForTranscription(jobId);
    
    progressCallback?.('analysis', 60);
    
    // 3. Generate clinical report
    const report = await generateClinicalReport(transcription, 'SOAP');
    
    progressCallback?.('complete', 100);
    
    return {
      transcription,
      report
    };
  } catch (error) {
    console.error('Error processing audio session:', error);
    throw error;
  }
}
