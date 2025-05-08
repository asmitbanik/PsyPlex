import { supabase } from "../lib/supabase";
import { ReportType } from "../types/database.types";

/**
 * Save a session report with Gemini processed output
 * Stores the content directly as JSON in the JSONB field
 */
export async function saveSessionReport(
  sessionId: string,
  reportType: ReportType,
  content: any
) {
  try {
    const { data, error } = await supabase.from("session_reports").upsert({
      session_id: sessionId,
      report_type: reportType,
      content,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving session report:", error);
    throw error;
  }
}

/**
 * Get a specific session report
 */
export async function getSessionReport(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("session_reports")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching session report:", error);
    throw error;
  }
}

/**
 * Get all reports for a client
 */
export async function getClientReports(clientId: string) {
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
        )
      `
      )
      .eq("client_id", clientId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching client reports:", error);
    throw error;
  }
}

/**
 * Process audio with Gemini AI and store the results
 * Simply stores the raw output with added metadata
 */
export async function processAudioWithGemini(
  audioData: Blob,
  sessionId: string,
  reportType: ReportType,
  apiKey: string
) {
  try {
    // Create form data for API request
    const formData = new FormData();
    formData.append("audio", audioData);
    formData.append("reportType", reportType);
    formData.append("apiKey", apiKey);

    // Send audio to FastAPI backend for processing with Gemini
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/process-audio`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error processing audio: ${response.statusText}`);
    }

    // Get processed output from Gemini
    const geminiOutput = await response.json();

    // Add metadata to the output
    const enhancedOutput = {
      ...geminiOutput,
      meta: {
        timestamp: new Date().toISOString(),
        requestedFormat: reportType,
        processed: true,
      },
    };

    // Store the output in the database
    await saveSessionReport(sessionId, reportType, enhancedOutput);

    return enhancedOutput;
  } catch (error) {
    console.error("Error in Gemini processing:", error);
    throw error;
  }
}

/**
 * Helper function that can detect common report formats in the stored JSON
 * Useful for display logic, but not required for storage
 */
export function detectReportFormat(content: any): string {
  if (!content) return "unknown";

  // Look for key sections in different report formats
  if (
    content.subjective &&
    content.objective &&
    content.assessment &&
    content.plan
  ) {
    return "SOAP";
  }

  if (
    content.behavior &&
    content.intervention &&
    content.response &&
    content.plan
  ) {
    return "BIRP";
  }

  if (content.data && content.assessment && content.plan) {
    return "DAP";
  }

  // Return the requested format if it was stored in metadata
  if (content.meta?.requestedFormat) {
    return content.meta.requestedFormat;
  }

  return "generic";
}
