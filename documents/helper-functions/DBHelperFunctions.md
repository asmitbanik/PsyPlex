# Database Helper Functions

This document outlines the helper functions used to interact with the PsyPlex database. Each function corresponds to a CRUD (Create, Read, Update, Delete) operation for a specific database table.

## General Principles

*   **Supabase Client**: All functions will utilize the Supabase client (`supabase`) for database interactions. This client is assumed to be initialized and available.
*   **Error Handling**: Functions should implement robust error handling. Errors from Supabase or other issues should be caught and returned in a consistent format (e.g., `{ data: null, error: ErrorObject }`).
*   **Data Format**:
    *   **Input**: Data passed to `create` and `update` functions should generally be objects matching the table structure (or a subset for updates). Specific ID parameters will be used for `readOne`, `update`, and `delete` operations.
    *   **Output**:
        *   `create`, `readOne`, `update`: Return an object `{ data: TableRecord, error: null }` on success, or `{ data: null, error: ErrorObject }` on failure. `TableRecord` will be the created/retrieved/updated record.
        *   `readList`: Return an object `{ data: TableRecord[], error: null }` on success, or `{ data: null, error: ErrorObject }` on failure. `TableRecord[]` will be an array of records.
        *   `delete`: Return an object `{ data: { success: true }, error: null }` on success, or `{ data: null, error: ErrorObject }` on failure.
*   **Asynchronous Operations**: All database interactions are asynchronous, so functions will be `async` and return Promises.
*   **UUIDs**: Primary keys are UUIDs. Functions creating new records do not need to generate these; Supabase handles it.

---

## Table: `therapists`

Manages therapist information.

### `createTherapist(therapistData)`
*   **Description**: Creates a new therapist record.
*   **Input `therapistData`**: `object`
    ```json
    {
      "user_id": "UUID", // Required, from auth.users
      "full_name": "string",
      "credentials": "string",
      "specialties": ["string"],
      "bio": "string",
      "profile_image_url": "string"
    }
    ```
*   **Output**: `{ data: TherapistObject, error: ErrorObject | null }`

### `getTherapistById(therapistId)`
*   **Description**: Retrieves a specific therapist by their ID.
*   **Input `therapistId`**: `string` (UUID)
*   **Output**: `{ data: TherapistObject, error: ErrorObject | null }`

### `getTherapistByUserId(userId)`
*   **Description**: Retrieves a specific therapist by their `user_id`.
*   **Input `userId`**: `string` (UUID)
*   **Output**: `{ data: TherapistObject, error: ErrorObject | null }`

### `updateTherapist(therapistId, updateData)`
*   **Description**: Updates an existing therapist's information.
*   **Input `therapistId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `TherapistObject` with fields to update)
    ```json
    {
      "full_name": "string", // Optional
      "credentials": "string", // Optional
      // ... other fields
    }
    ```
*   **Output**: `{ data: TherapistObject, error: ErrorObject | null }` (updated record)

### `deleteTherapist(therapistId)`
*   **Description**: Deletes a therapist. (Consider soft delete or cascading effects).
*   **Input `therapistId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `clients`

Manages client information, linked to a therapist.

### `createClient(clientData)`
*   **Description**: Creates a new client record.
*   **Input `clientData`**: `object`
    ```json
    {
      "therapist_id": "UUID", // Required
      "first_name": "string", // Required
      "last_name": "string", // Required
      "email": "string",
      "phone": "string",
      "status": "string" // Default: 'New'. Enum: ('Active', 'On Hold', 'Completed', 'New')
    }
    ```
*   **Output**: `{ data: ClientObject, error: ErrorObject | null }`

### `getClientById(clientId)`
*   **Description**: Retrieves a specific client by their ID.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: ClientObject, error: ErrorObject | null }`

### `getClientsByTherapistId(therapistId)`
*   **Description**: Retrieves all clients associated with a specific therapist.
*   **Input `therapistId`**: `string` (UUID)
*   **Output**: `{ data: ClientObject[], error: ErrorObject | null }`

### `updateClient(clientId, updateData)`
*   **Description**: Updates an existing client's information.
*   **Input `clientId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `ClientObject`)
*   **Output**: `{ data: ClientObject, error: ErrorObject | null }`

### `deleteClient(clientId)`
*   **Description**: Deletes a client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `client_profiles`

Manages detailed profile information for clients.

