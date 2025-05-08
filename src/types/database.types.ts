export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      therapists: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string | null;
          created_at?: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          therapist_id: string;
          full_name: string;
          date_of_birth: string | null;
          gender: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          full_name: string;
          date_of_birth?: string | null;
          gender?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          full_name?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          created_at?: string | null;
        };
      };
      client_profiles: {
        Row: {
          client_id: string;
          address: string | null;
          phone: string | null;
          emergency_contact: string | null;
          diagnosis: string | null;
          current_medication: string | null;
          recent_session_id: string | null;
          therapy_notes: string | null;
        };
        Insert: {
          client_id: string;
          address?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          diagnosis?: string | null;
          current_medication?: string | null;
          recent_session_id?: string | null;
          therapy_notes?: string | null;
        };
        Update: {
          client_id?: string;
          address?: string | null;
          phone?: string | null;
          emergency_contact?: string | null;
          diagnosis?: string | null;
          current_medication?: string | null;
          recent_session_id?: string | null;
          therapy_notes?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          client_id: string;
          session_date: string;
          session_type: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          session_date: string;
          session_type: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          session_date?: string;
          session_type?: string;
          created_at?: string | null;
        };
      };
      session_reports: {
        Row: {
          session_id: string;
          report_type: string;
          content: Json;
        };
        Insert: {
          session_id: string;
          report_type: string;
          content: Json;
        };
        Update: {
          session_id?: string;
          report_type?: string;
          content?: Json;
        };
      };
      scribbled_notes: {
        Row: {
          id: string;
          session_id: string;
          note_text: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          note_text?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          note_text?: string | null;
          created_at?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          therapist_id: string;
          client_id: string | null;
          session_date: string;
          location: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          therapist_id: string;
          client_id?: string | null;
          session_date: string;
          location?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          therapist_id?: string;
          client_id?: string | null;
          session_date?: string;
          location?: string | null;
          notes?: string | null;
        };
      };
      treatment_goals: {
        Row: {
          id: string;
          client_id: string;
          goal_description: string;
          start_date: string | null;
          target_date: string | null;
          is_achieved: boolean | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          goal_description: string;
          start_date?: string | null;
          target_date?: string | null;
          is_achieved?: boolean | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          goal_description?: string;
          start_date?: string | null;
          target_date?: string | null;
          is_achieved?: boolean | null;
        };
      };
      progress_tracker: {
        Row: {
          id: string;
          client_id: string;
          date_recorded: string | null;
          anxiety_level: number | null;
          depression_level: number | null;
          progress_notes: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          date_recorded?: string | null;
          anxiety_level?: number | null;
          depression_level?: number | null;
          progress_notes?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          date_recorded?: string | null;
          anxiety_level?: number | null;
          depression_level?: number | null;
          progress_notes?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}

// Types for Gemini AI output
export interface GeminiOutput {
  analysis: {
    key_observations: string[];
    therapeutic_techniques: string[];
    client_response: string;
    next_steps: string[];
  };
  summary: string;
  recommendations?: string[];
  timestamp: string;
}

// Report types
export type ReportType = "SOAP" | "BIRP" | "DAP";

// SOAP Report Structure
export interface SOAPReport {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  timestamp: string;
}

// BIRP Report Structure
export interface BIRPReport {
  behavior: string;
  intervention: string;
  response: string;
  plan: string;
  timestamp: string;
}

// DAP Report Structure
export interface DAPReport {
  data: string;
  assessment: string;
  plan: string;
  timestamp: string;
}
