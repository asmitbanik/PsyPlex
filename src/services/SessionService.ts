import { DbResponse } from '@/lib/supabase';
import * as sessionOperations from '@/services/db-operations/sessions';
import * as clientOperations from '@/services/db-operations/clients';
import * as clientProfileOperations from '@/services/db-operations/clientProfiles';
import * as sessionNotesOperations from '@/services/db-operations/sessionNotes';

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

      // Check if there's an error
      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        throw sessionError;
      }

      // If no sessions found, return empty array
      if (!sessions || sessions.length === 0) {
        return { data: [], error: null } as DbResponse<SessionWithDetails[]>;
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
      console.error('Error in getSessions:', error);
      return { data: [], error: error as Error };
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
      // Use the db-operations function to get sessions
      const { data: sessions, error: sessionError } = await sessionOperations.getSessionsByClientId(clientId);

      // Check if there's an error
      if (sessionError) {
        console.error('Error fetching client sessions:', sessionError);
        throw sessionError;
      }

      // If no sessions found, return empty array
      if (!sessions || sessions.length === 0) {
        return { data: [], error: null } as DbResponse<SessionWithDetails[]>;
      }

      // Convert to SessionWithDetails objects
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
                first_name: clientData.first_name || '',
                last_name: clientData.last_name || '',
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

        // Add session time for backward compatibility
        if (session.session_date) {
          sessionWithDetails.session_time = this.formatTimeFromDate(session.session_date);
        }

        sessionsWithDetails.push(sessionWithDetails);
      }

      return { data: sessionsWithDetails, error: null } as DbResponse<SessionWithDetails[]>;
    } catch (error) {
      console.error('Error in getClientSessions:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string) {
    try {
      // Use the db-operations function to get the session
      const { data: session, error: sessionError } = await sessionOperations.getSessionById(sessionId);

      // Check if there's an error
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        throw sessionError;
      }

      // If no session found, throw error
      if (!session) {
        throw new Error(`Session with ID ${sessionId} not found`);
      }

      // Convert to SessionWithDetails object
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
              first_name: clientData.first_name || '',
              last_name: clientData.last_name || '',
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

      // Add session time for backward compatibility
      if (session.session_date) {
        sessionWithDetails.session_time = this.formatTimeFromDate(session.session_date);
      }

      // Try to get notes for the session
      try {
        const { data: notesData } = await sessionNotesOperations.getSessionNotesBySessionId(sessionId);
        
        if (notesData && notesData.length > 0) {
          // Use the most recent note
          sessionWithDetails.notes = notesData[0].content;
        }
      } catch (notesError) {
        console.error(`Error fetching notes for session ${sessionId}:`, notesError);
        // Continue even if we can't fetch notes
      }

      return { data: sessionWithDetails, error: null } as DbResponse<SessionWithDetails>;
    } catch (error) {
      console.error('Error in getSessionById:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Helper function to format time from a date string
   */
  formatTimeFromDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return ''; // Return empty string if can't parse date
    }
  }

  /**
   * Create a new session
   */
  async createSession(session: Partial<Session>) {
    try {
      // Verify we have the required session data
      if (!session.client_id) {
        throw new Error('Client ID is required to create a session');
      }

      if (!session.session_date) {
        throw new Error('Session date is required');
      }

      // Prepare session data for insertion
      const sessionInput = {
        client_id: session.client_id,
        therapist_id: session.therapist_id, // This will be set by the db operation if not provided
        session_date: session.session_date,
        duration_minutes: session.duration_minutes || 60,
        session_type: session.session_type || 'In-person',
        status: session.status || 'Scheduled'
      };

      // Use the db-operations function to create the session
      const { data, error } = await sessionOperations.createSession(sessionInput as any);

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      // If notes were provided, add them to the session
      if (session.notes && data) {
        try {
          const noteInput = {
            session_id: data.id,
            content: session.notes,
            created_by: data.therapist_id
          };

          await sessionNotesOperations.createSessionNote(noteInput as any);
        } catch (notesError) {
          console.error('Error adding notes to session:', notesError);
          // Continue even if adding notes fails
        }
      }

      return await this.getSessionById(data.id);
    } catch (error) {
      console.error('Error in createSession:', error);
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
      // Use the db-operations function to check if the session exists
      const { data: existingSession, error: checkError } = await sessionOperations.getSessionById(sessionId);

      if (checkError) {
        console.error('Error checking session existence:', checkError);
        throw checkError;
      }

      if (!existingSession) {
        throw new Error(`Session with ID ${sessionId} not found`);
      }

      // Prepare session data for update
      const sessionUpdates: any = {};
      
      if (updates.client_id) sessionUpdates.client_id = updates.client_id;
      if (updates.therapist_id) sessionUpdates.therapist_id = updates.therapist_id;
      if (updates.session_date) sessionUpdates.session_date = updates.session_date;
      if (updates.duration_minutes) sessionUpdates.duration_minutes = updates.duration_minutes;
      if (updates.session_type) sessionUpdates.session_type = updates.session_type;
      if (updates.status) sessionUpdates.status = updates.status;
      
      // Use the db-operations function
      const { data, error } = await sessionOperations.updateSession(sessionId, sessionUpdates);

      if (error) {
        console.error('Error updating session:', error);
        throw error;
      }
      
      // If notes were provided, update or create them
      if (updates.notes) {
        try {
          // Check for existing notes
          const { data: existingNotes } = await sessionNotesOperations.getSessionNotesBySessionId(sessionId);
          
          if (existingNotes && existingNotes.length > 0) {
            // Update the first note
            await sessionNotesOperations.updateSessionNote(existingNotes[0].id, {
              content: updates.notes
            });
          } else {
            // Create a new note
            await sessionNotesOperations.createSessionNote({
              session_id: sessionId,
              content: updates.notes,
              created_by: data?.therapist_id || existingSession.therapist_id
            } as any);
          }
        } catch (notesError) {
          console.error('Error updating session notes:', notesError);
          // Continue even if notes update fails
        }
      }
      
      // Return updated session with enhanced details
      return await this.getSessionById(sessionId);
    } catch (error) {
      console.error('Error in updateSession:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string) {
    try {
      // First try to delete any associated notes
      try {
        const { data: notes } = await sessionNotesOperations.getSessionNotesBySessionId(sessionId);
        
        if (notes && notes.length > 0) {
          for (const note of notes) {
            await sessionNotesOperations.deleteSessionNote(note.id);
          }
        }
      } catch (notesError) {
        console.warn('Error deleting session notes:', notesError);
        // Continue even if deleting notes fails
      }
      
      // Use the db-operations function to delete the session
      const { data, error } = await sessionOperations.deleteSession(sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        throw error;
      }

      return { data: { id: sessionId }, error: null } as DbResponse<{ id: string }>;
    } catch (error) {
      console.error('Error in deleteSession:', error);
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
        console.error('Error updating session status:', error);
        throw error;
      }
      
      // Return updated session with full details
      return await this.getSessionById(sessionId);
    } catch (error) {
      console.error('Error in updateSessionStatus:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add notes to a session
   */
  async addSessionNotes(sessionId: string, notes: string) {
    try {
      // First check if the session exists
      const { data: existingSession, error: checkError } = await sessionOperations.getSessionById(sessionId);
      
      if (checkError || !existingSession) {
        throw checkError || new Error(`Session with ID ${sessionId} not found`);
      }
      
      // Then check if notes already exist for this session
      const { data: existingNotes } = await sessionNotesOperations.getSessionNotesBySessionId(sessionId);
      
      if (existingNotes && existingNotes.length > 0) {
        // Update the existing note
        const { error: updateError } = await sessionNotesOperations.updateSessionNote(existingNotes[0].id, {
          content: notes
        });
        
        if (updateError) {
          console.error('Error updating session notes:', updateError);
          throw updateError;
        }
      } else {
        // Create a new note
        const { error: createError } = await sessionNotesOperations.createSessionNote({
          session_id: sessionId,
          content: notes,
          created_by: existingSession.therapist_id
        } as any);
        
        if (createError) {
          console.error('Error creating session notes:', createError);
          throw createError;
        }
      }
      
      // Return updated session with full details
      const updatedSession = await this.getSessionById(sessionId);
      
      // Ensure notes are included in the response
      if (updatedSession.data) {
        updatedSession.data.notes = notes;
      }
      
      return updatedSession;
    } catch (error) {
      console.error('Error in addSessionNotes:', error);
      return { data: null, error: error as Error };
    }
  }
}
