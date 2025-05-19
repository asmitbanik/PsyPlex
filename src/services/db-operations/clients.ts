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
    
    // Use the therapist ID to create the client
    console.log(`Creating client with therapist ID: ${therapistId} for user ID: ${currentUserId}`);
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
 * Retrieves a specific client by their ID using admin client to bypass RLS
 * @param clientId UUID of the client
 * @returns The client data or an error
 */
export async function getClientById(clientId: string): Promise<DbResponse<Client>> {
  try {
    console.log('Fetching client with ID:', clientId);
    
    // Ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to view client details');
    }
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check environment variables');
    }
    
    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId);

    if (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
    
    // Return the first client if exists, or null if no clients found
    const client = data && data.length > 0 ? data[0] : null;
    
    if (!client) {
      console.warn(`No client found with ID: ${clientId}`);
    } else {
      console.log(`Successfully fetched client: ${client.first_name} ${client.last_name}`);
    }
    
    return { data: client, error: null };
  } catch (error) {
    console.error('Error fetching client:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all clients associated with a specific therapist
 * This function uses the admin client to bypass RLS policies if needed
 * @param therapistId UUID of the therapist or user ID
 * @returns Array of client objects or an error
 */
export async function getClientsByTherapistId(therapistId: string): Promise<DbResponse<Client[]>> {
  try {
    console.log('Fetching clients for therapist/user ID:', therapistId);
    
    // First ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to view clients');
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
      .from('clients')
      .select('*')
      .eq('therapist_id', actualTherapistId);

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} clients for therapist ID: ${actualTherapistId}`);
    
    // If this therapist ID didn't work and it's different from the provided one,
    // let's also try with the original therapist ID as a fallback
    if ((data?.length === 0) && actualTherapistId !== therapistId) {
      console.log(`No clients found with therapist ID ${actualTherapistId}, trying with original ID ${therapistId}`);
      
      const fallbackResult = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('therapist_id', therapistId);
      
      if (!fallbackResult.error && fallbackResult.data?.length > 0) {
        console.log(`Found ${fallbackResult.data.length} clients using fallback therapist ID`);
        return { data: fallbackResult.data, error: null };
      }
    }
    
    // Return the result from the main query
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching clients by therapist ID:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Get client with profile data
 * Used to retrieve a client with their profile data in a single request
 * @param clientId The ID of the client to retrieve
 * @returns The client with profile data
 */
export type ClientWithProfile = Client & {
  profile: any | null; // Using any for profile type since it's dynamic
};

/**
 * Get all clients with their profiles for a therapist
 * @param therapistId The ID of the therapist or user ID to get clients for
 * @returns Array of clients with their profiles
 */
export async function getClientsWithProfiles(therapistId: string): Promise<DbResponse<ClientWithProfile[]>> {
  try {
    // First check if the user is authenticated
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to view clients with profiles');
    }
    
    console.log('Getting clients with profiles for user/therapist ID:', therapistId);
    
    // Ensure admin client is available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available');
    }
    
    // First find the therapist record for this user
    const { data: therapists, error: therapistError } = await supabaseAdmin
      .from('therapists')
      .select('id')
      .eq('user_id', therapistId);
      
    if (therapistError) {
      console.error('Error finding therapist record:', therapistError);
      throw therapistError;
    }
    
    // If no therapist found, return empty array
    if (!therapists || therapists.length === 0) {
      console.warn(`No therapist record found for user ID: ${therapistId}`);
      return { data: [], error: null };
    }
    
    // Get the therapist ID from the first record
    const actualTherapistId = therapists[0].id;
    console.log(`Found therapist ID: ${actualTherapistId} for user ID: ${therapistId}`);
    
    // Fetch clients first
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('therapist_id', actualTherapistId);
    
    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }
    
    if (!clients || clients.length === 0) {
      console.log(`No clients found for therapist ID: ${actualTherapistId}`);
      return { data: [], error: null };
    }
    
    console.log(`Found ${clients.length} clients, now fetching profiles...`);
    
    // For each client, get its profile
    const clientsWithProfiles: ClientWithProfile[] = [];
    
    for (const client of clients) {
      try {
        // Get the profile
        const { data: profiles, error: profileError } = await supabaseAdmin
          .from('client_profiles')
          .select('*')
          .eq('client_id', client.id);
        
        if (profileError) {
          console.error(`Error fetching profile for client ${client.id}:`, profileError);
        }
        
        // Add client with profile (or null profile if none found)
        clientsWithProfiles.push({
          ...client,
          profile: (profiles && profiles.length > 0) ? profiles[0] : null
        });
      } catch (profileErr) {
        console.error(`Error processing profile for client ${client.id}:`, profileErr);
        // Still add the client, but with null profile
        clientsWithProfiles.push({
          ...client,
          profile: null
        });
      }
    }
    
    console.log(`Returning ${clientsWithProfiles.length} clients with profiles`);
    return { data: clientsWithProfiles, error: null };
  } catch (error) {
    console.error('Error fetching clients with profiles:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Updates an existing client's information using admin client to bypass RLS
 * @param clientId UUID of the client
 * @param updateData Partial client data to update
 * @returns The updated client or an error
 */
export async function updateClient(
  clientId: string, 
  updateData: Partial<ClientInput>
): Promise<DbResponse<Client>> {
  try {
    console.log('Updating client with ID:', clientId, 'with data:', updateData);
    
    // Ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to update clients');
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
    
    // First verify this client belongs to this therapist for security
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('therapist_id', therapist.id)
      .single();
    
    if (!clientData) {
      throw new Error('Client not found or does not belong to this therapist');
    }
    
    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updateDataWithTherapistId)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    
    console.log('Client updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error updating client:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a client using admin client to bypass RLS
 * @param clientId UUID of the client
 * @returns Success status or an error
 */
export async function deleteClient(clientId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    console.log('Deleting client with ID:', clientId);
    
    // Ensure we have authentication
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required to delete clients');
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
    
    console.log(`Using therapist ID: ${therapist.id} for client deletion check`);
    
    // First verify this client belongs to this therapist for security
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('therapist_id', therapist.id)
      .single();
    
    if (!clientData) {
      throw new Error('Client not found or does not belong to this therapist');
    }
    
    console.log(`Verified client ${clientId} belongs to therapist ${therapist.id}, proceeding with deletion`);
    
    // Use the admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
    
    console.log(`Client ${clientId} deleted successfully`);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { data: null, error: error as Error };
  }
}
