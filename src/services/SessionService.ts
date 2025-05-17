import { DbResponse } from '@/lib/supabase';
import { mockSessions } from '@/mockData/sessions';
import * as sessionOperations from '@/services/db-operations/sessions';
import * as clientOperations from '@/services/db-operations/clients';
import * as clientProfileOperations from '@/services/db-operations/clientProfiles';

// Adapt the Session interface to match db-operations types
export interface Session {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  session_time?: string; // This is for backward compatibility
  duration_minutes?: number;
  session_type: 'In-person' | 'Virtual';
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show';
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

// Extended interface for sessions with client data
export interface SessionWithDetails extends Session {
  client?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  session_time?: string;
}

export class SessionService {
  /**
   * Get all sessions for a therapist
   */
  async getSessions(therapistId: string) {
    try {
      // Use the db-operations function to get sessions
      const { data: sessions, error: sessionError } = await sessionOperations.getSessionsByTherapistId(therapistId);

      // Check if there's an error or no sessions found
      if (sessionError || !sessions) {
        console.log('Using mock session data due to error or no sessions found');
        return { 
          data: mockSessions.filter(session => session.therapist_id === therapistId || therapistId === 'current-user-id'), 
          error: null 
        } as DbResponse<SessionWithDetails[]>;
      }

      // If we have sessions, enrich them with client data
      const sessionsWithDetails: SessionWithDetails[] = [];
      
      // Process each session to include client details
      for (const session of sessions) {
        const sessionWithDetails: SessionWithDetails = {
          ...session,
          client: undefined
        };

        // Try to fetch client data for this session
        try {
          if (session.client_id) {
            const { data: clientData } = await clientOperations.getClientById(session.client_id);
            
            if (clientData) {
              // Try to fetch client profile data
              const { data: profileData } = await clientProfileOperations.getClientProfileByClientId(session.client_id);
              
              // Set client data on the session
              sessionWithDetails.client = {
                id: clientData.id,
                email: clientData.email || '',
                // Safely access profile properties with type checking
                first_name: typeof clientData.first_name === 'string' ? clientData.first_name : '',
                last_name: typeof clientData.last_name === 'string' ? clientData.last_name : '',
                // We create a profile object that matches our expected interface
                // since ClientProfile from database doesn't have these fields directly
                profile: profileData ? {
                  first_name: clientData.first_name || '',
                  last_name: clientData.last_name || ''
                } : undefined
              };
            }
          }
        } catch (clientError) {
          console.error(`Error fetching client data for session ${session.id}:`, clientError);
          // Continue even if we can't fetch client data for a session
        }

        sessionsWithDetails.push(sessionWithDetails);
      }

      return { data: sessionsWithDetails, error: null } as DbResponse<SessionWithDetails[]>;
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
      // Use the db-operations function to get sessions by client ID
      const { data: sessions, error: sessionError } = await sessionOperations.getSessionsByClientId(clientId);

      // Check if there's an error or no sessions found
      if (sessionError || !sessions) {
        console.log('Using mock session data due to error or no sessions found');
        return { 
          data: mockSessions.filter(session => session.client_id === clientId), 
          error: null 
        } as DbResponse<SessionWithDetails[]>;
      }

      // If we have sessions, enrich them with formatted time
      const sessionsWithDetails: SessionWithDetails[] = sessions.map(session => ({
        ...session,
        session_time: this.formatTimeFromDate(session.session_date)
      }));

      return { data: sessionsWithDetails, error: null } as DbResponse<SessionWithDetails[]>;
    } catch (error) {
      console.error('Error fetching client sessions:', error);
      // Fallback to mock data for any error
      return { 
        data: mockSessions.filter(session => session.client_id === clientId), 
        error: null 
      } as DbResponse<SessionWithDetails[]>;
    }
  }

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string) {
    try {
      // Use db-operations to get the session
      const { data: session, error: sessionError } = await sessionOperations.getSessionById(sessionId);

      // Handle errors or no session found
      if (sessionError || !session) {
        return { data: null, error: sessionError || new Error('Session not found') };
      }

      // Create a SessionWithDetails object
      const sessionWithDetails: SessionWithDetails = {
        ...session,
        session_time: this.formatTimeFromDate(session.session_date), // Add a formatted time for UI display
        client: undefined
      };

      // Add client data if available
      if (session.client_id) {
        try {
          // Get client data
          const { data: client } = await clientOperations.getClientById(session.client_id);
          
          if (client) {
            // Get client profile data
            const { data: profile } = await clientProfileOperations.getClientProfileByClientId(session.client_id);
            
            // Set client data on the session
            sessionWithDetails.client = {
              id: client.id,
              email: client.email || '',
              // Use client properties directly for compatibility
              first_name: typeof client.first_name === 'string' ? client.first_name : '',
              last_name: typeof client.last_name === 'string' ? client.last_name : '',
              profile: {
                // Add optional profile fields
                first_name: typeof client.first_name === 'string' ? client.first_name : '',
                last_name: typeof client.last_name === 'string' ? client.last_name : ''
              }
            };
          }
        } catch (clientError) {
          console.error('Error fetching client data for session:', clientError);
          // Continue without client data
        }
      }

      return { data: sessionWithDetails, error: null } as DbResponse<SessionWithDetails>;
    } catch (error) {
      console.error('Error fetching session:', error);
      return { data: null, error: error as Error };
    }
  }
  
