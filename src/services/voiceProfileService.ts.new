import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type VoiceProfile = Database['public']['Tables']['voice_profiles']['Row'];

export interface OldVoiceProfile {
  userId: string;
  mfccProfile: number[];
  createdAt: Date;
  updatedAt: Date;
}

export class VoiceProfileService extends BaseService<VoiceProfile> {
  private static instance: VoiceProfileService;
  private currentProfile: VoiceProfile | null = null;

  private constructor() {
    super('voice_profiles');
  }

  static getInstance(): VoiceProfileService {
    if (!VoiceProfileService.instance) {
      VoiceProfileService.instance = new VoiceProfileService();
    }
    return VoiceProfileService.instance;
  }

  /**
   * Get profile by client ID
   */
  async getProfileByClientId(clientId: string): Promise<ServiceResponse<VoiceProfile>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (data) {
        this.currentProfile = data as VoiceProfile;
      }

      return { data: data as VoiceProfile, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Save voice profile
   */
  async saveVoiceProfile(clientId: string, mfccProfile: number[]): Promise<ServiceResponse<VoiceProfile>> {
    try {
      // Check if profile exists
      const { data: existingProfile } = await this.getProfileByClientId(clientId);

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            mfcc_profile: mfccProfile,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select('*')
          .single();

        if (data) {
          this.currentProfile = data as VoiceProfile;
        }

        return { data: data as VoiceProfile, error };
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from(this.tableName)
          .insert({
            client_id: clientId,
            mfcc_profile: mfccProfile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (data) {
          this.currentProfile = data as VoiceProfile;
        }

        return { data: data as VoiceProfile, error };
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Compare voice profiles
   */
  async compareVoiceProfiles(mfccProfile: number[], clientId: string): Promise<number> {
    try {
      const { data: storedProfile } = await this.getProfileByClientId(clientId);
      
      if (!storedProfile) {
        return 0; // No match if no profile exists
      }
      
      // Simple Euclidean distance calculation - in reality, you would use a more sophisticated algorithm
      const storedMfcc = storedProfile.mfcc_profile as unknown as number[];
      const length = Math.min(mfccProfile.length, storedMfcc.length);
      let sum = 0;
      
      for (let i = 0; i < length; i++) {
        const diff = mfccProfile[i] - storedMfcc[i];
        sum += diff * diff;
      }
      
      // Convert to similarity score (0-1, where 1 is most similar)
      const distance = Math.sqrt(sum);
      const similarity = 1 / (1 + distance);
      
      return similarity;
    } catch (error) {
      console.error('Error comparing voice profiles:', error);
      return 0;
    }
  }

  /**
   * Get current profile
   */
  getCurrentProfile(): VoiceProfile | null {
    return this.currentProfile;
  }

  /**
   * Clear current profile
   */
  clearCurrentProfile(): void {
    this.currentProfile = null;
  }
}

// Export singleton instance
export const voiceProfileService = VoiceProfileService.getInstance();
