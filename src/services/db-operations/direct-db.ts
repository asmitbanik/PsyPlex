import { supabase } from '../../lib/supabase';

/**
 * Directly inserts a client record bypassing the standard client creation flow.
 * This is a last-resort function to handle RLS issues with client creation.
 * 
 * @param firstName Client's first name
 * @param lastName Client's last name
 * @param email Client's email
 * @param phone Client's phone number
 * @param userId Current user's ID to set as therapist_id
 * @returns The created client data or null on error
 */
export async function insertClientDirectly(
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  userId: string
) {
  try {
    console.log('⚠️ Using direct client insertion with therapist_id:', userId);
    
    // Force session refresh to ensure fresh tokens
    await supabase.auth.refreshSession();
    
    // Create the client record with direct SQL
    // This bypasses potential issues with the standard flow
    const { data, error } = await supabase.rpc('insert_client_direct', {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_phone: phone,
      p_status: 'New',
      p_therapist_id: userId
    });
    
    if (error) {
      console.error('Direct client insertion failed:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in direct client insertion:', error);
    return { success: false, error: 'Failed to create client: ' + (error as Error).message };
  }
}
