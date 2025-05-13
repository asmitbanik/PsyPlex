-- Mock data for PsyPlex tables

-- Therapists
INSERT INTO public.therapists (user_id, full_name, credentials, specialties, bio, profile_image_url) VALUES
(gen_random_uuid(), 'Dr. Alice Wonderland', 'PhD, LCSW', '{CBT, DBT, Mindfulness}', 'Experienced therapist specializing in cognitive behavioral therapy.', 'https://example.com/alice.jpg'),
(gen_random_uuid(), 'Dr. Bob The Builder', 'MD, Psychiatrist', '{Psychopharmacology, Anxiety Disorders}', 'Psychiatrist with a focus on medication management and anxiety.', 'https://example.com/bob.jpg'),
(gen_random_uuid(), 'Dr. Carol Danvers', 'PsyD', '{Trauma, EMDR}', 'Clinical psychologist specializing in trauma-informed care and EMDR.', 'https://example.com/carol.jpg');

-- Clients
-- Assuming therapist_id refers to one of the therapists inserted above.
-- Let's get the therapist IDs first (in a real scenario, you might fetch these or know them)
-- For mock data, we'll just use placeholders or assume the order.
-- To make this runnable, we'll use subqueries if the DB supports it, or you might need to run these separately.

-- For simplicity in a static script, we'll assume we know the IDs or use a fixed UUID if we can't easily query.
-- However, it's better to make it more robust if possible.
-- Let's assume the first therapist created is the one we'll assign clients to for now.
-- This is a simplification for mock data generation.

WITH therapist_ids AS (
    SELECT id FROM public.therapists LIMIT 3
),
first_therapist AS (
    SELECT id FROM therapist_ids OFFSET 0 LIMIT 1
),
second_therapist AS (
    SELECT id FROM therapist_ids OFFSET 1 LIMIT 1
),
third_therapist AS (
    SELECT id FROM therapist_ids OFFSET 2 LIMIT 1
)
INSERT INTO public.clients (therapist_id, first_name, last_name, email, phone, status) VALUES
((SELECT id FROM first_therapist), 'John', 'Doe', 'john.doe@example.com', '555-0101', 'Active'),
((SELECT id FROM first_therapist), 'Jane', 'Smith', 'jane.smith@example.com', '555-0102', 'Active'),
((SELECT id FROM second_therapist), 'Peter', 'Pan', 'peter.pan@example.com', '555-0103', 'New'),
((SELECT id FROM third_therapist), 'Wendy', 'Darling', 'wendy.darling@example.com', '555-0104', 'On Hold'),
((SELECT id FROM second_therapist), 'James', 'Kirk', 'james.kirk@example.com', '555-0105', 'Completed');

-- Client Profiles
WITH client_ids AS (
    SELECT id FROM public.clients LIMIT 5
),
first_client AS (
    SELECT id FROM client_ids OFFSET 0 LIMIT 1
),
second_client AS (
    SELECT id FROM client_ids OFFSET 1 LIMIT 1
),
third_client AS (
    SELECT id FROM client_ids OFFSET 2 LIMIT 1
),
fourth_client AS (
    SELECT id FROM client_ids OFFSET 3 LIMIT 1
),
fifth_client AS (
    SELECT id FROM client_ids OFFSET 4 LIMIT 1
)
INSERT INTO public.client_profiles (client_id, date_of_birth, address, occupation, emergency_contact, primary_concerns, therapy_type, start_date) VALUES
((SELECT id FROM first_client), '1990-05-15', '123 Main St, Anytown', 'Software Engineer', 'Mary Doe (Spouse) 555-0111', '{Anxiety, Stress}', 'CBT', '2023-01-10'),
((SELECT id FROM second_client), '1985-11-20', '456 Oak Ave, Anytown', 'Graphic Designer', 'Robert Smith (Brother) 555-0112', '{Depression, Self-esteem}', 'Psychodynamic', '2022-11-05'),
((SELECT id FROM third_client), '2000-07-01', '789 Pine Ln, Neverland', 'Student', 'Tinker Bell (Friend) 555-0113', '{Adjustment Disorder}', 'Supportive', '2024-03-01'),
((SELECT id FROM fourth_client), '1995-02-28', '101 Lost Boys Rd, Neverland', 'Writer', 'Michael Darling (Brother) 555-0114', '{Relationship Issues}', 'Couples Therapy', '2024-02-15');

