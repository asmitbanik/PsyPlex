# Database Operations Layer

This directory contains all database operations for the PsyPlex application. The operations are organized by entity type and follow a consistent pattern for ease of use and maintenance.

## Architecture

- Each entity has its own file with CRUD operations and any additional specialized queries
- All operations follow a consistent pattern returning a `DbResponse<T>` object
- Operations use the Supabase client for database interactions
- All operations include proper error handling

## Files and Their Purpose

- `supabaseClient.ts` - Initializes the Supabase client and defines the `DbResponse` type
- `index.ts` - Central export file that re-exports all operations
- `therapists.ts` - Operations for therapist data
- `clients.ts` - Operations for client data
- `clientProfiles.ts` - Operations for client profile data
- `sessions.ts` - Operations for therapy session data
- `sessionNotes.ts` - Operations for session notes data
- `sessionTranscripts.ts` - Operations for session transcript data
- `transcriptSegments.ts` - Operations for transcript segment data
- `voiceProfiles.ts` - Operations for voice profile data
- `therapyInsights.ts` - Operations for therapy insights data
- `treatmentGoals.ts` - Operations for treatment goals data
- `progressMetrics.ts` - Operations for progress metrics data

## Usage

Import operations directly from the db-operations module:

```typescript
import { 
  getClientById, 
  createSession, 
  getSessionsByClientId 
} from '../services/db-operations';

// Example usage
const client = await getClientById('client-uuid');
```

## Response Format

All database operations return a consistent `DbResponse<T>` object with the following structure:

```typescript
interface DbResponse<T> {
  data: T | null;   // The returned data or null if there was an error
  error: Error | null; // The error object or null if the operation succeeded
}
```

## Error Handling

Example of proper error handling with db operations:

```typescript
const { data: client, error } = await getClientById('client-uuid');

if (error) {
  console.error('Error fetching client:', error);
  // Handle error appropriately
  return;
}

// Proceed with using the client data
console.log('Client data:', client);
```

## Environment Variables

The database operations rely on the following environment variables:

- `VITE_SUPABASE_URL` - The URL of your Supabase instance
- `VITE_SUPABASE_ANON_KEY` - The anonymous API key for your Supabase instance

These should be defined in your `.env` file.

## Testing

The operations can be tested using the test file at:
`/src/tests/db-operations-test.ts`