### `createClientProfile(profileData)`
*   **Description**: Creates a client profile.
*   **Input `profileData`**: `object`
    ```json
    {
      "client_id": "UUID", // Required
      "date_of_birth": "YYYY-MM-DD",
      "address": "string",
      "occupation": "string",
      "emergency_contact": "string",
      "primary_concerns": ["string"],
      "therapy_type": "string",
      "start_date": "YYYY-MM-DD"
    }
    ```
*   **Output**: `{ data: ClientProfileObject, error: ErrorObject | null }`

### `getClientProfileByClientId(clientId)`
*   **Description**: Retrieves the profile for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: ClientProfileObject, error: ErrorObject | null }`

### `updateClientProfile(profileId, updateData)`
*   **Description**: Updates a client's profile.
*   **Input `profileId`**: `string` (UUID of the client_profile record)
*   **Input `updateData`**: `object` (partial `ClientProfileObject`)
*   **Output**: `{ data: ClientProfileObject, error: ErrorObject | null }`

### `deleteClientProfile(profileId)`
*   **Description**: Deletes a client profile.
*   **Input `profileId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `sessions`

Manages therapy session details.

### `createSession(sessionData)`
*   **Description**: Schedules a new session.
*   **Input `sessionData`**: `object`
    ```json
    {
      "client_id": "UUID", // Required
      "therapist_id": "UUID", // Required
      "session_date": "ISO8601 Timestamp", // Required
      "duration_minutes": "integer",
      "session_type": "string", // Required. Enum: ('In-person', 'Virtual')
      "status": "string" // Default: 'Scheduled'. Enum: ('Scheduled', 'Completed', 'Canceled', 'No-show')
    }
    ```
*   **Output**: `{ data: SessionObject, error: ErrorObject | null }`

### `getSessionById(sessionId)`
*   **Description**: Retrieves a specific session by its ID.
*   **Input `sessionId`**: `string` (UUID)
*   **Output**: `{ data: SessionObject, error: ErrorObject | null }`

### `getSessionsByClientId(clientId)`
*   **Description**: Retrieves all sessions for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: SessionObject[], error: ErrorObject | null }`

### `getSessionsByTherapistId(therapistId)`
*   **Description**: Retrieves all sessions for a specific therapist.
*   **Input `therapistId`**: `string` (UUID)
*   **Output**: `{ data: SessionObject[], error: ErrorObject | null }`

### `updateSession(sessionId, updateData)`
*   **Description**: Updates an existing session's details.
*   **Input `sessionId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `SessionObject`)
*   **Output**: `{ data: SessionObject, error: ErrorObject | null }`

### `deleteSession(sessionId)`
*   **Description**: Deletes a session.
*   **Input `sessionId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `session_notes`

Manages notes taken during sessions.

### `createSessionNote(noteData)`
*   **Description**: Creates a new session note.
*   **Input `noteData`**: `object`
    ```json
    {
      "session_id": "UUID", // Required
      "therapist_id": "UUID", // Required
      "client_id": "UUID", // Required
      "title": "string", // Required
      "content": "JSONB", // Required (e.g., { "summary": "...", "observations": "..." })
      "therapy_type": "string",
      "tags": ["string"]
    }
    ```
*   **Output**: `{ data: SessionNoteObject, error: ErrorObject | null }`

### `getSessionNoteById(noteId)`
*   **Description**: Retrieves a specific session note by its ID.
*   **Input `noteId`**: `string` (UUID)
*   **Output**: `{ data: SessionNoteObject, error: ErrorObject | null }`

### `getSessionNotesBySessionId(sessionId)`
*   **Description**: Retrieves all notes for a specific session.
*   **Input `sessionId`**: `string` (UUID)
*   **Output**: `{ data: SessionNoteObject[], error: ErrorObject | null }`

### `getSessionNotesByClientId(clientId)`
*   **Description**: Retrieves all session notes for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: SessionNoteObject[], error: ErrorObject | null }`

### `updateSessionNote(noteId, updateData)`
*   **Description**: Updates an existing session note.
*   **Input `noteId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `SessionNoteObject`)
*   **Output**: `{ data: SessionNoteObject, error: ErrorObject | null }`

### `deleteSessionNote(noteId)`
*   **Description**: Deletes a session note.
*   **Input `noteId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `session_transcripts`

Manages transcripts of recorded sessions.

