import { supabase, DbResponse } from './supabaseClient';

export type TreatmentGoal = {
  id: string;
  client_id: string;
  goal_description: string;
  status: 'Not Started' | 'In Progress' | 'Achieved';
  target_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type TreatmentGoalInput = Omit<TreatmentGoal, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a new treatment goal for a client
 * @param goalData The treatment goal data to create
 * @returns The created treatment goal or an error
 */
export async function createTreatmentGoal(
  goalData: TreatmentGoalInput
): Promise<DbResponse<TreatmentGoal>> {
  try {
    const { data, error } = await supabase
      .from('treatment_goals')
      .insert(goalData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating treatment goal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific treatment goal
 * @param goalId UUID of the treatment goal
 * @returns The treatment goal or an error
 */
export async function getTreatmentGoalById(goalId: string): Promise<DbResponse<TreatmentGoal>> {
  try {
    const { data, error } = await supabase
      .from('treatment_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching treatment goal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all treatment goals for a specific client
 * @param clientId UUID of the client
 * @returns Array of treatment goal objects or an error
 */
export async function getTreatmentGoalsByClientId(
  clientId: string
): Promise<DbResponse<TreatmentGoal[]>> {
  try {
    const { data, error } = await supabase
      .from('treatment_goals')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching treatment goals by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a treatment goal
 * @param goalId UUID of the treatment goal
 * @param updateData Partial treatment goal data to update
 * @returns The updated treatment goal or an error
 */
export async function updateTreatmentGoal(
  goalId: string, 
  updateData: Partial<TreatmentGoalInput>
): Promise<DbResponse<TreatmentGoal>> {
  try {
    const { data, error } = await supabase
      .from('treatment_goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating treatment goal:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a treatment goal
 * @param goalId UUID of the treatment goal
 * @returns Success status or an error
 */
export async function deleteTreatmentGoal(
  goalId: string
): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('treatment_goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting treatment goal:', error);
    return { data: null, error: error as Error };
  }
}
