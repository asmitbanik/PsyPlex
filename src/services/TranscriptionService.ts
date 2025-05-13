import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type SessionTranscript = Database['public']['Tables']['session_transcripts']['Row'];
export type TranscriptSegment = Database['public']['Tables']['transcript_segments']['Row'];

export interface TranscriptWithSegments extends SessionTranscript {
  segments?: TranscriptSegment[];
}

export class TranscriptionService extends BaseService<SessionTranscript> {
  constructor() {
    super('session_transcripts');
  }

  /**
   * Get a transcript with all segments
   */
  async getTranscriptWithSegments(transcriptId: string): Promise<ServiceResponse<TranscriptWithSegments>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          segments:transcript_segments(*)
        `)
        .eq('id', transcriptId)
        .single();

      return {
        data: data as unknown as TranscriptWithSegments,
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get transcript for a session
   */
  async getTranscriptForSession(sessionId: string): Promise<ServiceResponse<TranscriptWithSegments>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          segments:transcript_segments(*)
        `)
        .eq('session_id', sessionId)
        .single();

      return {
        data: data as unknown as TranscriptWithSegments,
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new transcript for a session
   */
  async createTranscript(sessionId: string): Promise<ServiceResponse<SessionTranscript>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          session_id: sessionId,
          transcription_status: 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as SessionTranscript, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update transcript status
   */
  async updateTranscriptStatus(
    transcriptId: string,
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
  ): Promise<ServiceResponse<SessionTranscript>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          transcription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcriptId)
        .select('*')
        .single();

      return { data: data as SessionTranscript, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add a segment to a transcript
   */
  async addSegment(
    transcriptId: string,
    speaker: 'Therapist' | 'Client',
    text: string,
    timestampStart: number,
    timestampEnd?: number
  ): Promise<ServiceResponse<TranscriptSegment>> {
    try {
      const { data, error } = await supabase
        .from('transcript_segments')
        .insert({
          transcript_id: transcriptId,
          speaker,
          text,
          timestamp_start: timestampStart,
          timestamp_end: timestampEnd || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as TranscriptSegment, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get segments for a transcript
   */
  async getSegments(transcriptId: string): Promise<ServiceResponse<TranscriptSegment[]>> {
    try {
      const { data, error } = await supabase
        .from('transcript_segments')
        .select('*')
        .eq('transcript_id', transcriptId)
        .order('timestamp_start', { ascending: true });

      return { data: data as TranscriptSegment[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Process transcription from text
   * This method simulates processing from a text source
   */
  async processTranscriptionFromText(
    sessionId: string,
    text: string,
    speakerMapping: { [timestamp: number]: 'Therapist' | 'Client' } = {}
  ): Promise<ServiceResponse<TranscriptWithSegments>> {
    try {
      // Create transcript record
      const { data: transcript, error: transcriptError } = await this.createTranscript(sessionId);
      
      if (transcriptError || !transcript) {
        return { data: null, error: transcriptError || new Error('Failed to create transcript') };
      }
      
      // Update status to processing
      await this.updateTranscriptStatus(transcript.id, 'Processing');
      
      // Process the text into segments
      // This is a simple implementation - in a real app, you would have a more sophisticated algorithm
      const segments = text.split(/(?<=[.!?])\s+/);
      let startTime = 0;
      const segmentResults = [];
      
      for (const segmentText of segments) {
        if (segmentText.trim()) {
          const speaker = speakerMapping[startTime] || 
            (Math.random() > 0.5 ? 'Therapist' : 'Client');
          
          const segmentLength = segmentText.length / 20; // Rough estimate of time per segment
          
          const { data: segment } = await this.addSegment(
            transcript.id,
            speaker,
            segmentText.trim(),
            startTime,
            startTime + segmentLength
          );
          
          if (segment) {
            segmentResults.push(segment);
          }
          
          startTime += segmentLength + 0.5; // Add a small pause between segments
        }
      }
      
      // Mark transcript as completed
      await this.updateTranscriptStatus(transcript.id, 'Completed');
      
      return {
        data: {
          ...transcript,
          segments: segmentResults
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
