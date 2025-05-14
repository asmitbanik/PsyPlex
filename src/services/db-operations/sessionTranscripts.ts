import { supabase, DbResponse } from './supabaseClient';

export type SessionTranscript = {
  id: string;
  session_id: string;
  transcript_url?: string;
  transcription_status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  created_at?: string;
  updated_at?: string;
};

export type SessionTranscriptInput = Omit<SessionTranscript, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a record for a session transcript
 * @param transcriptData The transcript data to create
 * @returns The created transcript record or an error
 */
export async function createSessionTranscript(
  transcriptData: SessionTranscriptInput
): Promise<DbResponse<SessionTranscript>> {
  try {
    const { data, error } = await supabase
      .from('session_transcripts')
      .insert(transcriptData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating session transcript:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific transcript record by its ID
 * @param transcriptId UUID of the transcript
 * @returns The transcript record or an error
 */
export async function getSessionTranscriptById(transcriptId: string): Promise<DbResponse<SessionTranscript>> {
  try {
    const { data, error } = await supabase
      .from('session_transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session transcript:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves the transcript record for a specific session
 * @param sessionId UUID of the session
 * @returns The transcript record or an error
 */
export async function getSessionTranscriptBySessionId(
  sessionId: string
): Promise<DbResponse<SessionTranscript>> {
  try {
    const { data, error } = await supabase
      .from('session_transcripts')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session transcript by session ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a transcript record (e.g., status, URL)
 * @param transcriptId UUID of the transcript record
 * @param updateData Partial transcript data to update
 * @returns The updated transcript record or an error
 */
export async function updateSessionTranscript(
  transcriptId: string, 
  updateData: Partial<SessionTranscriptInput>
): Promise<DbResponse<SessionTranscript>> {
  try {
    const { data, error } = await supabase
      .from('session_transcripts')
      .update(updateData)
      .eq('id', transcriptId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating session transcript:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a transcript record
 * @param transcriptId UUID of the transcript
 * @returns Success status or an error
 */
export async function deleteSessionTranscript(
  transcriptId: string
): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('session_transcripts')
      .delete()
      .eq('id', transcriptId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting session transcript:', error);
    return { data: null, error: error as Error };
  }
}