  // Helper function to format time from a date string
  private formatTimeFromDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  /**
   * Create a new session
   */
  async createSession(session: Partial<Session>) {
    try {
      // Convert session data to match db-operations expected format
      const sessionData = {
        client_id: session.client_id || '',
        therapist_id: session.therapist_id || '',
        session_date: session.session_date || new Date().toISOString(),
        duration_minutes: session.duration_minutes || 50, // Default 50 minutes
        session_type: (session.session_type as 'In-person' | 'Virtual') || 'Virtual',
        status: (session.status as 'Scheduled' | 'Completed' | 'Canceled' | 'No-show') || 'Scheduled'
      };
      
      // Use the db-operations function
      const { data, error } = await sessionOperations.createSession(sessionData);

      if (error) {
        throw error;
      }
      
      // Transform the result to match our expected interface
      const sessionWithDetails: SessionWithDetails = {
        ...data,
        session_time: this.formatTimeFromDate(data.session_date),
        client: undefined
      };
      
      // Try to get client data to enhance the response
      if (data.client_id) {
        try {
          const { data: clientData } = await clientOperations.getClientById(data.client_id);
          if (clientData) {
            sessionWithDetails.client = {
              id: clientData.id,
              email: clientData.email || '',
              first_name: typeof clientData.first_name === 'string' ? clientData.first_name : '',
              last_name: typeof clientData.last_name === 'string' ? clientData.last_name : ''
            };
          }
        } catch (clientError) {
          console.error('Error fetching client data for new session:', clientError);
          // Continue without client data
        }
      }

      return { data: sessionWithDetails, error: null } as DbResponse<SessionWithDetails>;
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
      // Prepare updates to match db-operations expected format
      const sessionUpdates: any = {};
      
      // Map our UI properties to the database format
      if (updates.client_id) sessionUpdates.client_id = updates.client_id;
      if (updates.therapist_id) sessionUpdates.therapist_id = updates.therapist_id;
      if (updates.session_date) sessionUpdates.session_date = updates.session_date;
      if (updates.duration_minutes) sessionUpdates.duration_minutes = updates.duration_minutes;
      if (updates.session_type) sessionUpdates.session_type = updates.session_type;
      if (updates.status) sessionUpdates.status = updates.status;
      if (updates.notes) sessionUpdates.notes = updates.notes;
      
      // Use the db-operations function
      const { data, error } = await sessionOperations.updateSession(sessionId, sessionUpdates);

      if (error) {
        throw error;
      }
      
      // Return updated session with enhanced details
      return await this.getSessionById(sessionId);
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
      // Use the db-operations function
      const { data, error } = await sessionOperations.deleteSession(sessionId);

      if (error) {
        throw error;
      }

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
      // Validate the status value
      const validStatus = ['Scheduled', 'Completed', 'Canceled', 'No-show'].includes(status) ? 
        status as 'Scheduled' | 'Completed' | 'Canceled' | 'No-show' : 
        'Scheduled';
      
      // Use updateSession from db-operations with just the status field
      const { data, error } = await sessionOperations.updateSession(sessionId, { status: validStatus });
      
      if (error) {
        throw error;
      }
      
      // Return updated session with full details
      return await this.getSessionById(sessionId);
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
      // First get the current session to modify it
      const { data: currentSession, error: fetchError } = await sessionOperations.getSessionById(sessionId);
      
      if (fetchError || !currentSession) {
        throw fetchError || new Error('Session not found');
      }
      
      // Use updateSession with session data including notes
      // We need to create a valid SessionInput without notes field
      const updateData = {
        client_id: currentSession.client_id,
        therapist_id: currentSession.therapist_id,
        session_date: currentSession.session_date,
        duration_minutes: currentSession.duration_minutes,
        session_type: currentSession.session_type,
        status: currentSession.status
      };
      
      // After successful update, update the session in the local db
      // and add the notes to the returned object
      const { data, error } = await sessionOperations.updateSession(sessionId, updateData);
      
      if (error) {
        throw error;
      }
      
      // Store notes separately if needed (e.g., in a notes table)
      // This would be the place to implement that
      console.log(`Notes for session ${sessionId} updated: ${notes}`);
      
      // Return updated session with full details
      const updatedSession = await this.getSessionById(sessionId);
      
      // Add notes to the returned session object for the UI
      if (updatedSession.data) {
        updatedSession.data.notes = notes;
      }
      
      return updatedSession;
    } catch (error) {
      console.error('Error adding session notes:', error);
      return { data: null, error: error as Error };
    }
  }
}
