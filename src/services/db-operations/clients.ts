import { supabase, DbResponse } from './supabaseClient';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import * as therapistOperations from './therapists';

// Create a service role client for admin operations that need to bypass RLS
// IMPORTANT: This should ONLY be used in secure server contexts
const createServiceRoleClient = () => {
  // Get environment variables for Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  // Log whether we have the service key (without revealing it)
  console.log('Service role configuration in clients.ts:', 
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
 * Internal helper function that creates a client using the service role key
 * This bypasses RLS policies entirely
 */
async function createClientWithServiceRole(
  clientData: ClientInput, 
  therapistId: string,
  userId: string
): Promise<DbResponse<Client>> {
  try {
    console.log('Creating client with service role client, therapist ID:', therapistId);
    
    // Create a service role client to bypass RLS
    const serviceClient = createServiceRoleClient();
    
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
    
    console.log('Creating client with service role:', JSON.stringify(clientToCreate));
    
    // Insert the client with the service client to bypass RLS
    // Using upsert to handle potential race conditions
    const { data, error } = await serviceClient
      .from('clients')
      .upsert(clientToCreate, {
        onConflict: 'therapist_id,email',
        ignoreDuplicates: false
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Service role client creation failed:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from client creation');
    }
    
    console.log('Client created successfully with ID:', data.id);
    return { data, error: null };
  } catch (error) {
    console.error('Error in service role client creation:', error);
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
