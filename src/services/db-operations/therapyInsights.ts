import { supabase, DbResponse } from './supabaseClient';

export type TherapyInsight = {
  id: string;
  session_id: string;
  client_id: string;
  therapist_id: string;
  insights: Record<string, any>; // JSONB data
  sentiment_analysis?: Record<string, any>; // JSONB data
  created_at?: string;
  updated_at?: string;
};

export type TherapyInsightInput = Omit<TherapyInsight, 'id' | 'created_at' | 'updated_at'>;

/**
 * Adds a new therapy insight
 * @param insightData The therapy insight data to create
 * @returns The created therapy insight or an error
 */
export async function createTherapyInsight(
  insightData: TherapyInsightInput
): Promise<DbResponse<TherapyInsight>> {
  try {
    const { data, error } = await supabase
      .from('therapy_insights')
      .insert(insightData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating therapy insight:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific therapy insight
 * @param insightId UUID of the therapy insight
 * @returns The therapy insight or an error
 */
export async function getTherapyInsightById(insightId: string): Promise<DbResponse<TherapyInsight>> {
  try {
    const { data, error } = await supabase
      .from('therapy_insights')
      .select('*')
      .eq('id', insightId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching therapy insight:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all insights for a specific session
 * @param sessionId UUID of the session
 * @returns Array of therapy insight objects or an error
 */
export async function getTherapyInsightsBySessionId(
  sessionId: string
): Promise<DbResponse<TherapyInsight[]>> {
  try {
    const { data, error } = await supabase
      .from('therapy_insights')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching therapy insights by session ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all insights for a specific client
 * @param clientId UUID of the client
 * @returns Array of therapy insight objects or an error
 */
export async function getTherapyInsightsByClientId(
  clientId: string
): Promise<DbResponse<TherapyInsight[]>> {
  try {
    const { data, error } = await supabase
      .from('therapy_insights')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching therapy insights by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a therapy insight
 * @param insightId UUID of the therapy insight
 * @param updateData Partial therapy insight data to update
 * @returns The updated therapy insight or an error
 */
export async function updateTherapyInsight(
  insightId: string, 
  updateData: Partial<TherapyInsightInput>
): Promise<DbResponse<TherapyInsight>> {
  try {
    const { data, error } = await supabase
      .from('therapy_insights')
      .update(updateData)
      .eq('id', insightId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating therapy insight:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a therapy insight
 * @param insightId UUID of the therapy insight
 * @returns Success status or an error
 */
export async function deleteTherapyInsight(
  insightId: string
): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('therapy_insights')
      .delete()
      .eq('id', insightId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting therapy insight:', error);
    return { data: null, error: error as Error };
  }
}
