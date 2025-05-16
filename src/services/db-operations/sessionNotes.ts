import { supabase, DbResponse } from './supabaseClient';

export type SessionNote = {
  id: string;
  session_id: string;
  therapist_id: string;
  client_id: string;
  title: string;
  content: Record<string, any>; // JSONB
  therapy_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type SessionNoteInput = Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a new session note
 * @param noteData The session note data to create
 * @returns The created session note or an error
 */
export async function createSessionNote(noteData: SessionNoteInput): Promise<DbResponse<SessionNote>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating session note:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific session note by its ID
 * @param noteId UUID of the session note
 * @returns The session note data or an error
 */
export async function getSessionNoteById(noteId: string): Promise<DbResponse<SessionNote>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session note:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all notes for a specific session
 * @param sessionId UUID of the session
 * @returns Array of session note objects or an error
 */
export async function getSessionNotesBySessionId(sessionId: string): Promise<DbResponse<SessionNote[]>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session notes by session ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all session notes for a specific client
 * @param clientId UUID of the client
 * @returns Array of session note objects or an error
 */
export async function getSessionNotesByClientId(clientId: string): Promise<DbResponse<SessionNote[]>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session notes by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing session note
 * @param noteId UUID of the session note
 * @param updateData Partial session note data to update
 * @returns The updated session note or an error
 */
export async function updateSessionNote(
  noteId: string, 
  updateData: Partial<SessionNoteInput>
): Promise<DbResponse<SessionNote>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating session note:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a session note
 * @param noteId UUID of the session note
 * @returns Success status or an error
 */
export async function deleteSessionNote(noteId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('session_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting session note:', error);
    return { data: null, error: error as Error };
  }
}
