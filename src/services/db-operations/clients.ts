import { supabase, DbResponse } from './supabaseClient';

export type Client = {
  id: string;
  therapist_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'New';
  created_at?: string;
  updated_at?: string;
};

export type ClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a new client record
 * @param clientData The client data to create
 * @returns The created client or an error
 */
export async function createClient(clientData: ClientInput): Promise<DbResponse<Client>> {
  try {
    // First check to make sure we're authenticated
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      throw new Error('Authentication required');
    }

    // Make sure therapist_id is set to the current user's ID if not provided
    const dataToInsert = {
      ...clientData,
      // If therapist_id is not provided, use the current user's ID
      therapist_id: clientData.therapist_id || userData.user.id,
    };

    console.log('Creating client with data:', dataToInsert);

    // Perform the insert
    const { data, error } = await supabase
      .from('clients')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Insert error details:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating client:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific client by their ID
 * @param clientId UUID of the client
 * @returns The client data or an error
 */
export async function getClientById(clientId: string): Promise<DbResponse<Client>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all clients associated with a specific therapist
 * @param therapistId UUID of the therapist
 * @returns Array of client objects or an error
 */
export async function getClientsByTherapistId(therapistId: string): Promise<DbResponse<Client[]>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('therapist_id', therapistId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching clients by therapist ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing client's information
 * @param clientId UUID of the client
 * @param updateData Partial client data to update
 * @returns The updated client or an error
 */
export async function updateClient(
  clientId: string, 
  updateData: Partial<ClientInput>
): Promise<DbResponse<Client>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating client:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a client
 * @param clientId UUID of the client
 * @returns Success status or an error
 */
export async function deleteClient(clientId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { data: null, error: error as Error };
  }
}
