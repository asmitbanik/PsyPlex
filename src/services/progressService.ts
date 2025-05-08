import { supabase } from "../lib/supabase";

/**
 * Get progress tracking data for a client
 */
export async function getClientProgress(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("progress_tracker")
      .select("*")
      .eq("client_id", clientId)
      .order("date_recorded", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching client progress:", error);
    throw error;
  }
}

/**
 * Record new progress data for a client
 */
export async function recordProgress(
  clientId: string,
  progressData: {
    anxietyLevel?: number;
    depressionLevel?: number;
    progressNotes?: string;
    dateRecorded?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("progress_tracker")
      .insert({
        client_id: clientId,
        anxiety_level: progressData.anxietyLevel,
        depression_level: progressData.depressionLevel,
        progress_notes: progressData.progressNotes,
        date_recorded:
          progressData.dateRecorded || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error recording progress:", error);
    throw error;
  }
}

/**
 * Get treatment goals for a client
 */
export async function getClientGoals(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("treatment_goals")
      .select("*")
      .eq("client_id", clientId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching client goals:", error);
    throw error;
  }
}

/**
 * Add a treatment goal for a client
 */
export async function addTreatmentGoal(
  clientId: string,
  goalData: {
    goalDescription: string;
    startDate?: string;
    targetDate?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("treatment_goals")
      .insert({
        client_id: clientId,
        goal_description: goalData.goalDescription,
        start_date:
          goalData.startDate || new Date().toISOString().split("T")[0],
        target_date: goalData.targetDate,
        is_achieved: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding treatment goal:", error);
    throw error;
  }
}

/**
 * Update a treatment goal status
 */
export async function updateGoalStatus(goalId: string, isAchieved: boolean) {
  try {
    const { data, error } = await supabase
      .from("treatment_goals")
      .update({
        is_achieved: isAchieved,
      })
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating goal status:", error);
    throw error;
  }
}
