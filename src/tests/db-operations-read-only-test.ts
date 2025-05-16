/**
 * Read-Only Tests for Database Operations Using Actual Supabase Database
 * 
 * This test file focuses on testing read operations against the real Supabase database
 * to avoid triggering Row Level Security (RLS) policy violations.
 * 
 * To run this file:
 * npx tsx src/tests/db-operations-read-only-test.ts
 */

// Import environment setup first to ensure credentials are available
import './setup-env';

import {
  // Therapist operations
  getTherapistById,
  getAllTherapists,
  
  // Client operations
  getClientById,
  getClientsByTherapistId,
  
  // Session operations
  getSessionById,
  getSessionsByClientId,
  getSessionsByTherapistId,
  
  // Session Notes operations
  getSessionNoteById,
  getSessionNotesBySessionId,
  
  // Treatment Goals operations
  getTreatmentGoalById,
  getTreatmentGoalsByClientId,
  
  // Progress Metrics operations
  getProgressMetricById,
  getProgressMetricsByClientId,
  getClientMetricsByName
} from '../services/db-operations';

// TESTING CONFIGURATION
const VERBOSE_LOGGING = true; // Set to false for less verbose output

// Type guard for error checking
function isErrorResponse(result: any): boolean {
  return result?.error !== null && result?.error !== undefined;
}

// Logging helper functions
function logSuccess(message: string, data?: any) {
  if (!VERBOSE_LOGGING && !data) return;
  console.log(`✅ ${message}`);
  if (data && VERBOSE_LOGGING) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message: string, error: any) {
  console.error(`❌ ${message}`);
  console.error(error);
}

function logSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function testTherapistOperations() {
  logSection('THERAPIST OPERATIONS');
  
  try {
    // GET ALL THERAPISTS
    const getAllResult = await getAllTherapists();
    
    if (isErrorResponse(getAllResult) || !getAllResult.data || getAllResult.data.length === 0) {
      logError('Failed to get all therapists or no therapists found', getAllResult.error || 'No therapists found');
      return { success: false, therapistId: null };
    }
    
    // Use the first therapist for testing
    const therapist = getAllResult.data[0];
    const therapistId = therapist.id;
    
    logSuccess(`Retrieved all therapists (${getAllResult.data.length} found)`, 
      getAllResult.data.slice(0, 2)); // Only show first two to avoid huge output
    
    // GET THERAPIST BY ID
    const getByIdResult = await getTherapistById(therapistId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get therapist by ID', getByIdResult.error);
      return { success: false, therapistId };
    }
    
    logSuccess('Retrieved therapist by ID', getByIdResult.data);
    
    return { success: true, therapistId };
  } catch (error) {
    logError('Unexpected error in therapist tests', error);
    return { success: false, therapistId: null };
  }
}

async function testClientOperations(therapistId: string) {
  logSection('CLIENT OPERATIONS');
  
  try {
    // GET CLIENTS BY THERAPIST ID
    const getByTherapistResult = await getClientsByTherapistId(therapistId);
    
    if (isErrorResponse(getByTherapistResult) || !getByTherapistResult.data || getByTherapistResult.data.length === 0) {
      logError('Failed to get clients by therapist ID or no clients found', 
        getByTherapistResult.error || 'No clients found for this therapist');
      return { success: false, clientId: null };
    }
    
    // Use the first client for testing
    const client = getByTherapistResult.data[0];
    const clientId = client.id;
    
    logSuccess(`Retrieved clients by therapist ID (${getByTherapistResult.data.length} found)`, 
      getByTherapistResult.data);
    
    // GET CLIENT BY ID
    const getByIdResult = await getClientById(clientId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get client by ID', getByIdResult.error);
      return { success: false, clientId };
    }
    
    logSuccess('Retrieved client by ID', getByIdResult.data);
    
    return { success: true, clientId };
  } catch (error) {
    logError('Unexpected error in client tests', error);
    return { success: false, clientId: null };
  }
}

