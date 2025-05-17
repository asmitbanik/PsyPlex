import { supabase, supabaseAdmin, DbResponse } from '../../lib/supabase';

// No need to create a separate service role client - now using the centralized one from lib/supabase

export type Therapist = {
  id: string;
  user_id: string;
  full_name?: string;
  credentials?: string;
  specialties?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type TherapistInput = Omit<Therapist, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a new therapist record using the service role client to bypass RLS
 * @param therapistData The therapist data to create
 * @returns The created therapist or an error
 */
export async function createTherapist(therapistData: TherapistInput): Promise<DbResponse<Therapist>> {
  try {
    console.log('Starting therapist creation with service role to bypass RLS');
    
    // First check to make sure we're authenticated to get the user ID
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session check:', authData?.session ? 'Session exists' : 'No session');
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!authData.session) {
      console.error('No authentication session found');
      throw new Error('Authentication required - no active session');
    }

    // Get current user to verify identity
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User fetch error:', userError);
      throw new Error(`Failed to get user data: ${userError.message}`);
    }
    
    if (!userData.user) {
      console.error('No user found in session');
      throw new Error('Authentication required - no user found');
    }
    
    const userId = userData.user.id;
    console.log('Authenticated user ID:', userId);

    // Check if a therapist record already exists for this user
    // We'll use the regular client first to check
    const { data: existingTherapist, error: existingError } = await supabase
      .from('therapists')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingTherapist) {
      console.log('Therapist record already exists with ID:', existingTherapist.id);
      return { data: existingTherapist as Therapist, error: null };
    }

    // No existing therapist, create a new one with service role client
    console.log('No existing therapist found. Creating with service role client');

    // Ensure we have a supabaseAdmin client to bypass RLS
    if (!supabaseAdmin) {
      throw new Error('Service role client not available - check your environment variables');
    }
    
    // Ensure user_id is set correctly to the authenticated user
    const dataToInsert = {
      ...therapistData,
      user_id: userId,  // Always use the authenticated user's ID
    };

    console.log('Inserting therapist with admin client:', JSON.stringify(dataToInsert));

    // Use the admin client to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('therapists')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Therapist creation failed with service role:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from therapist creation');
    }
    
    console.log('Therapist created successfully with ID:', data.id);
    return { data, error: null };
  } catch (error) {
    console.error('Error creating therapist:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific therapist by their ID
 * @param therapistId UUID of the therapist
 * @returns The therapist data or an error
 */
export async function getTherapistById(therapistId: string): Promise<DbResponse<Therapist>> {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('id', therapistId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching therapist:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific therapist by their user_id
 * @param userId UUID from auth.users
 * @returns The therapist data or an error
 */
export async function getTherapistByUserId(userId: string): Promise<DbResponse<Therapist>> {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching therapist by user ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing therapist's information
 * @param therapistId UUID of the therapist
 * @param updateData Partial therapist data to update
 * @returns The updated therapist or an error
 */
export async function updateTherapist(
  therapistId: string, 
  updateData: Partial<TherapistInput>
): Promise<DbResponse<Therapist>> {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .update(updateData)
      .eq('id', therapistId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating therapist:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a therapist
 * @param therapistId UUID of the therapist
 * @returns Success status or an error
 */
export async function deleteTherapist(therapistId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('therapists')
      .delete()
      .eq('id', therapistId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting therapist:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Gets all therapists
 * @returns Array of therapists or an error
 */
export async function getAllTherapists(): Promise<DbResponse<Therapist[]>> {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .select('*');

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching all therapists:', error);
    return { data: null, error: error as Error };
  }
}
