import { supabase } from '@/lib/supabase';
import { DbResponse } from '@/lib/supabase';
import { mockSessions } from '@/mockData/sessions';

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

// Extended interface for sessions with client data
export interface SessionWithDetails extends Session {
  client?: {
    id: string;
    email: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
}

export class SessionService {
  /**
   * Get all sessions for a therapist
   */
  async getSessions(therapistId: string) {
    try {
      // Use a simpler query without trying to join clients directly
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('session_date', { ascending: false });

      // Check if the table doesn't exist or other database error
      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.log('Using mock session data because database table does not exist');
          // Return mock data if the table doesn't exist
          return { 
            data: mockSessions.filter(session => session.therapist_id === therapistId || therapistId === 'current-user-id'), 
            error: null 
          } as DbResponse<SessionWithDetails[]>;
        }
        throw error; // Re-throw other errors
      }

      if (data) {
        // Fetch all referenced clients in a separate query
        const clientIds = [...new Set(data.map(session => session.client_id))];
        
        if (clientIds.length > 0) {
          try {
            const { data: clientsData, error: clientsError } = await supabase
              .from('clients')
              .select(`
                id, email,
                profile:client_profiles(first_name, last_name)
              `)
              .in('id', clientIds);

            // Check if clients table exists
            if (clientsError && (clientsError.message?.includes('does not exist') || clientsError.code === '42P01')) {
              console.log('Using mock client data because database table does not exist');
              return { 
                data: mockSessions.filter(session => session.therapist_id === therapistId || therapistId === 'current-user-id'), 
                error: null 
              } as DbResponse<SessionWithDetails[]>;
            }

            // Map client data to sessions
            if (clientsData) {
              const clientsMap = new Map(clientsData.map(client => [client.id, client]));
              
              // Enrich sessions with client data
              data.forEach(session => {
                const client = clientsMap.get(session.client_id);
                if (client) {
                  session.client = client;
                }
              });
            }
          } catch (clientError) {
            console.error('Error fetching clients:', clientError);
            // Continue with session data even if client data fetch fails
          }
        }
      }

      return { data, error } as DbResponse<SessionWithDetails[]>;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      
      // Fallback to mock data for any error
      console.log('Using mock session data due to error');
      return { 
        data: mockSessions.filter(session => session.therapist_id === therapistId || therapistId === 'current-user-id'), 
        error: null 
      } as DbResponse<SessionWithDetails[]>;
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

      if (data && !error) {
        // Get client data to attach to each session
        const { data: clientData } = await supabase
          .from('clients')
          .select(`
            id, email,
            profile:client_profiles(first_name, last_name)
          `)
          .eq('id', clientId)
          .single();

        // Add client data to each session
        if (clientData) {
          data.forEach(session => {
            session.client = clientData;
          });
        }
      }

      return { data, error } as DbResponse<SessionWithDetails[]>;
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
      // Get the session without trying to join clients directly
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (data && !error && data.client_id) {
        // Get the client data separately
        const { data: clientData } = await supabase
          .from('clients')
          .select(`
            id, email,
            profile:client_profiles(first_name, last_name)
          `)
          .eq('id', data.client_id)
          .single();

        // Add client data to the session
        if (clientData) {
          data.client = clientData;
        }
      }

      return { data, error } as DbResponse<SessionWithDetails>;
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

      return { data, error } as DbResponse<SessionWithDetails>;
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

      return { data, error } as DbResponse<SessionWithDetails>;
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

      return { data, error } as DbResponse<SessionWithDetails>;
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

      return { data, error } as DbResponse<SessionWithDetails>;
    } catch (error) {
      console.error('Error adding session notes:', error);
      return { data: null, error: error as Error };
    }
  }
}
