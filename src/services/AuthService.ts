import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { ServiceResponse } from './db/DatabaseService';
import { TherapistService } from './TherapistService';

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    role?: string;
  };
}

export interface AuthSession extends Session {
  user: AuthUser;
}

export class AuthService {
  private therapistService: TherapistService;

  constructor(therapistService: TherapistService) {
    this.therapistService = therapistService;
  }
  
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<ServiceResponse<AuthSession>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if the user has a therapist profile
      const userId = data.user?.id;
      if (userId) {
        const { data: therapist } = await this.therapistService.getByUserId(userId);
        
        // If no therapist profile, create one
        if (!therapist && data.user) {
          await this.therapistService.create({
            user_id: userId,
            full_name: data.user.user_metadata.full_name || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      return { data: data.session as AuthSession, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string, 
    password: string, 
    metadata: { full_name?: string } = {}
  ): Promise<ServiceResponse<AuthSession>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      // For new accounts, create a therapist profile
      if (data.user) {
        await this.therapistService.create({
          user_id: data.user.id,
          full_name: metadata.full_name || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return { data: data.session as AuthSession, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<ServiceResponse<AuthSession>> {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { 
        data: data.session as AuthSession, 
        error 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get the current user
   */
  async getUser(): Promise<ServiceResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { 
        data: data.user as AuthUser, 
        error 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(
    metadata: Record<string, any>
  ): Promise<ServiceResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      return { 
        data: data.user as AuthUser, 
        error 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { data: null, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<ServiceResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      return { 
        data: data.user as AuthUser, 
        error 
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Set up session listener
   */
  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        callback(session as AuthSession);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}