-- Sessions
-- We need client_id and therapist_id.
WITH first_therapist_id AS (
    SELECT id FROM public.therapists WHERE full_name = 'Dr. Alice Wonderland'
),
second_therapist_id AS (
    SELECT id FROM public.therapists WHERE full_name = 'Dr. Bob The Builder'
),
first_client_id AS (
    SELECT id FROM public.clients WHERE email = 'john.doe@example.com'
),
second_client_id AS (
    SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'
),
third_client_id AS (
    SELECT id FROM public.clients WHERE email = 'peter.pan@example.com'
)
INSERT INTO public.sessions (client_id, therapist_id, session_date, duration_minutes, session_type, status) VALUES
((SELECT id FROM first_client_id), (SELECT id FROM first_therapist_id), '2024-05-01 10:00:00+00', 50, 'Virtual', 'Completed'),
((SELECT id FROM first_client_id), (SELECT id FROM first_therapist_id), '2024-05-08 10:00:00+00', 50, 'Virtual', 'Scheduled'),
((SELECT id FROM second_client_id), (SELECT id FROM first_therapist_id), '2024-05-03 14:00:00+00', 50, 'In-person', 'Completed'),
((SELECT id FROM second_client_id), (SELECT id FROM first_therapist_id), '2024-05-10 14:00:00+00', 50, 'In-person', 'Scheduled'),
((SELECT id FROM third_client_id), (SELECT id FROM second_therapist_id), '2024-05-06 11:00:00+00', 60, 'Virtual', 'Canceled'),
((SELECT id FROM third_client_id), (SELECT id FROM second_therapist_id), '2024-05-13 11:00:00+00', 60, 'Virtual', 'Scheduled');

-- Session Notes
WITH first_session_data AS (
    SELECT s.id as session_id, s.client_id, s.therapist_id
    FROM public.sessions s
    JOIN public.clients c ON s.client_id = c.id
    WHERE c.email = 'john.doe@example.com' AND s.status = 'Completed' LIMIT 1
),
second_session_data AS (
    SELECT s.id as session_id, s.client_id, s.therapist_id
    FROM public.sessions s
    JOIN public.clients c ON s.client_id = c.id
    WHERE c.email = 'jane.smith@example.com' AND s.status = 'Completed' LIMIT 1
)
INSERT INTO public.session_notes (session_id, therapist_id, client_id, title, content, therapy_type, tags) VALUES
((SELECT session_id FROM first_session_data), (SELECT therapist_id FROM first_session_data), (SELECT client_id FROM first_session_data), 'Session 1: Initial Assessment', '{"observations": "Client presented with high anxiety.", "plan": "Introduce CBT techniques next session."}', 'CBT', '{anxiety, initial_assessment}'),
((SELECT session_id FROM second_session_data), (SELECT therapist_id FROM second_session_data), (SELECT client_id FROM second_session_data), 'Session 1: Exploring Core Beliefs', '{"summary": "Discussed family history and impact on self-esteem.", "homework": "Journal about core beliefs."}', 'Psychodynamic', '{self-esteem, family_history}');

-- Session Transcripts
WITH first_completed_session AS (
    SELECT id FROM public.sessions WHERE status = 'Completed' LIMIT 1 OFFSET 0
),
second_completed_session AS (
    SELECT id FROM public.sessions WHERE status = 'Completed' LIMIT 1 OFFSET 1
)
INSERT INTO public.session_transcripts (session_id, transcript_url, transcription_status) VALUES
((SELECT id FROM first_completed_session), 'https://example.com/transcript1.txt', 'Completed'),
((SELECT id FROM second_completed_session), 'https://example.com/transcript2.txt', 'Pending');

