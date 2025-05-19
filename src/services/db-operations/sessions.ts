import { supabase, supabaseAdmin, DbResponse } from '../../lib/supabase';
import * as therapistOperations from './therapists';

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
 * Schedules a new session using a service role client to bypass RLS
 * @param sessionData The session data to create
 * @returns The created session or an error
 */
export async function createSession(sessionData: SessionInput): Promise<DbResponse<Session>> {
  try {
    console.log('Starting session creation with service role key (bypassing RLS)');
    
    // First, ensure the user is authenticated (we still need to know who they are)
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required - you must be logged in');
    }
    
    // Get the current authenticated user's ID
    const currentUserId = authData.session.user.id;
    console.log(`Current authenticated user ID: ${currentUserId}`);
    
    // First, let's try to find an existing therapist for this user
    const { data: existingTherapists } = await supabaseAdmin
      .from('therapists')
      .select('*')
      .eq('user_id', currentUserId);
    
    let therapistId: string;
    
    // If we already have therapist(s) for this user, use the first one
    if (existingTherapists && existingTherapists.length > 0) {
      therapistId = existingTherapists[0].id;
      console.log(`Using existing therapist ID: ${therapistId} for user ID: ${currentUserId}`);
      
      // Log if there are multiple therapists (unusual situation)
      if (existingTherapists.length > 1) {
        console.warn(`User ${currentUserId} has ${existingTherapists.length} therapist records. Using ID: ${therapistId}`);
      }
    } else {
      // If no therapist exists, create one using therapistOperations
      const { data: newTherapist, error: therapistError } = await therapistOperations.createTherapist({
        user_id: currentUserId,
        full_name: 'New Therapist' // Default name, can be updated later
      });
      
      if (therapistError || !newTherapist) {
        console.error('Error creating therapist record:', therapistError);
        throw new Error('Could not create therapist profile: ' + 
          (therapistError?.message || 'Unknown error'));
      }
      
      therapistId = newTherapist.id;
      console.log(`Created new therapist with ID: ${therapistId} for user ID: ${currentUserId}`);
    }
    
    // Ensure the therapist_id in the session data matches the authenticated user's therapist ID
    // This is crucial for RLS policies even when using the admin client
    const sessionWithCorrectTherapistId = {
      ...sessionData,
      therapist_id: therapistId
    };
    
    // Use the admin client to bypass RLS
    console.log(`Creating session with therapist ID: ${therapistId} for user ID: ${currentUserId}`);
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check your environment variables');
    }
    
    // Insert the session record using the admin client
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert(sessionWithCorrectTherapistId)
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
 * This function uses the admin client to bypass RLS policies if needed
 * @param therapistId UUID of the therapist or user ID
 * @returns Array of session objects or an error
 */
export async function getSessionsByTherapistId(therapistId: string): Promise<DbResponse<Session[]>> {
  try {
    console.log('Fetching sessions for therapist/user ID:', therapistId);
    
    // First ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to view sessions');
    }
    
    const userId = authData.session.user.id;
    console.log('Current authenticated user ID:', userId);
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check environment variables');
    }
    
    // First find all therapist records for this user (may have multiple)
    const { data: therapists, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .select('*')
      .eq('user_id', userId);
    
    if (therapistError) {
      console.error('Error fetching therapist records:', therapistError);
      // We'll still try to proceed with the provided therapistId
    }
    
    // Get the first therapist record if there are any
    const therapist = therapists && therapists.length > 0 ? therapists[0] : null;
    
    if (therapists && therapists.length > 1) {
      console.warn(`Found ${therapists.length} therapist records for user ID ${userId}, using the first one: ${therapist?.id}`);
    }
    
    // Use the found therapist ID if available, otherwise use the provided ID
    const actualTherapistId = therapist?.id || therapistId;
    console.log(`Using therapist ID: ${actualTherapistId} for query`);
    
    // Use the admin client to bypass RLS consistently
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('therapist_id', actualTherapistId)
      .order('session_date', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} sessions for therapist ID: ${actualTherapistId}`);
    
    // If this therapist ID didn't work and it's different from the provided one,
    // let's also try with the original therapist ID as a fallback
    if ((data?.length === 0) && actualTherapistId !== therapistId) {
      console.log(`No sessions found with therapist ID ${actualTherapistId}, trying with original ID ${therapistId}`);
      
      const fallbackResult = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('session_date', { ascending: false });
      
      if (!fallbackResult.error && fallbackResult.data?.length > 0) {
        console.log(`Found ${fallbackResult.data.length} sessions using fallback therapist ID`);
        return { data: fallbackResult.data, error: null };
      }
    }
    
    // Return the result from the main query
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching sessions by therapist ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing session's details using admin client to bypass RLS
 * @param sessionId UUID of the session
 * @param updateData Partial session data to update
 * @returns The updated session or an error
 */
export async function updateSession(
  sessionId: string, 
  updateData: Partial<SessionInput>
): Promise<DbResponse<Session>> {
  try {
    console.log('Updating session with ID:', sessionId, 'with data:', updateData);
    
    // Ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to update sessions');
    }
    
    const userId = authData.session.user.id;
    console.log('Current authenticated user ID:', userId);
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check environment variables');
    }
    
    // Get the therapist ID for this user
    const { data: therapists } = await supabaseAdmin
      .from('therapists')
      .select('*')
      .eq('user_id', userId);
    
    const therapist = therapists && therapists.length > 0 ? therapists[0] : null;
    
    if (!therapist) {
      throw new Error('No therapist record found for the current user');
    }
    
    // Ensure the therapist_id in the update data matches the current user's therapist ID
    const updateDataWithTherapistId = {
      ...updateData,
      therapist_id: therapist.id
    };
    
    console.log(`Using therapist ID: ${therapist.id} for update`);
    
    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update(updateDataWithTherapistId)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating session:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a session using admin client to bypass RLS
 * @param sessionId UUID of the session
 * @returns Success status or an error
 */
export async function deleteSession(sessionId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    console.log('Deleting session with ID:', sessionId);
    
    // Ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to delete sessions');
    }
    
    const userId = authData.session.user.id;
    console.log('Current authenticated user ID:', userId);
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check environment variables');
    }
    
    // First verify this session belongs to this therapist's clients for security
    const { data: therapists } = await supabaseAdmin
      .from('therapists')
      .select('*')
      .eq('user_id', userId);
    
    const therapist = therapists && therapists.length > 0 ? therapists[0] : null;
    
    if (!therapist) {
      throw new Error('No therapist record found for the current user');
    }
    
    // Verify the session belongs to this therapist
    const { data: sessionData } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('therapist_id', therapist.id)
      .single();
    
    if (!sessionData) {
      throw new Error('Session not found or does not belong to this therapist');
    }
    
    // Use the admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
    
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
