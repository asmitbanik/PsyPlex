// Export all database operations for easy importing
import { supabase } from './supabaseClient';

// Re-export the supabase client
export { supabase };

// Export the DbResponse type
export interface DbResponse<T> {
  data: T | null;
  error: Error | null;
}

// Therapist operations
export * from './therapists';

// Client operations
export * from './clients';

// Client Profile operations
export * from './clientProfiles';

// Session operations
export * from './sessions';

// Session Notes operations
export * from './sessionNotes';

// Session Transcript operations
export * from './sessionTranscripts';

// Transcript Segment operations
export * from './transcriptSegments';

// Voice Profile operations
export * from './voiceProfiles';

// Therapy Insights operations
export * from './therapyInsights';

// Treatment Goal operations
export * from './treatmentGoals';

// Progress Metrics operations
export * from './progressMetrics';
