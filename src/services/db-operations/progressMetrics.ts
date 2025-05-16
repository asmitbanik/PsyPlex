import { supabase, DbResponse } from './supabaseClient';

export type ProgressMetric = {
  id: string;
  client_id: string;
  metric_name: string;
  metric_value: number;
  date_recorded: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProgressMetricInput = Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'>;

/**
 * Records a new progress metric for a client
 * @param metricData The progress metric data to create
 * @returns The created progress metric or an error
 */
export async function createProgressMetric(
  metricData: ProgressMetricInput
): Promise<DbResponse<ProgressMetric>> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .insert(metricData)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating progress metric:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific progress metric
 * @param metricId UUID of the progress metric
 * @returns The progress metric or an error
 */
export async function getProgressMetricById(metricId: string): Promise<DbResponse<ProgressMetric>> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('id', metricId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching progress metric:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all progress metrics for a specific client
 * @param clientId UUID of the client
 * @returns Array of progress metric objects or an error
 */
export async function getProgressMetricsByClientId(
  clientId: string
): Promise<DbResponse<ProgressMetric[]>> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('date_recorded', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching progress metrics by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all progress metrics for a specific metric name and client
 * @param clientId UUID of the client
 * @param metricName Name of the metric to retrieve
 * @returns Array of progress metric objects or an error
 */
export async function getClientMetricsByName(
  clientId: string,
  metricName: string
): Promise<DbResponse<ProgressMetric[]>> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('client_id', clientId)
      .eq('metric_name', metricName)
      .order('date_recorded', { ascending: true });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching client metrics by name:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates a progress metric
 * @param metricId UUID of the progress metric
 * @param updateData Partial progress metric data to update
 * @returns The updated progress metric or an error
 */
export async function updateProgressMetric(
  metricId: string, 
  updateData: Partial<ProgressMetricInput>
): Promise<DbResponse<ProgressMetric>> {
  try {
    const { data, error } = await supabase
      .from('progress_metrics')
      .update(updateData)
      .eq('id', metricId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating progress metric:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a progress metric
 * @param metricId UUID of the progress metric
 * @returns Success status or an error
 */
export async function deleteProgressMetric(
  metricId: string
): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('progress_metrics')
      .delete()
      .eq('id', metricId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting progress metric:', error);
    return { data: null, error: error as Error };
  }
}
