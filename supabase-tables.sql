-- Create therapists table
CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name TEXT,
    credentials TEXT,
    specialties TEXT[],
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('Active', 'On Hold', 'Completed', 'New')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date_of_birth DATE,
    address TEXT,
    occupation TEXT,
    emergency_contact TEXT,
    primary_concerns TEXT[],
    therapy_type TEXT,
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    session_type TEXT NOT NULL CHECK (session_type IN ('In-person', 'Virtual')),
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Canceled', 'No-show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_notes table
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    therapy_type TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_transcripts table
CREATE TABLE IF NOT EXISTS public.session_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    transcript_url TEXT,
    transcription_status TEXT NOT NULL DEFAULT 'Pending' CHECK (transcription_status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transcript_segments table
CREATE TABLE IF NOT EXISTS public.transcript_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES public.session_transcripts(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL CHECK (speaker IN ('Therapist', 'Client')),
    text TEXT NOT NULL,
    timestamp_start NUMERIC NOT NULL,
    timestamp_end NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_profiles table
CREATE TABLE IF NOT EXISTS public.voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    mfcc_profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapy_insights table
CREATE TABLE IF NOT EXISTS public.therapy_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    insights JSONB NOT NULL,
    sentiment_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatment_goals table
CREATE TABLE IF NOT EXISTS public.treatment_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    goal_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Achieved')),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_metrics table
CREATE TABLE IF NOT EXISTS public.progress_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    date_recorded DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clients_therapist_id ON public.clients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_id ON public.client_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist_id ON public.sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_session_id ON public.session_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_transcript_id ON public.transcript_segments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_therapy_insights_session_id ON public.therapy_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_therapy_insights_client_id ON public.therapy_insights(client_id);
CREATE INDEX IF NOT EXISTS idx_treatment_goals_client_id ON public.treatment_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_client_id ON public.progress_metrics(client_id);

-- Add Row Level Security (RLS) policies (if you want to restrict access)
-- You would typically add these after creating the tables

-- Example: Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Example: Create a policy that allows users to only see their own clients
-- This assumes you're using Supabase Auth and each therapist has a user account
CREATE POLICY "Therapists can view their own clients"
ON public.clients
FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    )
);

-- Add similar policies for other tables as needed

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER set_timestamp_therapists
BEFORE UPDATE ON public.therapists
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_client_profiles
BEFORE UPDATE ON public.client_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_sessions
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_session_notes
BEFORE UPDATE ON public.session_notes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_session_transcripts
BEFORE UPDATE ON public.session_transcripts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_transcript_segments
BEFORE UPDATE ON public.transcript_segments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_voice_profiles
BEFORE UPDATE ON public.voice_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_therapy_insights
BEFORE UPDATE ON public.therapy_insights
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_treatment_goals
BEFORE UPDATE ON public.treatment_goals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_progress_metrics
BEFORE UPDATE ON public.progress_metrics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert mock data for therapists table
INSERT INTO public.therapists (id, user_id, full_name, credentials, specialties, bio, profile_image_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'Dr. John Doe', 'PhD, LPC', ARRAY['Anxiety', 'Depression'], 'Experienced therapist specializing in anxiety and depression.', 'https://example.com/john_doe.jpg'),
  ('22222222-2222-2222-2222-222222222222', gen_random_uuid(), 'Dr. Jane Smith', 'PsyD', ARRAY['Trauma', 'PTSD'], 'Expert in trauma and PTSD therapy.', 'https://example.com/jane_smith.jpg');

-- Insert mock data for clients table
INSERT INTO public.clients (id, therapist_id, first_name, last_name, email, phone, status)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Alice', 'Johnson', 'alice.johnson@example.com', '123-456-7890', 'Active'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Bob', 'Williams', 'bob.williams@example.com', '987-654-3210', 'New');

-- Insert mock data for client_profiles table
INSERT INTO public.client_profiles (client_id, date_of_birth, address, occupation, emergency_contact, primary_concerns, therapy_type, start_date)
VALUES
  ('33333333-3333-3333-3333-333333333333', '1990-01-01', '123 Main St', 'Engineer', 'Jane Doe', ARRAY['Stress', 'Work-life balance'], 'CBT', '2025-01-01'),
  ('44444444-4444-4444-4444-444444444444', '1985-05-15', '456 Elm St', 'Teacher', 'John Smith', ARRAY['Anxiety'], 'DBT', '2025-02-01');

-- Insert mock data for sessions table
INSERT INTO public.sessions (id, client_id, therapist_id, session_date, duration_minutes, session_type, status)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '2025-05-01 10:00:00+00', 60, 'In-person', 'Completed'),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '2025-05-02 14:00:00+00', 45, 'Virtual', 'Scheduled');

-- Insert mock data for session_notes table
INSERT INTO public.session_notes (session_id, therapist_id, client_id, title, content, therapy_type, tags)
VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Initial Assessment', '{"summary": "Discussed initial concerns and therapy goals."}', 'CBT', ARRAY['Assessment', 'Goals']),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Follow-up Session', '{"summary": "Reviewed progress and adjusted therapy plan."}', 'DBT', ARRAY['Progress', 'Plan']);

-- Insert mock data for session_transcripts table
INSERT INTO public.session_transcripts (id, session_id, transcript_url, transcription_status)
VALUES
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'https://example.com/transcript1.txt', 'Completed'),
  ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'https://example.com/transcript2.txt', 'Pending');

-- Insert mock data for transcript_segments table
INSERT INTO public.transcript_segments (transcript_id, speaker, text, timestamp_start, timestamp_end)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'Therapist', 'How are you feeling today?', 0, 5),
  ('77777777-7777-7777-7777-777777777777', 'Client', 'I am feeling better, thank you.', 6, 10);

-- Insert mock data for voice_profiles table
INSERT INTO public.voice_profiles (client_id, mfcc_profile)
VALUES
  ('33333333-3333-3333-3333-333333333333', '{"mfcc": [1.2, 3.4, 5.6]}'),
  ('44444444-4444-4444-4444-444444444444', '{"mfcc": [2.3, 4.5, 6.7]}');

-- Insert mock data for therapy_insights table
INSERT INTO public.therapy_insights (session_id, client_id, therapist_id, insights, sentiment_analysis)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '{"key_insights": "Client is making progress."}', '{"sentiment": "positive"}'),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '{"key_insights": "Client is struggling with anxiety."}', '{"sentiment": "neutral"}');

-- Insert mock data for treatment_goals table
INSERT INTO public.treatment_goals (client_id, goal_description, status, target_date)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Reduce anxiety levels', 'In Progress', '2025-12-31'),
  ('44444444-4444-4444-4444-444444444444', 'Improve work-life balance', 'Not Started', '2026-06-30');

-- Insert mock data for progress_metrics table
INSERT INTO public.progress_metrics (client_id, metric_name, metric_value, date_recorded, notes)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Anxiety Level', 3.5, '2025-05-01', 'Client reported feeling less anxious.'),
  ('44444444-4444-4444-4444-444444444444', 'Work-life Balance', 2.0, '2025-05-02', 'Client is still struggling with balance.');
