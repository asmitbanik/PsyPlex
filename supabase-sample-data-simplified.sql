-- STEP 1: Insert a sample therapist
-- Replace 'replace-with-real-auth-user-id' with an actual user ID from your Supabase auth system
INSERT INTO public.therapists (user_id, full_name, credentials, specialties, bio, profile_image_url)
VALUES (
    'replace-with-real-auth-user-id',  -- Important: Replace this with a real user ID
    'Dr. Sarah Johnson',
    'Ph.D., Clinical Psychology',
    ARRAY['Anxiety', 'Depression', 'Cognitive Behavioral Therapy'],
    'Dr. Johnson specializes in evidence-based approaches to treating anxiety and depression, with over 10 years of clinical experience.',
    'https://example.com/profiles/sarah-johnson.jpg'
) RETURNING id;  -- This will show the ID in the results

-- STEP 2: Insert sample clients
-- Copy the therapist_id from above and replace 'paste-therapist-id-here'
INSERT INTO public.clients (therapist_id, first_name, last_name, email, phone, status)
VALUES 
('paste-therapist-id-here', 'John', 'Doe', 'john.doe@example.com', '+1-555-123-4567', 'Active'),
('paste-therapist-id-here', 'Jane', 'Smith', 'jane.smith@example.com', '+1-555-987-6543', 'Active'),
('paste-therapist-id-here', 'Michael', 'Brown', 'michael.brown@example.com', '+1-555-456-7890', 'New')
RETURNING id, first_name, last_name;  -- This will show the IDs in the results

-- STEP 3: Insert client profiles
-- Copy each client ID from above and replace in the appropriate statement below
INSERT INTO public.client_profiles (client_id, date_of_birth, occupation, primary_concerns, therapy_type, start_date)
VALUES 
('paste-john-doe-id-here', '1985-03-15', 'Software Engineer', ARRAY['Anxiety', 'Work Stress'], 'Cognitive Behavioral Therapy', '2023-11-01'),
('paste-jane-smith-id-here', '1990-07-22', 'Marketing Manager', ARRAY['Depression', 'Relationship Issues'], 'Psychodynamic Therapy', '2023-09-15'),
('paste-michael-brown-id-here', '1978-11-30', 'Teacher', ARRAY['Grief', 'Life Transitions'], 'Solution-Focused Therapy', '2024-01-10');

-- STEP 4: Insert sessions
-- Use the client and therapist IDs from above
INSERT INTO public.sessions (client_id, therapist_id, session_date, duration_minutes, session_type, status)
VALUES
('paste-john-doe-id-here', 'paste-therapist-id-here', '2024-05-01 10:00:00', 50, 'Virtual', 'Completed'),
('paste-john-doe-id-here', 'paste-therapist-id-here', '2024-05-08 10:00:00', 50, 'Virtual', 'Completed'),
('paste-john-doe-id-here', 'paste-therapist-id-here', '2024-05-15 10:00:00', 50, 'Virtual', 'Scheduled'),
('paste-jane-smith-id-here', 'paste-therapist-id-here', '2024-05-02 14:00:00', 45, 'In-person', 'Completed'),
('paste-jane-smith-id-here', 'paste-therapist-id-here', '2024-05-16 14:00:00', 45, 'In-person', 'Scheduled')
RETURNING id, client_id;

-- STEP 5: Insert session notes
-- Copy a session ID from above (preferably the first John Doe session)
INSERT INTO public.session_notes (session_id, therapist_id, client_id, title, content, therapy_type, tags)
VALUES
('paste-session-id-here', 'paste-therapist-id-here', 'paste-john-doe-id-here', 'Initial Assessment', 
'{"content": "Client reports significant work-related stress and anxiety symptoms. Sleep disturbances noted. Will begin CBT techniques focusing on cognitive restructuring.", "mood": "Anxious", "homework": "Daily thought record" }',
'Cognitive Behavioral Therapy', ARRAY['Assessment', 'Anxiety', 'Work Stress']);

-- STEP 6: Insert treatment goals
INSERT INTO public.treatment_goals (client_id, goal_description, status, target_date)
VALUES
('paste-john-doe-id-here', 'Develop effective stress management strategies for work situations', 'In Progress', '2024-07-15'),
('paste-john-doe-id-here', 'Reduce frequency of panic attacks by 50%', 'Not Started', '2024-08-30'),
('paste-jane-smith-id-here', 'Improve communication skills in personal relationships', 'In Progress', '2024-06-30');

-- STEP 7: Insert progress metrics
INSERT INTO public.progress_metrics (client_id, metric_name, metric_value, date_recorded, notes)
VALUES
('paste-john-doe-id-here', 'Anxiety Level (0-10)', 8, '2024-05-01', 'Initial assessment'),
('paste-john-doe-id-here', 'Anxiety Level (0-10)', 7, '2024-05-08', 'After first week of practice'),
('paste-jane-smith-id-here', 'Depression Scale (PHQ-9)', 14, '2024-05-02', 'Initial assessment');
