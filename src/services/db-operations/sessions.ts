import { supabase, DbResponse } from './supabaseClient';

export type Session = {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  duration_minutes?: number;
  session_type: 'In-person' | 'Virtual';
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show';
  created_at?: string;
  updated_at?: string;
};

export type SessionInput = Omit<Session, 'id' | 'created_at' | 'updated_at'>;

/**
 * Schedules a new session
 * @param sessionData The session data to create
 * @returns The created session or an error
 */
export async function createSession(sessionData: SessionInput): Promise<DbResponse<Session>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating session:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific session by its ID
 * @param sessionId UUID of the session
 * @returns The session data or an error
 */
export async function getSessionById(sessionId: string): Promise<DbResponse<Session>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all sessions for a specific client
 * @param clientId UUID of the client
 * @returns Array of session objects or an error
 */
export async function getSessionsByClientId(clientId: string): Promise<DbResponse<Session[]>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching sessions by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all sessions for a specific therapist
 * @param therapistId UUID of the therapist
 * @returns Array of session objects or an error
 */
export async function getSessionsByTherapistId(therapistId: string): Promise<DbResponse<Session[]>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('therapist_id', therapistId)
      .order('session_date', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching sessions by therapist ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing session's details
 * @param sessionId UUID of the session
 * @param updateData Partial session data to update
 * @returns The updated session or an error
 */
export async function updateSession(
  sessionId: string, 
  updateData: Partial<SessionInput>
): Promise<DbResponse<Session>> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating session:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a session
 * @param sessionId UUID of the session
 * @returns Success status or an error
 */
export async function deleteSession(sessionId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting session:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get upcoming sessions for a therapist
 * @param therapistId UUID of the therapist
 * @returns Array of upcoming sessions or an error
 */
export async function getUpcomingSessionsByTherapistId(therapistId: string): Promise<DbResponse<Session[]>> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('therapist_id', therapistId)
      .gte('session_date', now)
      .not('status', 'eq', 'Canceled')
      .order('session_date', { ascending: true });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return { data: null, error: error as Error };
  }
}
