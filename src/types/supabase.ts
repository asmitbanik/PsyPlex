export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      therapists: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          credentials: string | null
          specialties: string[] | null
          bio: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          credentials?: string | null
          specialties?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          credentials?: string | null
          specialties?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          therapist_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          status: 'Active' | 'On Hold' | 'Completed' | 'New'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          status?: 'Active' | 'On Hold' | 'Completed' | 'New'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          status?: 'Active' | 'On Hold' | 'Completed' | 'New'
          created_at?: string
          updated_at?: string
        }
      }
      client_profiles: {
        Row: {
          id: string
          client_id: string
          date_of_birth: string | null
          address: string | null
          occupation: string | null
          emergency_contact: string | null
          primary_concerns: string[] | null
          therapy_type: string | null
          start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          date_of_birth?: string | null
          address?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          primary_concerns?: string[] | null
          therapy_type?: string | null
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          date_of_birth?: string | null
          address?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          primary_concerns?: string[] | null
          therapy_type?: string | null
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          client_id: string
          therapist_id: string
          session_date: string
          duration_minutes: number | null
          session_type: 'In-person' | 'Virtual'
          status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          therapist_id: string
          session_date: string
          duration_minutes?: number | null
          session_type: 'In-person' | 'Virtual'
          status?: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          therapist_id?: string
          session_date?: string
          duration_minutes?: number | null
          session_type?: 'In-person' | 'Virtual'
          status?: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show'
          created_at?: string
          updated_at?: string
        }
      }
      session_notes: {
        Row: {
          id: string
          session_id: string
          therapist_id: string
          client_id: string
          title: string
          content: Json
          therapy_type: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          therapist_id: string
          client_id: string
          title: string
          content: Json
          therapy_type?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          therapist_id?: string
          client_id?: string
          title?: string
          content?: Json
          therapy_type?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      session_transcripts: {
        Row: {
          id: string
          session_id: string
          transcript_url: string | null
          transcription_status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          transcript_url?: string | null
          transcription_status?: 'Pending' | 'Processing' | 'Completed' | 'Failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          transcript_url?: string | null
          transcription_status?: 'Pending' | 'Processing' | 'Completed' | 'Failed'
          created_at?: string
          updated_at?: string
        }
      }
      transcript_segments: {
        Row: {
          id: string
          transcript_id: string
          speaker: 'Therapist' | 'Client'
          text: string
          timestamp_start: number
          timestamp_end: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transcript_id: string
          speaker: 'Therapist' | 'Client'
          text: string
          timestamp_start: number
          timestamp_end?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transcript_id?: string
          speaker?: 'Therapist' | 'Client'
          text?: string
          timestamp_start?: number
          timestamp_end?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      voice_profiles: {
        Row: {
          id: string
          client_id: string
          mfcc_profile: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          mfcc_profile: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          mfcc_profile?: Json
          created_at?: string
          updated_at?: string
        }
      }
      therapy_insights: {
        Row: {
          id: string
          session_id: string
          client_id: string
          therapist_id: string
          insights: Json
          sentiment_analysis: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          client_id: string
          therapist_id: string
          insights: Json
          sentiment_analysis?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          client_id?: string
          therapist_id?: string
          insights?: Json
          sentiment_analysis?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      treatment_goals: {
        Row: {
          id: string
          client_id: string
          goal_description: string
          status: 'Not Started' | 'In Progress' | 'Achieved'
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          goal_description: string
          status?: 'Not Started' | 'In Progress' | 'Achieved'
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          goal_description?: string
          status?: 'Not Started' | 'In Progress' | 'Achieved'
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_metrics: {
        Row: {
          id: string
          client_id: string
          metric_name: string
          metric_value: number
          date_recorded: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          metric_name: string
          metric_value: number
          date_recorded: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          metric_name?: string
          metric_value?: number
          date_recorded?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
