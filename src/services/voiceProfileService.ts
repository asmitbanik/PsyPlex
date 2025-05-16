import { supabase } from '@/lib/supabase';
import { DbResponse } from '@/lib/supabase';

export interface VoiceProfile {
  id?: string;
  user_id: string;
  mfccProfile: number[];
  created_at?: string;
  updated_at?: string;
}

export const voiceProfileService = {
  /**
   * Get a voice profile for a user
   * @param userId The user ID
   * @returns The voice profile or null if not found
   */
  async getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
    try {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching voice profile:', error);
        return null;
      }

      return data as VoiceProfile;
    } catch (error) {
      console.error('Error in getVoiceProfile:', error);
      return null;
    }
  },

  /**
   * Save a voice profile for a user
   * @param profile The voice profile to save
   * @returns The saved profile or null if there was an error
   */
  async saveVoiceProfile(profile: VoiceProfile): Promise<VoiceProfile | null> {
    try {
      // Check if profile already exists
      const existing = await this.getVoiceProfile(profile.user_id);
      
      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from('voice_profiles')
          .update({
            mfccProfile: profile.mfccProfile,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating voice profile:', error);
          return null;
        }

        return data as VoiceProfile;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('voice_profiles')
          .insert([{
            user_id: profile.user_id,
            mfccProfile: profile.mfccProfile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating voice profile:', error);
          return null;
        }

        return data as VoiceProfile;
      }
    } catch (error) {
      console.error('Error in saveVoiceProfile:', error);
      return null;
    }
  },

  /**
   * Delete a voice profile
   * @param userId The user ID whose profile should be deleted
   * @returns True if successful, false otherwise
   */
  async deleteVoiceProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('voice_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting voice profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVoiceProfile:', error);
      return false;
    }
  }
};
