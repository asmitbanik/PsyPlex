import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type Therapist = Database['public']['Tables']['therapists']['Row'];

export class TherapistService extends BaseService<Therapist> {
  constructor() {
    super('therapists');
  }

  /**
   * Get therapist by user ID
   * 
   * @param userId The ID of the user in the auth table
   * @returns The therapist record
   */
  async getByUserId(userId: string): Promise<ServiceResponse<Therapist>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data: data as Therapist, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update therapist profile
   * 
   * @param userId The ID of the user in the auth table
   * @param data The therapist data to update
   * @returns The updated therapist record
   */
  async updateProfile(userId: string, data: Partial<Therapist>): Promise<ServiceResponse<Therapist>> {
    try {
      // First get the therapist ID
      const { data: therapist, error: getError } = await this.getByUserId(userId);
      
      if (getError || !therapist) {
        return { data: null, error: getError || new Error('Therapist not found') };
      }
      
      // Now update the therapist record
      const { data: updatedTherapist, error: updateError } = await supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', therapist.id)
        .select('*')
        .single();

      return { data: updatedTherapist as Therapist, error: updateError };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new therapist profile for a user
   * 
   * @param data The therapist data
   * @returns The created therapist record
   */
  async createTherapistProfile(data: Partial<Therapist>): Promise<ServiceResponse<Therapist>> {
    try {
      const { data: newTherapist, error } = await supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: newTherapist as Therapist, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