### `createSessionTranscript(transcriptData)`
*   **Description**: Creates a record for a session transcript.
*   **Input `transcriptData`**: `object`
    ```json
    {
      "session_id": "UUID", // Required
      "transcript_url": "string", // URL to the transcript file
      "transcription_status": "string" // Default: 'Pending'. Enum: ('Pending', 'Processing', 'Completed', 'Failed')
    }
    ```
*   **Output**: `{ data: SessionTranscriptObject, error: ErrorObject | null }`

### `getSessionTranscriptById(transcriptId)`
*   **Description**: Retrieves a specific transcript record by its ID.
*   **Input `transcriptId`**: `string` (UUID)
*   **Output**: `{ data: SessionTranscriptObject, error: ErrorObject | null }`

### `getSessionTranscriptBySessionId(sessionId)`
*   **Description**: Retrieves the transcript record for a specific session.
*   **Input `sessionId`**: `string` (UUID)
*   **Output**: `{ data: SessionTranscriptObject, error: ErrorObject | null }` (or array if multiple are possible)

### `updateSessionTranscript(transcriptId, updateData)`
*   **Description**: Updates a transcript record (e.g., status, URL).
*   **Input `transcriptId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `SessionTranscriptObject`)
*   **Output**: `{ data: SessionTranscriptObject, error: ErrorObject | null }`

### `deleteSessionTranscript(transcriptId)`
*   **Description**: Deletes a transcript record.
*   **Input `transcriptId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `transcript_segments`

Manages individual segments of a transcript (e.g., by speaker).

### `createTranscriptSegment(segmentData)`
*   **Description**: Adds a segment to a transcript.
*   **Input `segmentData`**: `object`
    ```json
    {
      "transcript_id": "UUID", // Required
      "speaker": "string", // Required. Enum: ('Therapist', 'Client')
      "text": "string", // Required
      "timestamp_start": "numeric", // Required
      "timestamp_end": "numeric"
    }
    ```
*   **Output**: `{ data: TranscriptSegmentObject, error: ErrorObject | null }`

### `getTranscriptSegmentById(segmentId)`
*   **Description**: Retrieves a specific transcript segment.
*   **Input `segmentId`**: `string` (UUID)
*   **Output**: `{ data: TranscriptSegmentObject, error: ErrorObject | null }`

### `getTranscriptSegmentsByTranscriptId(transcriptId)`
*   **Description**: Retrieves all segments for a specific transcript.
*   **Input `transcriptId`**: `string` (UUID)
*   **Output**: `{ data: TranscriptSegmentObject[], error: ErrorObject | null }`

### `updateTranscriptSegment(segmentId, updateData)`
*   **Description**: Updates a transcript segment.
*   **Input `segmentId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `TranscriptSegmentObject`)
*   **Output**: `{ data: TranscriptSegmentObject, error: ErrorObject | null }`

### `deleteTranscriptSegment(segmentId)`
*   **Description**: Deletes a transcript segment.
*   **Input `segmentId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `voice_profiles`

Manages client voice profiles (e.g., for speaker identification).

### `createVoiceProfile(profileData)`
*   **Description**: Creates a voice profile for a client.
*   **Input `profileData`**: `object`
    ```json
    {
      "client_id": "UUID", // Required
      "mfcc_profile": "JSONB" // Required (MFCC data or similar voice fingerprint)
    }
    ```
*   **Output**: `{ data: VoiceProfileObject, error: ErrorObject | null }`

### `getVoiceProfileById(profileId)`
*   **Description**: Retrieves a specific voice profile by its ID.
*   **Input `profileId`**: `string` (UUID)
*   **Output**: `{ data: VoiceProfileObject, error: ErrorObject | null }`

### `getVoiceProfileByClientId(clientId)`
*   **Description**: Retrieves the voice profile for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: VoiceProfileObject, error: ErrorObject | null }`

### `updateVoiceProfile(profileId, updateData)`
*   **Description**: Updates a voice profile.
*   **Input `profileId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `VoiceProfileObject`)
*   **Output**: `{ data: VoiceProfileObject, error: ErrorObject | null }`

