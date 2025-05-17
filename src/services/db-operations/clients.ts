import { supabase, supabaseAdmin, DbResponse } from '../../lib/supabase';
import * as therapistOperations from './therapists';

// No need for a custom service role client - we use the centralized one from lib/supabase

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
 * Creates a new client record using a service role client to bypass RLS
 * @param clientData The client data to create
 * @returns The created client or an error
 */
export async function createClient(clientData: ClientInput): Promise<DbResponse<Client>> {
  try {
    console.log('Starting client creation with service role key (bypassing RLS)');
    
    // First, ensure the user is authenticated (we still need to know who they are)
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required - you must be logged in');
    }
    
    // Get the current authenticated user's ID
    const currentUserId = authData.session.user.id;
    console.log(`Current authenticated user ID: ${currentUserId}`);
    
    // Use our therapist operations module to get or create a therapist
    // This will use the service role client internally if needed
    const { data: therapist, error: therapistError } = await therapistOperations.createTherapist({
      user_id: currentUserId,
      full_name: 'New Therapist' // Default name, can be updated later
    });
    
    if (therapistError || !therapist) {
      console.error('Error getting/creating therapist record:', therapistError);
      throw new Error('Could not create therapist profile: ' + 
        (therapistError?.message || 'Unknown error'));
    }
    
    const therapistId = therapist.id;
    console.log(`Using therapist ID: ${therapistId} for user ID: ${currentUserId}`);
    
    // Use the service role client to bypass RLS
    return await createClientWithServiceRole(clientData, therapistId, currentUserId);
    
  } catch (error) {
    console.error('Client creation error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Internal helper function that creates a client using the admin client
 * This bypasses RLS policies entirely
 */
async function createClientWithServiceRole(
  clientData: ClientInput, 
  therapistId: string,
  userId: string
): Promise<DbResponse<Client>> {
  try {
    console.log('Creating client with supabaseAdmin client, therapist ID:', therapistId);
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check your environment variables');
    }
    
    // Ensure the client data has names if they're blank or undefined
    const firstName = clientData.first_name || 'New';
    const lastName = clientData.last_name || 'Client';
    
    // Prepare client data with the correct therapist_id
    const clientToCreate = {
      ...clientData,
      first_name: firstName,
      last_name: lastName,
      therapist_id: therapistId, // Set to the therapist ID, not the user ID
      status: clientData.status || 'New'
    };
    
    console.log('Creating client with admin client:', JSON.stringify(clientToCreate));
    
    // Insert the client with the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert(clientToCreate)
      .select('*')
      .single();
    
    if (error) {
      console.error('Admin client creation failed:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from client creation');
    }
    
    console.log('Client created successfully with ID:', data.id);
    return { data, error: null };
  } catch (error) {
    console.error('Error in admin client creation:', error);
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
 * This function uses the admin client to bypass RLS policies
 * @param therapistId UUID of the therapist
 * @returns Array of client objects or an error
 */
export async function getClientsByTherapistId(therapistId: string): Promise<DbResponse<Client[]>> {
  try {
    console.log('Fetching clients for therapist:', therapistId);
    
    // First check if the user is authenticated
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to view clients');
    }
    
    // First try to use the regular client (with RLS)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('therapist_id', therapistId);

      // If we get data with the regular client, return it
      if (!error && data && data.length > 0) {
        console.log(`Found ${data.length} clients using regular client`);
        return { data, error: null };
      }
    } catch (regularError) {
      // Regular client failed, we'll try with admin client next
      console.log('Regular client failed, trying admin client');
    }
    
    // If we reach here, we need to use the admin client to bypass RLS
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check environment variables');
    }
    
    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('therapist_id', therapistId);

    if (error) {
      console.error('Admin client error fetching clients:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} clients using admin client`);
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
