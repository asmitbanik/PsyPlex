export interface ProfileData {
  profilePicture?: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  languages: string;
  bio?: string;
}

class ProfileService {
  private storageKey = 'therapist_profile';

  getProfile(): ProfileData | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  updateProfile(profile: ProfileData): void {
    localStorage.setItem(this.storageKey, JSON.stringify(profile));
  }

  getInitialProfile(): ProfileData {
    return {
      profilePicture: "",
      fullName: "Dr. Taylor Parker",
      email: "taylor.parker@psyplex.com",
      phone: "+1 (555) 123-4567",
      specialization: "Clinical Psychology",
      languages: "English, Spanish",
      bio: "Experienced clinical psychologist specializing in cognitive behavioral therapy and trauma-informed care. I work with individuals facing anxiety, depression, trauma, and relationship challenges.",
    };
  }
}

export const profileService = new ProfileService();
