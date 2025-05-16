import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase client setup - handle both Vite env and process.env for testing
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;

// Check for Vite's import.meta.env (browser/dev environment)
try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch (e) {
  // If we're in Node.js (like during testing), use process.env
  supabaseUrl = process.env.VITE_SUPABASE_URL;
  supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
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
    flowType: 'implicit',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  }
});

// Standard response type for all database operations
export interface DbResponse<T> {
  data: T | null;
  error: Error | null;
}

// Re-export types from Supabase that are commonly used
export type { User, Session } from '@supabase/supabase-js';
