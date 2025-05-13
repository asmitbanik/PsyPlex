import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientProfile = Database['public']['Tables']['client_profiles']['Row'];

export interface ClientWithProfile extends Client {
  profile?: ClientProfile;
  // Additional convenience fields
  name?: string;
  session_count?: number;
  last_session_date?: string;
}

export class ClientService extends BaseService<Client> {
  constructor() {
    super('clients');
  }

  /**
   * Get all clients for a therapist with their profiles
   * 
   * @param therapistId The ID of the therapist
   * @returns The list of clients with their profiles
   */
  async getClientsWithProfiles(therapistId: string): Promise<ServiceResponse<ClientWithProfile[]>> {
    try {
      const { data: clients, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          profile:client_profiles(*),
          sessions:sessions(
            created_at
          )
        `)
        .eq('therapist_id', therapistId);

      if (error) {
        return { data: null, error };
      }

      // Enrich the clients with computed fields
      const enrichedClients = clients?.map(client => {
        // Create full name from first and last name
        const name = `${client.first_name} ${client.last_name}`.trim();
        
        // Count sessions
        const sessions = client.sessions as any[] || [];
        const session_count = sessions.length;
        
        // Get last session date
        const sortedSessions = [...sessions].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const last_session_date = sortedSessions[0]?.created_at || null;
        
        // Remove the sessions array to avoid clutter
        const { sessions: _, ...clientData } = client;
        
        return {
          ...clientData,
          name,
          session_count,
          last_session_date
        } as ClientWithProfile;
      }) || [];

      return { 
        data: enrichedClients, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a single client by ID with their profile
   * 
   * @param clientId The ID of the client
   * @returns The client with their profile
   */
  async getClientWithProfile(clientId: string): Promise<ServiceResponse<ClientWithProfile>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          profile:client_profiles(*),
          sessions:sessions(
            created_at
          )
        `)
        .eq('id', clientId)
        .single();

      if (error) {
        return { data: null, error };
      }

      if (!data) {
        return { data: null, error: new Error('Client not found') };
      }

      // Create full name from first and last name
      const name = `${data.first_name} ${data.last_name}`.trim();
      
      // Count sessions
      const sessions = data.sessions as any[] || [];
      const session_count = sessions.length;
      
      // Get last session date
      const sortedSessions = [...sessions].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const last_session_date = sortedSessions[0]?.created_at || null;
      
      // Remove the sessions array to avoid clutter
      const { sessions: _, ...clientData } = data;
      
      return { 
        data: {
          ...clientData,
          name,
          session_count,
          last_session_date
        } as ClientWithProfile, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new client with profile
   * 
   * @param clientData The client data
   * @param profileData The profile data
   * @returns The created client
   */
  async createClientWithProfile(
    clientData: Partial<Client>, 
    profileData: Partial<ClientProfile>
  ): Promise<ServiceResponse<ClientWithProfile>> {
    try {
      // Start a transaction
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (clientError || !client) {
        return { data: null, error: clientError || new Error('Failed to create client') };
      }

      // Create the profile
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          ...profileData,
          client_id: client.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (profileError) {
        // If profile creation fails, delete the client to maintain consistency
        await supabase.from('clients').delete().eq('id', client.id);
        return { data: null, error: profileError };
      }

      return { 
        data: { ...client, profile } as unknown as ClientWithProfile, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update client and profile
   * 
   * @param clientId The ID of the client
   * @param clientData The client data to update
   * @param profileData The profile data to update
   * @returns The updated client with profile
   */
  async updateClientWithProfile(
    clientId: string,
    clientData: Partial<Client>,
    profileData: Partial<ClientProfile>,
    profileId?: string
  ): Promise<ServiceResponse<ClientWithProfile>> {
    try {
      // Update client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select('*')
        .single();

      if (clientError || !client) {
        return { data: null, error: clientError || new Error('Failed to update client') };
      }

      // Get profile ID
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('client_id', clientId)
        .single();

      if (existingProfile) {
        // Update profile
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select('*')
          .single();

        if (profileError) {
          return { data: null, error: profileError };
        }

        return { 
          data: { ...client, profile } as unknown as ClientWithProfile, 
          error: null 
        };
      } else {
        // Create profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('client_profiles')
          .insert({
            ...profileData,
            client_id: clientId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (profileError) {
          return { data: null, error: profileError };
        }

        return { 
          data: { ...client, profile } as unknown as ClientWithProfile, 
          error: null 
        };
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a client and its profile
   * 
   * @param clientId The ID of the client
   * @returns ServiceResponse with null data
   */
  async deleteClientWithProfile(clientId: string): Promise<ServiceResponse<null>> {
    try {
      // Delete related data (profile)
      await supabase
        .from('client_profiles')
        .delete()
        .eq('client_id', clientId);

      // Delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get clients by therapist ID
   * 
   * @param therapistId The ID of the therapist
   * @returns The list of clients
   */
  async getClientsByTherapist(therapistId: string): Promise<ServiceResponse<Client[]>> {
    return await this.getByFilter('therapist_id', therapistId);
  }
}
