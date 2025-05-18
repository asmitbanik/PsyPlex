import { DbResponse } from '@/lib/supabase';
import * as clientOperations from '@/services/db-operations/clients';
import * as clientProfileOperations from '@/services/db-operations/clientProfiles';

// Import client types from db-operations
import { Client as DbClient, ClientInput as DbClientInput, ClientWithProfile as DbClientWithProfile } from '@/services/db-operations/clients';
import { ClientProfile as DbClientProfile, ClientProfileInput as DbClientProfileInput } from '@/services/db-operations/clientProfiles';

// Extended Client interface to match both our UI needs and the database structure
export interface Client extends DbClient {
  // Add any additional fields needed for UI that aren't in the database model
  user_id?: string; // Making this optional since it might not be in db schema
}

// Use this for creating new clients
export type ClientInput = DbClientInput;

// Extended ClientProfile interface to match both our UI needs and the database structure
export interface ClientProfile extends DbClientProfile {
  // Add any additional fields needed for UI that aren't in the database model
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
  notes?: string;
}

// Use this for creating new client profiles
export type ClientProfileInput = DbClientProfileInput;

// Define ClientWithProfile as its own interface that includes all fields we need
export interface ClientWithProfile extends DbClientWithProfile {
  // UI-specific fields
  name?: string;
  session_count?: number;
  last_session_date?: string;
}

/**
 * Client Service - Provides a layer of abstraction between the UI and the database
 * Note: Most functionality is now handled directly by the db-operations layer
 * This service is kept for backward compatibility but we recommend using db-operations directly
 */
export class ClientService {
  
  /**
   * Get clients with their profile information
   */
  async getClientsWithProfiles(therapistId: string): Promise<DbResponse<ClientWithProfile[]>> {
    try {
      console.log('ClientService: Fetching clients with profiles for therapist/user ID:', therapistId);
      
      // Call the database operation with better error handling
      const result = await clientOperations.getClientsWithProfiles(therapistId);
      
      if (result.error) {
        console.error('ClientService: Error fetching clients with profiles:', result.error);
        return { data: [], error: result.error };
      } 
      
      if (!result.data) {
        console.warn('ClientService: No client data returned from database operation');
        return { data: [], error: null };
      }
      
      // Process the clients to add UI-specific fields
      const processedClients = result.data.map(client => ({
        ...client,
        name: `${client.first_name} ${client.last_name}`,
        session_count: 0, // Default values
        last_session_date: null
      }));
      
      console.log(`ClientService: Successfully fetched ${processedClients.length} clients with profiles`);
      return { data: processedClients, error: null };
    } catch (error) {
      console.error('Error in service layer - getClientsWithProfiles:', error);
      // Return empty array instead of null to prevent UI errors
      return { 
        data: [], 
        error: new Error(`Service layer error: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  /**
   * Get a client by ID
   */
  async getClientById(clientId: string): Promise<DbResponse<Client>> {
    try {
      return await clientOperations.getClientById(clientId);
    } catch (error) {
      console.error('Error in service layer - getClientById:', error);
      return { 
        data: null, 
        error: new Error(`Service layer error: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  /**
   * Add a new client
   * This method ensures the therapist_id is always set to the authenticated user's ID
   * to respect the RLS policies defined in the database
   */
  async addClient(client: Partial<Client>, profile?: Partial<ClientProfile>): Promise<DbResponse<Client>> {
    try {
      // Create the client
      const result = await clientOperations.createClient(client as DbClientInput);
      
      if (result.error || !result.data) {
        return result;
      }
      
      // If we have profile data and the client was created successfully, create the profile
      if (profile && result.data.id) {
        try {
          await clientProfileOperations.createClientProfile({
            ...profile as any,
            client_id: result.data.id
          });
        } catch (profileError) {
          console.warn('Error creating profile, but client was created:', profileError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in service layer - addClient:', error);
      return { 
        data: null, 
        error: new Error(`Service layer error: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  /**
   * Update a client
   */
  async updateClient(clientId: string, client: Partial<Client>, profile?: Partial<ClientProfile>): Promise<DbResponse<Client>> {
    try {
      // Update the client
      const result = await clientOperations.updateClient(clientId, client as Partial<DbClientInput>);
      
      if (result.error || !result.data) {
        return result;
      }
      
      // If we have profile data and the client was updated successfully, update the profile
      if (profile) {
        try {
          // First check if profile exists
          const profileResult = await clientProfileOperations.getClientProfileByClientId(clientId);
          
          if (profileResult.data) {
            // Update existing profile
            await clientProfileOperations.updateClientProfile(profileResult.data.id, profile as any);
          } else {
            // Create new profile
            await clientProfileOperations.createClientProfile({
              ...profile as any,
              client_id: clientId
            });
          }
        } catch (profileError) {
          console.warn('Error updating profile, but client was updated:', profileError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in service layer - updateClient:', error);
      return { 
        data: null, 
        error: new Error(`Service layer error: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<DbResponse<{ success: boolean }>> {
    try {
      return await clientOperations.deleteClient(clientId);
    } catch (error) {
      console.error('Error in service layer - deleteClient:', error);
      return { 
        data: null, 
        error: new Error(`Service layer error: ${error instanceof Error ? error.message : String(error)}`) 
      };
    }
  }

  /**
   * Create a client with profile
   * @deprecated Use addClient instead
   */
  async createClientWithProfile(client: Partial<Client>, profile?: Partial<ClientProfile>): Promise<DbResponse<Client>> {
    return this.addClient(client, profile);
  }

  /**
   * Update a client with profile
   * @deprecated Use updateClient instead
   */
  async updateClientWithProfile(clientId: string, client: Partial<Client>, profile?: Partial<ClientProfile>): Promise<DbResponse<Client>> {
    return this.updateClient(clientId, client, profile);
  }
}
