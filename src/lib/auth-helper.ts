import { supabase } from './supabase';

/**
 * Gets the current authenticated user's ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Failed to get current user ID:', error);
    return null;
  }
}

/**
 * Verifies if a user is authenticated and gets their ID
 * @returns The authenticated user ID or throws an error
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}

/**
 * Refreshes the Supabase session if needed
 * This helps with expired JWT tokens that can cause RLS issues
 */
export async function refreshSessionIfNeeded(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    // If no session or token expired/about to expire
    if (!session || isTokenExpiringSoon(session.expires_at)) {
      console.log('Session needs refresh, attempting to refresh...');
      await supabase.auth.refreshSession();
      console.log('Session refreshed successfully');
    }
  } catch (error) {
    console.error('Failed to refresh session:', error);
  }
}

/**
 * Checks if a token is expiring soon (within next 5 minutes)
 */
function isTokenExpiringSoon(expiresAt: number): boolean {
  const fiveMinutesInSeconds = 5 * 60;
  const currentTime = Math.floor(Date.now() / 1000);
  return expiresAt - currentTime < fiveMinutesInSeconds;
}

/**
 * Adds Supabase auth headers to an API request
 * Useful for ensuring RLS policies are respected in fetch calls
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  };
}
