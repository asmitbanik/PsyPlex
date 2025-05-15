import { supabase } from '@/lib/supabase';
import { DbResponse } from '@/lib/supabase';

export interface Session {
  id: string;
  created_at: string;
  therapist_id: string;
  client_id: string;
  session_date: string;
  session_time: string;
  session_type: string;
  status: string; // scheduled, completed, cancelled
  notes?: string;
}

export class SessionService {
  /**
   * Get all sessions for a therapist
   */
  async getSessions(therapistId: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          *,
          client:clients(id, email, profile:client_profiles(first_name, last_name))
        `)
        .eq('therapist_id', therapistId)
        .order('session_date', { ascending: false });

      return { data, error } as DbResponse<Session[]>;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Get all sessions for a therapist (alias for getSessions for backward compatibility)
   */
  async getSessionsByTherapist(therapistId: string) {
    return this.getSessions(therapistId);
  }

  /**
   * Get sessions for a specific client
   */
  async getClientSessions(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false });

      return { data, error } as DbResponse<Session[]>;
    } catch (error) {
      console.error('Error fetching client sessions:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
          *,
          client:clients(id, email, profile:client_profiles(first_name, last_name))
        `)
        .eq('id', sessionId)
        .single();

      return { data, error } as DbResponse<Session>;
    } catch (error) {
      console.error('Error fetching session:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new session
   */
  async createSession(session: Partial<Session>) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert([session])
        .select()
        .single();

      return { data, error } as DbResponse<Session>;
    } catch (error) {
      console.error('Error creating session:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Create a new session (alias for createSession for backward compatibility)
   */
  async create(session: Partial<Session>) {
    return this.createSession(session);
  }

  /**
   * Update a session
   */
  async updateSession(sessionId: string, updates: Partial<Session>) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error } as DbResponse<Session>;
    } catch (error) {
      console.error('Error updating session:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string) {
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .delete()
        .eq('id', sessionId);

      return { data: { id: sessionId }, error: null } as DbResponse<{ id: string }>;
    } catch (error) {
      console.error('Error deleting session:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update session status (e.g., mark as completed)
   */
  async updateSessionStatus(sessionId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error } as DbResponse<Session>;
    } catch (error) {
      console.error('Error updating session status:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add notes to a session
   */
  async addSessionNotes(sessionId: string, notes: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .update({ notes })
        .eq('id', sessionId)
        .select()
        .single();

      return { data, error } as DbResponse<Session>;
    } catch (error) {
      console.error('Error adding session notes:', error);
      return { data: null, error: error as Error };
    }
  }
}
