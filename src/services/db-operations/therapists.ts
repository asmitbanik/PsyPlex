import { supabase, DbResponse } from './supabaseClient';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// Create a service role client for admin operations that need to bypass RLS
// IMPORTANT: This should ONLY be used in secure server contexts
const createServiceRoleClient = () => {
  // Get environment variables for Supabase (make sure to use import.meta.env not process.env)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  // Log whether we have the service key (without revealing it)
  console.log('Service role configuration:', 
    `URL: ${supabaseUrl ? 'Present' : 'Missing'}`, 
    `Key: ${supabaseServiceKey ? 'Present' : 'Missing'}`
  );
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase service role configuration');
    throw new Error('Server configuration error - contact administrator');
  }
  
  // Create a new Supabase client with the service role key
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
};

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

    // Create a service role client that can bypass RLS policies
    const serviceClient = createServiceRoleClient();
    
    // Ensure user_id is set correctly to the authenticated user
    const dataToInsert = {
      ...therapistData,
      user_id: userId,  // Always use the authenticated user's ID
    };

    console.log('Inserting therapist with service role:', JSON.stringify(dataToInsert));

    // Use UPSERT instead of INSERT to handle race conditions
    // If another process created the therapist between our check and insert
    const { data, error } = await serviceClient
      .from('therapists')
      .upsert(dataToInsert, { 
        onConflict: 'user_id',  // If user_id exists, update the record
        ignoreDuplicates: false // Update if exists
      })
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