### `deleteVoiceProfile(profileId)`
*   **Description**: Deletes a voice profile.
*   **Input `profileId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `therapy_insights`

Manages AI-generated insights from sessions.

### `createTherapyInsight(insightData)`
*   **Description**: Adds a new therapy insight.
*   **Input `insightData`**: `object`
    ```json
    {
      "session_id": "UUID", // Required
      "client_id": "UUID", // Required
      "therapist_id": "UUID", // Required
      "insights": "JSONB", // Required (e.g., { "key_themes": [], "sentiment_trends": {} })
      "sentiment_analysis": "JSONB" // (e.g., { "overall": "positive", "details": [] })
    }
    ```
*   **Output**: `{ data: TherapyInsightObject, error: ErrorObject | null }`

### `getTherapyInsightById(insightId)`
*   **Description**: Retrieves a specific therapy insight.
*   **Input `insightId`**: `string` (UUID)
*   **Output**: `{ data: TherapyInsightObject, error: ErrorObject | null }`

### `getTherapyInsightsBySessionId(sessionId)`
*   **Description**: Retrieves all insights for a specific session.
*   **Input `sessionId`**: `string` (UUID)
*   **Output**: `{ data: TherapyInsightObject[], error: ErrorObject | null }`

### `getTherapyInsightsByClientId(clientId)`
*   **Description**: Retrieves all insights for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: TherapyInsightObject[], error: ErrorObject | null }`

### `updateTherapyInsight(insightId, updateData)`
*   **Description**: Updates a therapy insight.
*   **Input `insightId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `TherapyInsightObject`)
*   **Output**: `{ data: TherapyInsightObject, error: ErrorObject | null }`

### `deleteTherapyInsight(insightId)`
*   **Description**: Deletes a therapy insight.
*   **Input `insightId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `treatment_goals`

Manages client treatment goals.

### `createTreatmentGoal(goalData)`
*   **Description**: Creates a new treatment goal for a client.
*   **Input `goalData`**: `object`
    ```json
    {
      "client_id": "UUID", // Required
      "goal_description": "string", // Required
      "status": "string", // Default: 'Not Started'. Enum: ('Not Started', 'In Progress', 'Achieved')
      "target_date": "YYYY-MM-DD"
    }
    ```
*   **Output**: `{ data: TreatmentGoalObject, error: ErrorObject | null }`

### `getTreatmentGoalById(goalId)`
*   **Description**: Retrieves a specific treatment goal.
*   **Input `goalId`**: `string` (UUID)
*   **Output**: `{ data: TreatmentGoalObject, error: ErrorObject | null }`

### `getTreatmentGoalsByClientId(clientId)`
*   **Description**: Retrieves all treatment goals for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: TreatmentGoalObject[], error: ErrorObject | null }`

### `updateTreatmentGoal(goalId, updateData)`
*   **Description**: Updates a treatment goal.
*   **Input `goalId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `TreatmentGoalObject`)
*   **Output**: `{ data: TreatmentGoalObject, error: ErrorObject | null }`

### `deleteTreatmentGoal(goalId)`
*   **Description**: Deletes a treatment goal.
*   **Input `goalId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---

## Table: `progress_metrics`

Manages client progress metrics over time.

### `createProgressMetric(metricData)`
*   **Description**: Records a new progress metric for a client.
*   **Input `metricData`**: `object`
    ```json
    {
      "client_id": "UUID", // Required
      "metric_name": "string", // Required
      "metric_value": "numeric", // Required
      "date_recorded": "YYYY-MM-DD", // Required
      "notes": "string"
    }
    ```
*   **Output**: `{ data: ProgressMetricObject, error: ErrorObject | null }`

### `getProgressMetricById(metricId)`
*   **Description**: Retrieves a specific progress metric.
*   **Input `metricId`**: `string` (UUID)
*   **Output**: `{ data: ProgressMetricObject, error: ErrorObject | null }`

### `getProgressMetricsByClientId(clientId)`
*   **Description**: Retrieves all progress metrics for a specific client.
*   **Input `clientId`**: `string` (UUID)
*   **Output**: `{ data: ProgressMetricObject[], error: ErrorObject | null }`

### `updateProgressMetric(metricId, updateData)`
*   **Description**: Updates a progress metric.
*   **Input `metricId`**: `string` (UUID)
*   **Input `updateData`**: `object` (partial `ProgressMetricObject`)
*   **Output**: `{ data: ProgressMetricObject, error: ErrorObject | null }`

### `deleteProgressMetric(metricId)`
*   **Description**: Deletes a progress metric.
*   **Input `metricId`**: `string` (UUID)
*   **Output**: `{ data: { success: boolean }, error: ErrorObject | null }`

---