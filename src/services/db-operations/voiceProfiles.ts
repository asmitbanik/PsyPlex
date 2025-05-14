import { supabase, DbResponse } from './supabaseClient';

export type VoiceProfile = {
  id: string;
  client_id: string;
  mfcc_profile: Record<string, any>; // JSONB data with MFCC features
  created_at?: string;
  updated_at?: string;
};

export type VoiceProfileInput = Omit<VoiceProfile, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a voice profile for a client
 * @param profileData The voice profile data to create
 * @returns The created voice profile or an error
 */
export async function createVoiceProfile(profileData: VoiceProfileInput): Promise<DbResponse<VoiceProfile>> {
  try {
    const { data, error } = await supabase
      .from('voice_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating voice profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific voice profile by its ID
 * @param profileId UUID of the voice profile
 * @returns The voice profile or an error
 */
export async function getVoiceProfileById(profileId: string): Promise<DbResponse<VoiceProfile>> {
  try {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching voice profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves the voice profile for a specific client
 * @param clientId UUID of the client
 * @returns The voice profile or an error
 */
export async function getVoiceProfileByClientId(clientId: string): Promise<DbResponse<VoiceProfile>> {
  try {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching voice profile by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a voice profile
 * @param profileId UUID of the voice profile
 * @param updateData Partial voice profile data to update
 * @returns The updated voice profile or an error
 */
export async function updateVoiceProfile(
  profileId: string, 
  updateData: Partial<VoiceProfileInput>
): Promise<DbResponse<VoiceProfile>> {
  try {
    const { data, error } = await supabase
      .from('voice_profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating voice profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a voice profile
 * @param profileId UUID of the voice profile
 * @returns Success status or an error
 */
export async function deleteVoiceProfile(profileId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting voice profile:', error);
    return { data: null, error: error as Error };
  }
}
