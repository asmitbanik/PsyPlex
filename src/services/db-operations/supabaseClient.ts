// Import the supabase client from the central location to ensure consistent auth state
import { supabase, DbResponse as LibDbResponse } from '../../lib/supabase';
import { Database } from '../../types/supabase';

// Re-export the supabase instance
export { supabase };

// Standard response type for all database operations
export interface DbResponse<T> extends LibDbResponse<T> {}

// Log that we're using the centralized supabase client
console.log('DB operations using centralized supabase client with auth context');