async function testSessionOperations(clientId: string, therapistId: string) {
  logSection('SESSION OPERATIONS');
  
  try {
    // GET SESSIONS BY CLIENT ID
    const getByClientResult = await getSessionsByClientId(clientId);
    
    if (isErrorResponse(getByClientResult) || !getByClientResult.data || getByClientResult.data.length === 0) {
      logError('Failed to get sessions by client ID or no sessions found', 
        getByClientResult.error || 'No sessions found for this client');
      return { success: false, sessionId: null };
    }
    
    // Use the first session for testing
    const session = getByClientResult.data[0];
    const sessionId = session.id;
    
    logSuccess(`Retrieved sessions by client ID (${getByClientResult.data.length} found)`,
      getByClientResult.data);
    
    // GET SESSION BY ID
    const getByIdResult = await getSessionById(sessionId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get session by ID', getByIdResult.error);
      return { success: false, sessionId };
    }
    
    logSuccess('Retrieved session by ID', getByIdResult.data);
    
    // GET SESSIONS BY THERAPIST ID
    const getByTherapistResult = await getSessionsByTherapistId(therapistId);
    
    if (isErrorResponse(getByTherapistResult)) {
      logError('Failed to get sessions by therapist ID', getByTherapistResult.error);
      return { success: false, sessionId };
    }
    
    logSuccess(`Retrieved sessions by therapist ID (${getByTherapistResult.data!.length} found)`,
      getByTherapistResult.data?.slice(0, 2)); // Only show first two to avoid huge output
    
    return { success: true, sessionId };
  } catch (error) {
    logError('Unexpected error in session tests', error);
    return { success: false, sessionId: null };
  }
}

async function testSessionNotesOperations(sessionId: string) {
  logSection('SESSION NOTES OPERATIONS');
  
  try {
    // GET SESSION NOTES BY SESSION ID
    const getBySessionResult = await getSessionNotesBySessionId(sessionId);
    
    if (isErrorResponse(getBySessionResult) || !getBySessionResult.data || getBySessionResult.data.length === 0) {
      logError('Failed to get session notes by session ID or no notes found', 
        getBySessionResult.error || 'No session notes found for this session');
      return { success: false, noteId: null };
    }
    
    // Use the first note for testing
    const note = getBySessionResult.data[0];
    const noteId = note.id;
    
    logSuccess(`Retrieved session notes by session ID (${getBySessionResult.data.length} found)`,
      getBySessionResult.data);
    
    // GET SESSION NOTE BY ID
    const getByIdResult = await getSessionNoteById(noteId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get session note by ID', getByIdResult.error);
      return { success: false, noteId };
    }
    
    logSuccess('Retrieved session note by ID', getByIdResult.data);
    
    return { success: true, noteId };
  } catch (error) {
    logError('Unexpected error in session notes tests', error);
    return { success: false, noteId: null };
  }
}

async function testTreatmentGoalsOperations(clientId: string) {
  logSection('TREATMENT GOALS OPERATIONS');
  
  try {
    // GET TREATMENT GOALS BY CLIENT ID
    const getByClientResult = await getTreatmentGoalsByClientId(clientId);
    
    if (isErrorResponse(getByClientResult) || !getByClientResult.data || getByClientResult.data.length === 0) {
      logError('Failed to get treatment goals by client ID or no goals found', 
        getByClientResult.error || 'No treatment goals found for this client');
      return { success: false, goalId: null };
    }
    
    // Use the first goal for testing
    const goal = getByClientResult.data[0];
    const goalId = goal.id;
    
    logSuccess(`Retrieved treatment goals by client ID (${getByClientResult.data.length} found)`,
      getByClientResult.data);
    
    // GET TREATMENT GOAL BY ID
    const getByIdResult = await getTreatmentGoalById(goalId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get treatment goal by ID', getByIdResult.error);
      return { success: false, goalId };
    }
    
    logSuccess('Retrieved treatment goal by ID', getByIdResult.data);
    
    return { success: true, goalId };
  } catch (error) {
    logError('Unexpected error in treatment goals tests', error);
    return { success: false, goalId: null };
  }
}

