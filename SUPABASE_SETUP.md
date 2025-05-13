# Supabase Setup for PsyPlex

## Database Setup Instructions

### Step 1: Create Tables in Supabase

1. Log in to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Navigate to your project (URL: https://zoewqivrhlkrfpqdwkay.supabase.co)
3. Go to the "SQL Editor" section in the left sidebar
4. Create a new query and copy the contents of `supabase-tables.sql` into the editor
5. Run the SQL script to create all tables, indexes, triggers, and RLS policies
6. Verify that all tables were created successfully by checking the "Table Editor" section

### Step 2: Insert Sample Data (Optional)

#### Step 2.1: Create a User in Supabase Auth

1. Go to the "Authentication" section in the left sidebar
2. Click on "Users" tab
3. Click "+ Add User" button in the top right corner
4. Enter an email and password for the user
5. After creating the user, click on the user to see their details
6. Copy the UUID of the user (you'll need this for the next step)

#### Step 2.2: Insert Sample Data Using the Simplified Script

1. Open the SQL Editor and create a new query
2. Use the `supabase-sample-data-simplified.sql` file, which is designed to be run in steps
3. Follow these steps in order:

   - **STEP 1**: Insert the sample therapist
     - Copy the entire first INSERT statement 
     - Replace `'replace-with-real-auth-user-id'` with the UUID you copied from the user in Auth
     - Execute this statement and note the therapist ID in the results

   - **STEP 2**: Insert sample clients 
     - Copy the clients INSERT statement
     - Replace `'paste-therapist-id-here'` with the therapist ID from step 1
     - Execute this statement and note the client IDs in the results

   - **STEP 3**: Insert client profiles
     - Copy the client_profiles INSERT statement
     - Replace the placeholders with the corresponding client IDs
     - Execute this statement

   - **STEP 4**: Insert sessions
     - Copy the sessions INSERT statement
     - Replace the therapist and client ID placeholders
     - Execute this statement and note the session IDs

   - **STEP 5-7**: Complete the remaining steps
     - For each remaining step, copy the statement, replace the placeholders with real IDs, and execute
     - Verify the data appears in the Table Editor after each step

### Step 3: Verify Database Configuration

After running the scripts:

1. Go to the "Table Editor" section in the left sidebar
2. You should see all the following tables:
   - therapists
   - clients
   - client_profiles
   - sessions
   - session_notes
   - session_transcripts
   - transcript_segments
   - voice_profiles
   - therapy_insights
   - treatment_goals
   - progress_metrics
3. Click on each table to verify:
   - The correct schema (columns)
   - The sample data (if you added it)
   - That relationships work (e.g., click on a client to see related profiles)

### Step 4: Configure Row Level Security (RLS)

The tables have been created with basic RLS policies that allow authenticated therapists to see only their own data. You may need to adjust these policies:

1. Go to "Authentication" → "Policies" in the left sidebar
2. Select a table to view its policies
3. You can add or modify policies based on your specific security requirements

For example, the clients table has a policy that allows therapists to view only their own clients.

### Step 5: Test with the PsyPlex Application

1. Make sure the `.env` file in your project has the correct Supabase URL and anon key
2. Start the application with `bun dev` or `npm run dev`
3. Log in with the user you created in Supabase Auth
4. Verify that the application can connect to Supabase and retrieve data

## Database Schema

The database consists of several interconnected tables:

- `therapists`: Stores information about therapists/practitioners
- `clients`: Basic client information linked to therapists
- `client_profiles`: Detailed client profile information
- `sessions`: Therapy session records
- `session_notes`: Notes taken during therapy sessions
- `session_transcripts`: Metadata about session recordings/transcriptions
- `transcript_segments`: Individual segments of transcribed sessions
- `voice_profiles`: Voice recognition profiles for clients
- `therapy_insights`: AI-generated insights from sessions
- `treatment_goals`: Goals set for client treatment
- `progress_metrics`: Metrics tracking client progress

## Environment Variables

Make sure your `.env` file contains the following variables:

```
VITE_SUPABASE_URL=https://zoewqivrhlkrfpqdwkay.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

After setting up the database:

1. Update your application to use the Supabase services
2. Migrate any existing data from mock JSON files to the database
3. Test all CRUD operations to ensure they work with the new database structure
4. Set up appropriate backups and monitoring for your Supabase project

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/installing)
