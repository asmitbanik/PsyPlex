import { supabase, DbResponse } from './supabaseClient';

export type ClientProfile = {
  id: string;
  client_id: string;
  date_of_birth?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  primary_concerns?: string[];
  therapy_type?: string;
  start_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type ClientProfileInput = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a client profile
 * @param profileData The profile data to create
 * @returns The created client profile or an error
 */
export async function createClientProfile(profileData: ClientProfileInput): Promise<DbResponse<ClientProfile>> {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating client profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves the profile for a specific client
 * @param clientId UUID of the client
 * @returns The client profile or an error
 */
export async function getClientProfileByClientId(clientId: string): Promise<DbResponse<ClientProfile>> {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific client profile by its ID
 * @param profileId UUID of the client profile
 * @returns The client profile or an error
 */
export async function getClientProfileById(profileId: string): Promise<DbResponse<ClientProfile>> {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client profile by ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a client's profile
 * @param profileId UUID of the client profile record
 * @param updateData Partial client profile data to update
 * @returns The updated client profile or an error
 */
export async function updateClientProfile(
  profileId: string, 
  updateData: Partial<ClientProfileInput>
): Promise<DbResponse<ClientProfile>> {
  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating client profile:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a client profile
 * @param profileId UUID of the profile
 * @returns Success status or an error
 */
export async function deleteClientProfile(profileId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('client_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting client profile:', error);
    return { data: null, error: error as Error };
  }
}
