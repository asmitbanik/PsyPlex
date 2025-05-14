# PsyPlex Database Operations

This document outlines all the database operations implemented for the PsyPlex application. Each module provides CRUD (Create, Read, Update, Delete) operations for a specific database table.

## Common Principles

- **Response Format**: All functions return a `DbResponse<T>` object with the following structure:
  ```typescript
  {
    data: T | null; // The data returned by the operation, if successful
    error: Error | null; // Any error that occurred, null if successful
  }
  ```

- **Error Handling**: All functions catch errors and return them in a consistent format. Errors are also logged to the console.

- **Timestamps**: Created and updated timestamps are handled automatically by the database triggers.

## Module: `supabaseClient.ts`

Provides the Supabase client initialization and the common response type.

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Standard response type for all database operations
export type DbResponse<T> = {
  data: T | null;
  error: Error | null;
};
```

## Module: `therapists.ts`

Operations for managing therapist information.

### Types

```typescript
export type Therapist = {
  id: string;
  user_id: string;
  full_name?: string;
  credentials?: string;
  specialties?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type TherapistInput = Omit<Therapist, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createTherapist(therapistData)`**: Creates a new therapist record
  - Input: `TherapistInput` object
  - Output: `DbResponse<Therapist>`

- **`getTherapistById(therapistId)`**: Retrieves a specific therapist by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<Therapist>`

- **`getTherapistByUserId(userId)`**: Retrieves a therapist by user ID
  - Input: `string` (UUID from auth.users)
  - Output: `DbResponse<Therapist>`

- **`updateTherapist(therapistId, updateData)`**: Updates an existing therapist
  - Input: `string` (UUID), `Partial<TherapistInput>`
  - Output: `DbResponse<Therapist>`

- **`deleteTherapist(therapistId)`**: Deletes a therapist
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

- **`getAllTherapists()`**: Gets all therapists
  - Output: `DbResponse<Therapist[]>`

## Module: `clients.ts`

Operations for managing client information.

### Types

```typescript
export type Client = {
  id: string;
  therapist_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'New';
  created_at?: string;
  updated_at?: string;
};

export type ClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createClient(clientData)`**: Creates a new client record
  - Input: `ClientInput` object
  - Output: `DbResponse<Client>`

- **`getClientById(clientId)`**: Retrieves a specific client by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<Client>`

- **`getClientsByTherapistId(therapistId)`**: Retrieves all clients for a therapist
  - Input: `string` (UUID)
  - Output: `DbResponse<Client[]>`

- **`updateClient(clientId, updateData)`**: Updates an existing client
  - Input: `string` (UUID), `Partial<ClientInput>`
  - Output: `DbResponse<Client>`

- **`deleteClient(clientId)`**: Deletes a client
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `clientProfiles.ts`

Operations for managing detailed client profile information.

### Types

```typescript
export type ClientProfile = {
  id: string;
  client_id: string;
  date_of_birth?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  primary_concerns?: string[];
  therapy_type?: string;
  start_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type ClientProfileInput = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createClientProfile(profileData)`**: Creates a client profile
  - Input: `ClientProfileInput` object
  - Output: `DbResponse<ClientProfile>`

- **`getClientProfileByClientId(clientId)`**: Retrieves profile for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<ClientProfile>`

- **`getClientProfileById(profileId)`**: Retrieves a profile by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<ClientProfile>`

- **`updateClientProfile(profileId, updateData)`**: Updates a client profile
  - Input: `string` (UUID), `Partial<ClientProfileInput>`
  - Output: `DbResponse<ClientProfile>`

- **`deleteClientProfile(profileId)`**: Deletes a client profile
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `sessions.ts`

Operations for managing therapy sessions.

### Types

```typescript
export type Session = {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  duration_minutes?: number;
  session_type: 'In-person' | 'Virtual';
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show';
  created_at?: string;
  updated_at?: string;
};

export type SessionInput = Omit<Session, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createSession(sessionData)`**: Creates a new session
  - Input: `SessionInput` object
  - Output: `DbResponse<Session>`

- **`getSessionById(sessionId)`**: Retrieves a specific session by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<Session>`

- **`getSessionsByClientId(clientId)`**: Retrieves all sessions for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<Session[]>`

- **`getSessionsByTherapistId(therapistId)`**: Retrieves all sessions for a therapist
  - Input: `string` (UUID)
  - Output: `DbResponse<Session[]>`

- **`updateSession(sessionId, updateData)`**: Updates an existing session
  - Input: `string` (UUID), `Partial<SessionInput>`
  - Output: `DbResponse<Session>`

- **`deleteSession(sessionId)`**: Deletes a session
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

- **`getUpcomingSessionsByTherapistId(therapistId)`**: Gets upcoming sessions for a therapist
  - Input: `string` (UUID)
  - Output: `DbResponse<Session[]>`

## Module: `sessionNotes.ts`

Operations for managing notes taken during sessions.

### Types

```typescript
export type SessionNote = {
  id: string;
  session_id: string;
  therapist_id: string;
  client_id: string;
  title: string;
  content: Record<string, any>; // JSONB
  therapy_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

export type SessionNoteInput = Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createSessionNote(noteData)`**: Creates a new session note
  - Input: `SessionNoteInput` object
  - Output: `DbResponse<SessionNote>`

- **`getSessionNoteById(noteId)`**: Retrieves a specific note by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<SessionNote>`

- **`getSessionNotesBySessionId(sessionId)`**: Retrieves all notes for a session
  - Input: `string` (UUID)
  - Output: `DbResponse<SessionNote[]>`

- **`getSessionNotesByClientId(clientId)`**: Retrieves all notes for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<SessionNote[]>`

- **`updateSessionNote(noteId, updateData)`**: Updates a session note
  - Input: `string` (UUID), `Partial<SessionNoteInput>`
  - Output: `DbResponse<SessionNote>`

- **`deleteSessionNote(noteId)`**: Deletes a session note
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `sessionTranscripts.ts`

Operations for managing session transcripts.

### Types

```typescript
export type SessionTranscript = {
  id: string;
  session_id: string;
  transcript_url?: string;
  transcription_status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  created_at?: string;
  updated_at?: string;
};

export type SessionTranscriptInput = Omit<SessionTranscript, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createSessionTranscript(transcriptData)`**: Creates a transcript record
  - Input: `SessionTranscriptInput` object
  - Output: `DbResponse<SessionTranscript>`

- **`getSessionTranscriptById(transcriptId)`**: Retrieves a transcript by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<SessionTranscript>`

- **`getSessionTranscriptBySessionId(sessionId)`**: Gets transcript for a session
  - Input: `string` (UUID)
  - Output: `DbResponse<SessionTranscript>`

- **`updateSessionTranscript(transcriptId, updateData)`**: Updates a transcript
  - Input: `string` (UUID), `Partial<SessionTranscriptInput>`
  - Output: `DbResponse<SessionTranscript>`

- **`deleteSessionTranscript(transcriptId)`**: Deletes a transcript
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `transcriptSegments.ts`

Operations for managing individual segments of a transcript.

### Types

```typescript
export type TranscriptSegment = {
  id: string;
  transcript_id: string;
  speaker: 'Therapist' | 'Client';
  text: string;
  timestamp_start: number;
  timestamp_end?: number;
  created_at?: string;
  updated_at?: string;
};

export type TranscriptSegmentInput = Omit<TranscriptSegment, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createTranscriptSegment(segmentData)`**: Adds a segment to a transcript
  - Input: `TranscriptSegmentInput` object
  - Output: `DbResponse<TranscriptSegment>`

- **`getTranscriptSegmentById(segmentId)`**: Retrieves a segment by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<TranscriptSegment>`

- **`getTranscriptSegmentsByTranscriptId(transcriptId)`**: Gets all segments for a transcript
  - Input: `string` (UUID)
  - Output: `DbResponse<TranscriptSegment[]>`

- **`updateTranscriptSegment(segmentId, updateData)`**: Updates a segment
  - Input: `string` (UUID), `Partial<TranscriptSegmentInput>`
  - Output: `DbResponse<TranscriptSegment>`

- **`deleteTranscriptSegment(segmentId)`**: Deletes a segment
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

- **`createTranscriptSegments(segments)`**: Creates multiple segments at once
  - Input: `TranscriptSegmentInput[]`
  - Output: `DbResponse<TranscriptSegment[]>`

## Module: `voiceProfiles.ts`

Operations for managing client voice profiles.

### Types

```typescript
export type VoiceProfile = {
  id: string;
  client_id: string;
  mfcc_profile: Record<string, any>; // JSONB data with MFCC features
  created_at?: string;
  updated_at?: string;
};

export type VoiceProfileInput = Omit<VoiceProfile, 'id' | 'created_at' | 'updated_at'>;
```

### Functions

- **`createVoiceProfile(profileData)`**: Creates a voice profile
  - Input: `VoiceProfileInput` object
  - Output: `DbResponse<VoiceProfile>`

- **`getVoiceProfileById(profileId)`**: Retrieves a voice profile by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<VoiceProfile>`

- **`getVoiceProfileByClientId(clientId)`**: Gets voice profile for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<VoiceProfile>`

- **`updateVoiceProfile(profileId, updateData)`**: Updates a voice profile
  - Input: `string` (UUID), `Partial<VoiceProfileInput>`
  - Output: `DbResponse<VoiceProfile>`

- **`deleteVoiceProfile(profileId)`**: Deletes a voice profile
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `therapyInsights.ts`

Operations for managing AI-generated insights from sessions.

### Types

```typescript
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
```

### Functions

- **`createTherapyInsight(insightData)`**: Creates a therapy insight
  - Input: `TherapyInsightInput` object
  - Output: `DbResponse<TherapyInsight>`

- **`getTherapyInsightById(insightId)`**: Retrieves an insight by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<TherapyInsight>`

- **`getTherapyInsightsBySessionId(sessionId)`**: Gets insights for a session
  - Input: `string` (UUID)
  - Output: `DbResponse<TherapyInsight[]>`

- **`getTherapyInsightsByClientId(clientId)`**: Gets insights for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<TherapyInsight[]>`

- **`updateTherapyInsight(insightId, updateData)`**: Updates an insight
  - Input: `string` (UUID), `Partial<TherapyInsightInput>`
  - Output: `DbResponse<TherapyInsight>`

- **`deleteTherapyInsight(insightId)`**: Deletes an insight
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `treatmentGoals.ts`

Operations for managing client treatment goals.

### Types

```typescript
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
```

### Functions

- **`createTreatmentGoal(goalData)`**: Creates a treatment goal
  - Input: `TreatmentGoalInput` object
  - Output: `DbResponse<TreatmentGoal>`

- **`getTreatmentGoalById(goalId)`**: Retrieves a goal by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<TreatmentGoal>`

- **`getTreatmentGoalsByClientId(clientId)`**: Gets goals for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<TreatmentGoal[]>`

- **`updateTreatmentGoal(goalId, updateData)`**: Updates a goal
  - Input: `string` (UUID), `Partial<TreatmentGoalInput>`
  - Output: `DbResponse<TreatmentGoal>`

- **`deleteTreatmentGoal(goalId)`**: Deletes a goal
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Module: `progressMetrics.ts`

Operations for managing client progress metrics.

### Types

```typescript
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
```

### Functions

- **`createProgressMetric(metricData)`**: Creates a progress metric
  - Input: `ProgressMetricInput` object
  - Output: `DbResponse<ProgressMetric>`

- **`getProgressMetricById(metricId)`**: Retrieves a metric by ID
  - Input: `string` (UUID)
  - Output: `DbResponse<ProgressMetric>`

- **`getProgressMetricsByClientId(clientId)`**: Gets all metrics for a client
  - Input: `string` (UUID)
  - Output: `DbResponse<ProgressMetric[]>`

- **`getClientMetricsByName(clientId, metricName)`**: Gets metrics by name for a client
  - Input: `string` (UUID), `string`
  - Output: `DbResponse<ProgressMetric[]>`

- **`updateProgressMetric(metricId, updateData)`**: Updates a metric
  - Input: `string` (UUID), `Partial<ProgressMetricInput>`
  - Output: `DbResponse<ProgressMetric>`

- **`deleteProgressMetric(metricId)`**: Deletes a metric
  - Input: `string` (UUID)
  - Output: `DbResponse<{ success: boolean }>`

## Usage Examples

### Creating a new therapist

```typescript
import { createTherapist } from './services/db-operations';

const createNewTherapist = async () => {
  const therapistData = {
    user_id: 'auth0|user123',
    full_name: 'Dr. Jane Smith',
    credentials: 'PhD, Clinical Psychology',
    specialties: ['Anxiety', 'Depression'],
    bio: 'Experienced therapist with 10+ years of practice'
  };

  const { data, error } = await createTherapist(therapistData);
  
  if (error) {
    console.error('Failed to create therapist:', error);
    return;
  }
  
  console.log('New therapist created:', data);
};
```

### Retrieving clients for a therapist

```typescript
import { getClientsByTherapistId } from './services/db-operations';

const fetchClientsForTherapist = async (therapistId: string) => {
  const { data, error } = await getClientsByTherapistId(therapistId);
  
  if (error) {
    console.error('Failed to fetch clients:', error);
    return;
  }
  
  console.log(`Found ${data.length} clients for therapist ${therapistId}:`, data);
};
```

### Updating a session

```typescript
import { updateSession } from './services/db-operations';

const rescheduleSession = async (sessionId: string, newDate: Date) => {
  const { data, error } = await updateSession(sessionId, {
    session_date: newDate.toISOString()
  });
  
  if (error) {
    console.error('Failed to update session:', error);
    return;
  }
  
  console.log('Session rescheduled:', data);
};
```
