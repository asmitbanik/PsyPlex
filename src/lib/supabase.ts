import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase client setup - use Vite environment variables
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;
let supabaseServiceKey: string | undefined;

// Get values from Vite's import.meta.env (browser environment)
try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  // Log that we've found the keys (without revealing them)
  console.log('Supabase configuration:', 
    `URL: ${supabaseUrl ? 'Present' : 'Missing'}`, 
    `Anon Key: ${supabaseKey ? 'Present' : 'Missing'}`,
    `Service Key: ${supabaseServiceKey ? 'Present' : 'Missing'}`
  );
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

// Main Supabase client - uses anonymous key (respects RLS)
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

// Create a service role client that bypasses RLS policies
// IMPORTANT: This should ONLY be used for operations that need to bypass RLS
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'psyplex-admin/1.0.0'
        },
      },
    })
  : null;

// Standard response type for all database operations
export interface DbResponse<T> {
  data: T | null;
  error: Error | null;
}

// Re-export types from Supabase that are commonly used
export type { User, Session } from '@supabase/supabase-js';
