import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
// Import the centralized supabase client and types
import { supabase, User, Session } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';

// Log that we're using the centralized supabase client
console.log('AuthContext using centralized supabase client');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{provider: string; url: string | null} | undefined>;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserData: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Check if we have a session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Login successful!", {
        description: "Welcome back!"
      });
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Invalid email or password';
      
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email before logging in';
        } else {
          message = error.message;
        }
      }
      
      toast.error("Login failed", {
        description: message
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Signing up with email:', email);
      
      // No therapist profile creation during signup - cleaner approach
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            // Store any additional user metadata here
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Success message to user
      if (data.session) {
        toast.success("Registration successful!", {
          description: "Your account has been created."
        });
      } else {
        toast.success("Registration successful!", {
          description: "Please check your email to confirm your account."
        });
      }
      
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registration failed. Please try again.';
      
      if (error instanceof AuthError) {
        if (error.message.includes('already registered')) {
          message = 'Email already in use. Please use a different email.';
        } else if (error.message.includes('password')) {
          message = 'Password is too weak. Please use a stronger password.';
        } else {
          message = error.message;
        }
      }
      
      toast.error("Registration failed", {
        description: message
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logout successful", {
        description: "You have been logged out."
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      toast.error("Logout failed", {
        description: "An error occurred during logout."
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Check your email for the password reset link."
      });
    } catch (error) {
      console.error('Password reset error:', error);
      
      toast.error("Password reset failed", {
        description: "An error occurred while sending reset email."
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user data
   */
  const updateUserData = async (data: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: data
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('Profile update error:', error);
      
      toast.error("Profile update failed", {
        description: "An error occurred while updating your profile."
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Attempting Google sign in');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          skipBrowserRedirect: false,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // If we get here, the user was redirected to Google's OAuth flow
      // We won't see this toast because the page is being redirected
      toast.success("Redirecting to Google", {
        description: "Please complete the sign in process."
      });
      
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      
      toast.error("Google sign in failed", {
        description: error instanceof Error ? error.message : "Failed to sign in with Google"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        resetPassword,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
