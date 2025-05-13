import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionNote = Database['public']['Tables']['session_notes']['Row'];
export type SessionTranscript = Database['public']['Tables']['session_transcripts']['Row'];

export interface SessionWithDetails extends Session {
  client?: {
    first_name: string;
    last_name: string;
    status: string;
  };
  transcript?: SessionTranscript;
  notes?: SessionNote[];
}

export class SessionService extends BaseService<Session> {
  constructor() {
    super('sessions');
  }

  /**
   * Get all sessions for a therapist with client details
   * 
   * @param therapistId The ID of the therapist
   * @returns List of sessions with client details
   */
  async getSessionsByTherapist(therapistId: string): Promise<ServiceResponse<SessionWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(first_name, last_name, status),
          transcript:session_transcripts(*)
        `)
        .eq('therapist_id', therapistId);

      return {
        data: data as unknown as SessionWithDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all sessions for a client
   * 
   * @param clientId The ID of the client
   * @returns List of sessions
   */
  async getSessionsByClient(clientId: string): Promise<ServiceResponse<SessionWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(first_name, last_name, status),
          transcript:session_transcripts(*)
        `)
        .eq('client_id', clientId);

      return {
        data: data as unknown as SessionWithDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a single session with all details
   * 
   * @param sessionId The ID of the session
   * @returns The session with all details
   */
  async getSessionWithDetails(sessionId: string): Promise<ServiceResponse<SessionWithDetails>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(first_name, last_name, status),
          transcript:session_transcripts(*),
          notes:session_notes(*)
        `)
        .eq('id', sessionId)
        .single();

      return {
        data: data as unknown as SessionWithDetails,
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new session
   * 
   * @param sessionData The session data
   * @returns The created session
   */
  async createSession(sessionData: Partial<Session>): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as Session, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a session status
   * 
   * @param sessionId The ID of the session
   * @param status The new status
   * @returns The updated session
   */
  async updateSessionStatus(
    sessionId: string, 
    status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show'
  ): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select('*')
        .single();

      return { data: data as Session, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get upcoming sessions for a therapist
   * 
   * @param therapistId The ID of the therapist
   * @returns List of upcoming sessions
   */
  async getUpcomingSessions(therapistId: string): Promise<ServiceResponse<SessionWithDetails[]>> {
    try {
      // Get current date in ISO format
      const currentDate = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          client:clients(first_name, last_name, status)
        `)
        .eq('therapist_id', therapistId)
        .eq('status', 'Scheduled')
        .gte('session_date', currentDate)
        .order('session_date', { ascending: true });

      return {
        data: data as unknown as SessionWithDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
