import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase client setup - use Vite environment variables
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;

// Get values from Vite's import.meta.env (browser environment)
try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch (e) {
  console.warn('Error accessing environment variables:', e);
}

// Fallback to hardcoded values if testing
if (!supabaseUrl || !supabaseKey) {
  console.warn('Using mock Supabase client for testing purposes');
  // Use a mock implementation for testing
  supabaseUrl = 'https://example.supabase.co';
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidGVzdCJ9.test';
}

// Create Supabase client with specific OAuth configuration for development
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    // Use PKCE flow which is more secure
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      // Ensure headers are properly set for Supabase operations
      'X-Client-Info': 'psyplex/1.0.0'
    },
  },
});

// Standard response type for all database operations
export interface DbResponse<T> {
  data: T | null;
  error: Error | null;
}

// Re-export types from Supabase that are commonly used
export type { User, Session } from '@supabase/supabase-js';
