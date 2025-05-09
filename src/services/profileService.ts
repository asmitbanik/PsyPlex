interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  license: string;
  education: string;
  yearsOfExperience: string;
  languages: string;
  insuranceAccepted: string;
  emergencyContact: string;
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
      fullName: "Dr. Taylor Parker",
      email: "taylor.parker@psyplex.com",
      phone: "+1 (555) 123-4567",
      address: "123 Therapy Street, Medical District, NY 10001",
      specialization: "Clinical Psychology",
      license: "NY-PSY-12345",
      education: "Ph.D. in Clinical Psychology, Stanford University",
      yearsOfExperience: "12",
      languages: "English, Spanish",
      insuranceAccepted: "Blue Cross, Aetna, United Healthcare",
      emergencyContact: "+1 (555) 987-6543",
    };
  }
}

export const profileService = new ProfileService();