async function testProgressMetricsOperations(clientId: string) {
  logSection('PROGRESS METRICS OPERATIONS');
  
  try {
    // GET PROGRESS METRICS BY CLIENT ID
    const getByClientResult = await getProgressMetricsByClientId(clientId);
    
    if (isErrorResponse(getByClientResult) || !getByClientResult.data || getByClientResult.data.length === 0) {
      logError('Failed to get progress metrics by client ID or no metrics found', 
        getByClientResult.error || 'No progress metrics found for this client');
      return { success: false, metricId: null };
    }
    
    // Use the first metric for testing
    const metric = getByClientResult.data[0];
    const metricId = metric.id;
    const metricName = metric.metric_name;
    
    logSuccess(`Retrieved progress metrics by client ID (${getByClientResult.data.length} found)`,
      getByClientResult.data);
    
    // GET PROGRESS METRIC BY ID
    const getByIdResult = await getProgressMetricById(metricId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get progress metric by ID', getByIdResult.error);
      return { success: false, metricId };
    }
    
    logSuccess('Retrieved progress metric by ID', getByIdResult.data);
    
    // GET CLIENT METRICS BY NAME
    const getByNameResult = await getClientMetricsByName(clientId, metricName);
    
    if (isErrorResponse(getByNameResult)) {
      logError('Failed to get client metrics by name', getByNameResult.error);
      return { success: false, metricId };
    }
    
    logSuccess(`Retrieved client metrics by name (${getByNameResult.data!.length} found)`,
      getByNameResult.data);
    
    return { success: true, metricId };
  } catch (error) {
    logError('Unexpected error in progress metrics tests', error);
    return { success: false, metricId: null };
  }
}

// MAIN TEST RUNNER
async function runReadOnlyTests() {
  console.log('🔍 Starting PsyPlex DB Operations Read-Only Tests');
  console.log('================================================');
  console.log('Testing READ operations only to avoid RLS policy violations');
  console.log('================================================\n');
  
  let allTestsPassed = true;
  
  try {
    // Test therapist operations first
    const { success: therapistSuccess, therapistId } = await testTherapistOperations();
    allTestsPassed = allTestsPassed && therapistSuccess;
    
    if (therapistSuccess && therapistId) {
      // Test client operations next
      const { success: clientSuccess, clientId } = await testClientOperations(therapistId);
      allTestsPassed = allTestsPassed && clientSuccess;
      
      if (clientSuccess && clientId) {
        // Test the remaining operations in parallel
        
        // Test session operations
        const sessionTest = testSessionOperations(clientId, therapistId);
        
        // Test treatment goals operations
        const goalsTest = testTreatmentGoalsOperations(clientId);
        
        // Test progress metrics operations
        const metricsTest = testProgressMetricsOperations(clientId);
        
        // Wait for all tests to complete
        const [
          { success: sessionSuccess, sessionId },
          { success: goalsSuccess },
          { success: metricsSuccess }
        ] = await Promise.all([sessionTest, goalsTest, metricsTest]);
        
        allTestsPassed = allTestsPassed && sessionSuccess && goalsSuccess && metricsSuccess;
        
        // Test session notes if we have a session ID
        if (sessionSuccess && sessionId) {
          const { success: notesSuccess } = await testSessionNotesOperations(sessionId);
          allTestsPassed = allTestsPassed && notesSuccess;
        } else {
          console.log('Skipping session notes tests due to session test failures or no sessions found');
        }
      } else {
        console.log('Skipping dependent tests due to client test failures or no clients found');
      }
    } else {
      console.log('Skipping dependent tests due to therapist test failures or no therapists found');
    }
  } catch (error) {
    console.error('Unexpected error during test execution:', error);
    allTestsPassed = false;
  }
  
  console.log('\n================================================');
  if (allTestsPassed) {
    console.log('✅ ALL READ OPERATIONS TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('❌ SOME TESTS FAILED! Check logs for details.');
  }
  console.log('================================================\n');
}

// Run the tests
runReadOnlyTests()
  .then(() => console.log('Tests complete.'))
  .catch(error => console.error('Unhandled error in test execution:', error));