-- Transcript Segments
WITH first_transcript AS (
    SELECT id FROM public.session_transcripts WHERE transcription_status = 'Completed' LIMIT 1
)
INSERT INTO public.transcript_segments (transcript_id, speaker, text, timestamp_start, timestamp_end) VALUES
((SELECT id FROM first_transcript), 'Therapist', 'Hello John, how are you feeling today?', 0.5, 3.2),
((SELECT id FROM first_transcript), 'Client', 'I'm feeling quite anxious, doctor.', 3.5, 6.1),
((SELECT id FROM first_transcript), 'Therapist', 'Okay, let's talk about that.', 6.5, 8.0);

-- Voice Profiles
WITH first_client_id AS (
    SELECT id FROM public.clients WHERE email = 'john.doe@example.com'
),
second_client_id AS (
    SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'
)
INSERT INTO public.voice_profiles (client_id, mfcc_profile) VALUES
((SELECT id FROM first_client_id), '{"profile_type": "mfcc_average", "values": [0.1, 0.2, -0.1, 0.3, ...]}'),
((SELECT id FROM second_client_id), '{"profile_type": "mfcc_average", "values": [-0.05, 0.15, 0.0, 0.25, ...]}');

-- Therapy Insights
WITH insight_session_data AS (
    SELECT s.id as session_id, s.client_id, s.therapist_id
    FROM public.sessions s
    JOIN public.clients c ON s.client_id = c.id
    WHERE c.email = 'john.doe@example.com' AND s.status = 'Completed' LIMIT 1
)
INSERT INTO public.therapy_insights (session_id, client_id, therapist_id, insights, sentiment_analysis) VALUES
((SELECT session_id FROM insight_session_data), (SELECT client_id FROM insight_session_data), (SELECT therapist_id FROM insight_session_data), '{"key_themes": ["anxiety about work", "sleep difficulties"], "patterns": "Increased anxiety reported on Mondays"}', '{"overall_sentiment": "negative", "segments": [{"text": "I'm feeling quite anxious", "sentiment": "negative"}]}');

-- Treatment Goals
WITH first_client_id AS (
    SELECT id FROM public.clients WHERE email = 'john.doe@example.com'
),
second_client_id AS (
    SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'
)
INSERT INTO public.treatment_goals (client_id, goal_description, status, target_date) VALUES
((SELECT id FROM first_client_id), 'Reduce anxiety attacks to once per week.', 'In Progress', '2024-08-01'),
((SELECT id FROM first_client_id), 'Improve sleep quality to 7 hours per night.', 'Not Started', '2024-07-15'),
((SELECT id FROM second_client_id), 'Identify and challenge 3 negative core beliefs.', 'In Progress', '2024-09-01');

-- Progress Metrics
WITH first_client_id AS (
    SELECT id FROM public.clients WHERE email = 'john.doe@example.com'
),
second_client_id AS (
    SELECT id FROM public.clients WHERE email = 'jane.smith@example.com'
)
INSERT INTO public.progress_metrics (client_id, metric_name, metric_value, date_recorded, notes) VALUES
((SELECT id FROM first_client_id), 'GAD-7 Score', 15, '2024-05-01', 'Initial assessment score.'),
((SELECT id FROM first_client_id), 'GAD-7 Score', 12, '2024-05-15', 'Score after 2 sessions.'),
((SELECT id FROM first_client_id), 'Sleep Hours', 5.5, '2024-05-01', 'Average hours per night.'),
((SELECT id FROM second_client_id), 'PHQ-9 Score', 18, '2024-05-03', 'Initial assessment score.');

-- Note: For JSONB fields like 'content' in session_notes, 'mfcc_profile' in voice_profiles,
-- and 'insights'/'sentiment_analysis' in therapy_insights, the exact structure of the JSON
-- will depend on your application's needs. The examples above are illustrative.

-- Ensure all foreign key relationships are respected. The use of CTEs (WITH clauses)
-- helps in fetching IDs from parent tables to use in child tables. If your SQL environment
-- has limitations with CTEs in this manner for INSERTs, you might need to run SELECT queries
-- first to get the IDs and then manually put them into the INSERT statements, or use scripting.
