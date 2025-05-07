export interface VoiceProfile {
  userId: string;
  mfccProfile: number[];
  createdAt: Date;
  updatedAt: Date;
}

class VoiceProfileService {
  private static instance: VoiceProfileService;
  private currentProfile: VoiceProfile | null = null;
  private readonly STORAGE_KEY = 'voice_profiles';

  private constructor() {}

  static getInstance(): VoiceProfileService {
    if (!VoiceProfileService.instance) {
      VoiceProfileService.instance = new VoiceProfileService();
    }
    return VoiceProfileService.instance;
  }

  private getStoredProfiles(): Record<string, VoiceProfile> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return {};
    
    const profiles = JSON.parse(stored);
    // Convert string dates back to Date objects
    return Object.entries(profiles).reduce((acc, [key, value]: [string, any]) => ({
      ...acc,
      [key]: {
        ...value,
        createdAt: new Date(value.createdAt),
        updatedAt: new Date(value.updatedAt)
      }
    }), {});
  }

  private saveProfiles(profiles: Record<string, VoiceProfile>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
  }

  async saveVoiceProfile(userId: string, mfccProfile: number[]): Promise<void> {
    try {
      const profiles = this.getStoredProfiles();
      const now = new Date();

      profiles[userId] = {
        userId,
        mfccProfile,
        createdAt: profiles[userId]?.createdAt || now,
        updatedAt: now
      };

      this.saveProfiles(profiles);

      // Update current profile
      this.currentProfile = profiles[userId];
    } catch (error) {
      console.error('Error saving voice profile:', error);
      throw new Error('Failed to save voice profile');
    }
  }

  async getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
    try {
      // Check if we already have the profile in memory
      if (this.currentProfile?.userId === userId) {
        return this.currentProfile;
      }

      const profiles = this.getStoredProfiles();
      const profile = profiles[userId];

      if (profile) {
        this.currentProfile = profile;
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching voice profile:', error);
      throw new Error('Failed to fetch voice profile');
    }
  }

  clearCurrentProfile(): void {
    this.currentProfile = null;
  }
}

export const voiceProfileService = VoiceProfileService.getInstance(); 