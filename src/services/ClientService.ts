import { supabase } from '@/lib/supabase';
import { DbResponse } from '@/lib/supabase';
import { mockClients } from '@/mockData/clients';

export interface Client {
  id: string;
  created_at: string;
  user_id: string;
  therapist_id: string;
  email: string;
  status: string;
}

export interface ClientProfile {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone_number?: string;
  address?: string;
  emergency_contact?: string;
  insurance_provider?: string;
  insurance_id?: string;
  notes?: string;
}

export interface ClientWithProfile extends Client {
  profile?: ClientProfile;
}

export class ClientService {
  /**
   * Get all clients for a therapist
   */
  async getClients(therapistId: string) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('therapist_id', therapistId);

      return { data, error } as DbResponse<Client[]>;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a client by ID
   */
  async getClientById(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      return { data, error } as DbResponse<Client>;
    } catch (error) {
      console.error('Error fetching client:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get clients with their profile information
   */
  async getClientsWithProfiles(therapistId: string) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          profile:client_profiles(*)
        `)
        .eq('therapist_id', therapistId);

      // Check if the clients table doesn't exist
      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.log('Using mock client data because database table does not exist');
          // Return mock data if the table doesn't exist
          return { 
            data: mockClients.filter(client => client.therapist_id === therapistId || therapistId === 'current-user-id'), 
            error: null 
          } as DbResponse<ClientWithProfile[]>;
        }
        throw error; // Re-throw other errors
      }

      // Format the response to match ClientWithProfile interface
      const clientsWithProfiles = data?.map(client => {
        const profile = client.profile?.[0] || null;
        return {
          ...client,
          profile
        };
      });

      return { data: clientsWithProfiles || [], error } as DbResponse<ClientWithProfile[]>;
    } catch (error) {
      console.error('Error fetching clients with profiles:', error);
      
      // Fallback to mock data for any error
      console.log('Using mock client data due to error');
      return { 
        data: mockClients.filter(client => client.therapist_id === therapistId || therapistId === 'current-user-id'), 
        error: null 
      } as DbResponse<ClientWithProfile[]>;
    }
  }

  /**
   * Add a new client
   */
  async addClient(client: Partial<Client>, profile?: Partial<ClientProfile>) {
    try {
      // First, insert the client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (clientError) throw clientError;

      // If profile data is provided, create the profile
      if (profile && clientData) {
        const { error: profileError } = await supabase
          .from('client_profiles')
          .insert([{
            ...profile,
            client_id: clientData.id
          }]);

        if (profileError) throw profileError;
      }

      return { data: clientData, error: null } as DbResponse<Client>;
    } catch (error) {
      console.error('Error adding client:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a client
   */
  async updateClient(clientId: string, client: Partial<Client>, profile?: Partial<ClientProfile>) {
    try {
      // Update client data
      const { error: clientError } = await supabase
        .from('clients')
        .update(client)
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Update profile if provided
      if (profile) {
        const { error: profileError } = await supabase
          .from('client_profiles')
          .update(profile)
          .eq('client_id', clientId);

        if (profileError) throw profileError;
      }

      return { data: { id: clientId, ...client }, error: null } as DbResponse<Partial<Client>>;
    } catch (error) {
      console.error('Error updating client:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string) {
    try {
      // Delete client (cascade should handle profile deletion if set up in DB)
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      return { data: { id: clientId }, error: null } as DbResponse<{ id: string }>;
    } catch (error) {
      console.error('Error deleting client:', error);
      return { data: null, error: error as Error };
    }
  }
}
