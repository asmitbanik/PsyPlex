import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';

export type TherapyInsight = Database['public']['Tables']['therapy_insights']['Row'];
export type TreatmentGoal = Database['public']['Tables']['treatment_goals']['Row'];
export type ProgressMetric = Database['public']['Tables']['progress_metrics']['Row'];

export class TherapyInsightsService extends BaseService<TherapyInsight> {
  constructor() {
    super('therapy_insights');
  }

  /**
   * Get insights for a specific session
   */
  async getInsightsForSession(sessionId: string): Promise<ServiceResponse<TherapyInsight>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('session_id', sessionId)
        .single();

      return { data: data as TherapyInsight, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create or update insights for a session
   */
  async saveInsightsForSession(
    sessionId: string,
    clientId: string,
    therapistId: string,
    insights: any,
    sentimentAnalysis?: any
  ): Promise<ServiceResponse<TherapyInsight>> {
    try {
      // Check if insights already exist for this session
      const { data: existingInsights } = await this.getInsightsForSession(sessionId);

      if (existingInsights) {
        // Update existing insights
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            insights,
            sentiment_analysis: sentimentAnalysis || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingInsights.id)
          .select('*')
          .single();

        return { data: data as TherapyInsight, error };
      } else {
        // Create new insights
        const { data, error } = await supabase
          .from(this.tableName)
          .insert({
            session_id: sessionId,
            client_id: clientId,
            therapist_id: therapistId,
            insights,
            sentiment_analysis: sentimentAnalysis || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        return { data: data as TherapyInsight, error };
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all insights for a client
   */
  async getInsightsByClient(clientId: string): Promise<ServiceResponse<TherapyInsight[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          session:sessions(session_date, session_type)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      return { data: data as unknown as TherapyInsight[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Save a treatment goal
   */
  async saveTreatmentGoal(
    clientId: string,
    goalDescription: string,
    status: 'Not Started' | 'In Progress' | 'Achieved' = 'Not Started',
    targetDate?: string
  ): Promise<ServiceResponse<TreatmentGoal>> {
    try {
      const { data, error } = await supabase
        .from('treatment_goals')
        .insert({
          client_id: clientId,
          goal_description: goalDescription,
          status,
          target_date: targetDate || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as TreatmentGoal, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a treatment goal status
   */
  async updateGoalStatus(
    goalId: string,
    status: 'Not Started' | 'In Progress' | 'Achieved'
  ): Promise<ServiceResponse<TreatmentGoal>> {
    try {
      const { data, error } = await supabase
        .from('treatment_goals')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select('*')
        .single();

      return { data: data as TreatmentGoal, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get treatment goals for a client
   */
  async getClientGoals(clientId: string): Promise<ServiceResponse<TreatmentGoal[]>> {
    try {
      const { data, error } = await supabase
        .from('treatment_goals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      return { data: data as TreatmentGoal[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Record a progress metric
   */
  async recordProgressMetric(
    clientId: string,
    metricName: string,
    metricValue: number,
    notes?: string
  ): Promise<ServiceResponse<ProgressMetric>> {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .insert({
          client_id: clientId,
          metric_name: metricName,
          metric_value: metricValue,
          date_recorded: new Date().toISOString().split('T')[0],
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as ProgressMetric, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get progress metrics for a client
   */
  async getClientMetrics(
    clientId: string,
    metricName?: string
  ): Promise<ServiceResponse<ProgressMetric[]>> {
    try {
      let query = supabase
        .from('progress_metrics')
        .select('*')
        .eq('client_id', clientId);

      if (metricName) {
        query = query.eq('metric_name', metricName);
      }

      const { data, error } = await query.order('date_recorded', { ascending: true });

      return { data: data as ProgressMetric[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get metrics by name for all clients
   */
  async getMetricsByName(metricName: string): Promise<ServiceResponse<ProgressMetric[]>> {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('*')
        .eq('metric_name', metricName)
        .order('date_recorded', { ascending: true });

      return { data: data as ProgressMetric[], error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
