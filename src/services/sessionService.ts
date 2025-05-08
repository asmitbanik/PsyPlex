import { supabase } from "../lib/supabase";

/**
 * Get all sessions for a therapist
 */
export async function getSessionsForTherapist(therapistId: string) {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select(
        `
        id,
        session_date,
        location,
        notes,
        clients (
          id,
          full_name
        )
      `
      )
      .eq("therapist_id", therapistId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

/**
 * Get all sessions for a specific client
 */
export async function getClientSessions(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        id,
        session_date,
        session_type,
        session_reports (
          report_type,
          content
        ),
        scribbled_notes (
          id,
          note_text,
          created_at
        )
      `
      )
      .eq("client_id", clientId)
      .order("session_date", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching client sessions:", error);
    throw error;
  }
}

/**
 * Get a specific session with all related data
 */
export async function getSessionDetails(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        id,
        session_date,
        session_type,
        client_id,
        clients (
          id,
          full_name
        ),
        session_reports (
          report_type,
          content
        ),
        scribbled_notes (
          id,
          note_text,
          created_at
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching session details:", error);
    throw error;
  }
}

/**
 * Create a new therapy session
 */
export async function createSession(
  clientId: string,
  sessionData: {
    sessionDate: string;
    sessionType: "SOAP" | "BIRP" | "DAP";
  }
) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        client_id: clientId,
        session_date: sessionData.sessionDate,
        session_type: sessionData.sessionType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

/**
 * Schedule a session for a client
 */
export async function scheduleSession(
  therapistId: string,
  clientId: string,
  scheduleData: {
    sessionDate: string;
    location?: string;
    notes?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .insert({
        therapist_id: therapistId,
        client_id: clientId,
        session_date: scheduleData.sessionDate,
        location: scheduleData.location || null,
        notes: scheduleData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error scheduling session:", error);
    throw error;
  }
}

/**
 * Add scribbled notes to a session
 */
export async function addScribbledNote(sessionId: string, noteText: string) {
  try {
    const { data, error } = await supabase
      .from("scribbled_notes")
      .insert({
        session_id: sessionId,
        note_text: noteText,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
}
