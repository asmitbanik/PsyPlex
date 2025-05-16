import { supabase, DbResponse } from './supabaseClient';

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
 * Creates a new therapist record
 * @param therapistData The therapist data to create
 * @returns The created therapist or an error
 */
export async function createTherapist(therapistData: TherapistInput): Promise<DbResponse<Therapist>> {
  try {
    const { data, error } = await supabase
      .from('therapists')
      .insert(therapistData)
      .select()
      .single();

    if (error) throw error;
    
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
