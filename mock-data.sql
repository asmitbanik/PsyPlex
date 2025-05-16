-- mock-data.sql: SQL inserts for PsyPlex tables mock data

-- Mock data for therapists table
INSERT INTO public.therapists (user_id, full_name, credentials, specialties, bio, profile_image_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. John Doe', 'PhD, LPC', ARRAY['Anxiety', 'Depression'], 'Experienced therapist specializing in anxiety and depression.', 'https://example.com/john_doe.jpg'),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Jane Smith', 'PsyD', ARRAY['Trauma', 'PTSD'], 'Expert in trauma and PTSD therapy.', 'https://example.com/jane_smith.jpg');

-- Mock data for clients table
INSERT INTO public.clients (therapist_id, first_name, last_name, email, phone, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice', 'Johnson', 'alice.johnson@example.com', '123-456-7890', 'Active'),
  ('22222222-2222-2222-2222-222222222222', 'Bob', 'Williams', 'bob.williams@example.com', '987-654-3210', 'New');

-- Mock data for client_profiles table
INSERT INTO public.client_profiles (client_id, date_of_birth, address, occupation, emergency_contact, primary_concerns, therapy_type, start_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', '1990-01-01', '123 Main St', 'Engineer', 'Jane Doe', ARRAY['Stress', 'Work-life balance'], 'CBT', '2025-01-01'),
  ('22222222-2222-2222-2222-222222222222', '1985-05-15', '456 Elm St', 'Teacher', 'John Smith', ARRAY['Anxiety'], 'DBT', '2025-02-01');

-- Mock data for sessions table
INSERT INTO public.sessions (client_id, therapist_id, session_date, duration_minutes, session_type, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2025-05-01 10:00:00+00', 60, 'In-person', 'Completed'),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '2025-05-02 14:00:00+00', 45, 'Virtual', 'Scheduled');

-- Mock data for session_notes table
INSERT INTO public.session_notes (session_id, therapist_id, client_id, title, content, therapy_type, tags)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Initial Assessment', '{"summary": "Discussed initial concerns and therapy goals."}', 'CBT', ARRAY['Assessment', 'Goals']),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Follow-up Session', '{"summary": "Reviewed progress and adjusted therapy plan."}', 'DBT', ARRAY['Progress', 'Plan']);

-- Mock data for session_transcripts table
INSERT INTO public.session_transcripts (session_id, transcript_url, transcription_status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://example.com/transcript1.txt', 'Completed'),
  ('22222222-2222-2222-2222-222222222222', 'https://example.com/transcript2.txt', 'Pending');

-- Mock data for transcript_segments table
INSERT INTO public.transcript_segments (transcript_id, speaker, text, timestamp_start, timestamp_end)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Therapist', 'How are you feeling today?', 0, 5),
  ('11111111-1111-1111-1111-111111111111', 'Client', 'I am feeling better, thank you.', 6, 10);

-- Mock data for voice_profiles table
INSERT INTO public.voice_profiles (client_id, mfcc_profile)
VALUES
  ('11111111-1111-1111-1111-111111111111', '{"mfcc": [1.2, 3.4, 5.6]}'),
  ('22222222-2222-2222-2222-222222222222', '{"mfcc": [2.3, 4.5, 6.7]}');

-- Mock data for therapy_insights table
INSERT INTO public.therapy_insights (session_id, client_id, therapist_id, insights, sentiment_analysis)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"key_insights": "Client is making progress."}', '{"sentiment": "positive"}'),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"key_insights": "Client is struggling with anxiety."}', '{"sentiment": "neutral"}');

-- Mock data for treatment_goals table
INSERT INTO public.treatment_goals (client_id, goal_description, status, target_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Reduce anxiety levels', 'In Progress', '2025-12-31'),
  ('22222222-2222-2222-2222-222222222222', 'Improve work-life balance', 'Not Started', '2026-06-30');

-- Mock data for progress_metrics table
INSERT INTO public.progress_metrics (client_id, metric_name, metric_value, date_recorded, notes)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Anxiety Level', 3.5, '2025-05-01', 'Client reported feeling less anxious.'),
  ('22222222-2222-2222-2222-222222222222', 'Work-life Balance', 2.0, '2025-05-02', 'Client is still struggling with balance.');