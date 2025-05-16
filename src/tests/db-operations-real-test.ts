/**
 * Functional Tests for Database Operations Using Actual Supabase Database
 * 
 * This test file conducts end-to-end testing against the real Supabase database,
 * creating test data, performing CRUD operations, and cleaning up afterward.
 * 
 * To run this file:
 * npx tsx src/tests/db-operations-real-test.ts
 */

// Import environment setup first to ensure credentials are available
import './setup-env';
import { v4 as uuidv4 } from 'uuid';

import {
  // Therapist operations
  createTherapist,
  getTherapistById,
  getTherapistByUserId,
  updateTherapist,
  deleteTherapist,
  getAllTherapists,
  
  // Client operations
  createClient,
  getClientById,
  getClientsByTherapistId,
  updateClient,
  deleteClient,
  
  // Client Profile operations
  createClientProfile,
  getClientProfileByClientId,
  updateClientProfile,
  deleteClientProfile,
  
  // Session operations
  createSession,
  getSessionById,
  getSessionsByClientId,
  getSessionsByTherapistId,
  updateSession,
  deleteSession,
  
  // Session Notes operations
  createSessionNote,
  getSessionNoteById,
  getSessionNotesBySessionId,
  updateSessionNote,
  deleteSessionNote,
  
  // Treatment Goals operations
  createTreatmentGoal,
  getTreatmentGoalById,
  getTreatmentGoalsByClientId,
  updateTreatmentGoal,
  deleteTreatmentGoal,
  
  // Progress Metrics operations
  createProgressMetric,
  getProgressMetricById,
  getProgressMetricsByClientId,
  getClientMetricsByName,
  updateProgressMetric,
  deleteProgressMetric
} from '../services/db-operations';

// TESTING CONFIGURATION
const TEST_PREFIX = `test-${Date.now()}`; // Ensures unique test data
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

// Test data storage for cleanup
const testData = {
  therapistId: '',
  clientId: '',
  clientProfileId: '',
  sessionId: '',
  sessionNoteId: '',
  goalId: '',
  metricId: ''
};

// THERAPIST TESTS
async function testTherapistOperations() {
  logSection('THERAPIST OPERATIONS');
  
  try {
    // CREATE THERAPIST
    const therapistData = {
      user_id: uuidv4(), // Generate a proper UUID
      full_name: 'Test Therapist',
      credentials: 'PhD, Testing',
      specialties: ['Unit Testing', 'Integration Testing'],
      bio: `Test therapist created by automated test (${TEST_PREFIX})`
    };
    
    const createResult = await createTherapist(therapistData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create therapist', createResult.error);
      return false;
    }
    
    testData.therapistId = createResult.data!.id;
    logSuccess('Created therapist', createResult.data);
    
    // GET THERAPIST BY ID
    const getByIdResult = await getTherapistById(testData.therapistId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get therapist by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved therapist by ID', getByIdResult.data);
    
    // GET THERAPIST BY USER ID
    const getByUserIdResult = await getTherapistByUserId(therapistData.user_id);
    
    if (isErrorResponse(getByUserIdResult)) {
      logError('Failed to get therapist by user ID', getByUserIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved therapist by user ID', getByUserIdResult.data);
    
    // UPDATE THERAPIST
    const updateData = {
      bio: 'Updated bio with more details',
      credentials: 'PhD, Testing & Verification'
    };
    
    const updateResult = await updateTherapist(testData.therapistId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update therapist', updateResult.error);
      return false;
    }
    
    logSuccess('Updated therapist', updateResult.data);
    
    // GET ALL THERAPISTS
    const getAllResult = await getAllTherapists();
    
    if (isErrorResponse(getAllResult)) {
      logError('Failed to get all therapists', getAllResult.error);
      return false;
    }
    
    logSuccess(`Retrieved all therapists (${getAllResult.data!.length} found)`, 
      getAllResult.data!.slice(0, 2)); // Only show first two to avoid huge output
    
    return true;
  } catch (error) {
    logError('Unexpected error in therapist tests', error);
    return false;
  }
}

// CLIENT TESTS
async function testClientOperations() {
  logSection('CLIENT OPERATIONS');
  
  try {
    // Ensure we have a therapist ID
    if (!testData.therapistId) {
      logError('Cannot test client operations without a therapist ID', null);
      return false;
    }
    
    // CREATE CLIENT
    const clientData = {
      therapist_id: testData.therapistId,
      first_name: 'Test',
      last_name: 'Client',
      email: `${TEST_PREFIX}@example.com`,
      phone: '555-TEST',
      status: 'New' as const
    };
    
    const createResult = await createClient(clientData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create client', createResult.error);
      return false;
    }
    
    testData.clientId = createResult.data!.id;
    logSuccess('Created client', createResult.data);
    
    // GET CLIENT BY ID
    const getByIdResult = await getClientById(testData.clientId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get client by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved client by ID', getByIdResult.data);
    
    // GET CLIENTS BY THERAPIST ID
    const getByTherapistResult = await getClientsByTherapistId(testData.therapistId);
    
    if (isErrorResponse(getByTherapistResult)) {
      logError('Failed to get clients by therapist ID', getByTherapistResult.error);
      return false;
    }
    
    logSuccess(`Retrieved clients by therapist ID (${getByTherapistResult.data!.length} found)`, 
      getByTherapistResult.data);
    
    // UPDATE CLIENT
    const updateData = {
      status: 'Active' as const,
      phone: '555-UPDATE'
    };
    
    const updateResult = await updateClient(testData.clientId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update client', updateResult.error);
      return false;
    }
    
    logSuccess('Updated client', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in client tests', error);
    return false;
  }
}

// CLIENT PROFILE TESTS
async function testClientProfileOperations() {
  logSection('CLIENT PROFILE OPERATIONS');
  
  try {
    // Ensure we have a client ID
    if (!testData.clientId) {
      logError('Cannot test client profile operations without a client ID', null);
      return false;
    }
    
    // CREATE CLIENT PROFILE
    const profileData = {
      client_id: testData.clientId,
      date_of_birth: '1990-01-01',
      address: '123 Test St, Test City, TS 12345',
      occupation: 'Software Tester',
      emergency_contact: 'Emergency Contact, 555-EMER',
      primary_concerns: ['Stress', 'Work-life balance'],
      therapy_type: 'Cognitive Behavioral Therapy'
    };
    
    const createResult = await createClientProfile(profileData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create client profile', createResult.error);
      return false;
    }
    
    testData.clientProfileId = createResult.data!.id;
    logSuccess('Created client profile', createResult.data);
    
    // GET CLIENT PROFILE BY CLIENT ID
    const getByClientIdResult = await getClientProfileByClientId(testData.clientId);
    
    if (isErrorResponse(getByClientIdResult)) {
      logError('Failed to get client profile by client ID', getByClientIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved client profile by client ID', getByClientIdResult.data);
    
    // UPDATE CLIENT PROFILE
    const updateData = {
      occupation: 'Senior Software Tester',
      primary_concerns: ['Stress', 'Work-life balance', 'Career advancement']
    };
    
    const updateResult = await updateClientProfile(testData.clientProfileId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update client profile', updateResult.error);
      return false;
    }
    
    logSuccess('Updated client profile', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in client profile tests', error);
    return false;
  }
}

// SESSION TESTS
async function testSessionOperations() {
  logSection('SESSION OPERATIONS');
  
  try {
    // Ensure we have client and therapist IDs
    if (!testData.clientId || !testData.therapistId) {
      logError('Cannot test session operations without client and therapist IDs', null);
      return false;
    }
    
    // CREATE SESSION
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 7); // One week from now
    
    const sessionData = {
      client_id: testData.clientId,
      therapist_id: testData.therapistId,
      session_date: sessionDate.toISOString(),
      duration_minutes: 50,
      session_type: 'Virtual' as const,
      status: 'Scheduled' as const
    };
    
    const createResult = await createSession(sessionData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create session', createResult.error);
      return false;
    }
    
    testData.sessionId = createResult.data!.id;
    logSuccess('Created session', createResult.data);
    
    // GET SESSION BY ID
    const getByIdResult = await getSessionById(testData.sessionId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get session by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved session by ID', getByIdResult.data);
    
    // GET SESSIONS BY CLIENT ID
    const getByClientResult = await getSessionsByClientId(testData.clientId);
    
    if (isErrorResponse(getByClientResult)) {
      logError('Failed to get sessions by client ID', getByClientResult.error);
      return false;
    }
    
    logSuccess(`Retrieved sessions by client ID (${getByClientResult.data!.length} found)`,
      getByClientResult.data);
    
    // GET SESSIONS BY THERAPIST ID
    const getByTherapistResult = await getSessionsByTherapistId(testData.therapistId);
    
    if (isErrorResponse(getByTherapistResult)) {
      logError('Failed to get sessions by therapist ID', getByTherapistResult.error);
      return false;
    }
    
    logSuccess(`Retrieved sessions by therapist ID (${getByTherapistResult.data!.length} found)`,
      getByTherapistResult.data);
    
    // UPDATE SESSION
    const updateData = {
      status: 'Completed' as const,
      duration_minutes: 55
    };
    
    const updateResult = await updateSession(testData.sessionId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update session', updateResult.error);
      return false;
    }
    
    logSuccess('Updated session', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in session tests', error);
    return false;
  }
}

// SESSION NOTES TESTS
async function testSessionNotesOperations() {
  logSection('SESSION NOTES OPERATIONS');
  
  try {
    // Ensure we have session, client, and therapist IDs
    if (!testData.sessionId || !testData.clientId || !testData.therapistId) {
      logError('Cannot test session notes operations without required IDs', null);
      return false;
    }
    
    // CREATE SESSION NOTE
    const noteData = {
      session_id: testData.sessionId,
      therapist_id: testData.therapistId,
      client_id: testData.clientId,
      title: 'Test Session Summary',
      content: {
        summary: 'This was a test session to validate the system',
        observations: 'Client seems to be responding well to testing',
        homework: 'Continue with the testing regimen'
      },
      therapy_type: 'CBT',
      tags: ['test', 'functional-testing']
    };
    
    const createResult = await createSessionNote(noteData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create session note', createResult.error);
      return false;
    }
    
    testData.sessionNoteId = createResult.data!.id;
    logSuccess('Created session note', createResult.data);
    
    // GET SESSION NOTE BY ID
    const getByIdResult = await getSessionNoteById(testData.sessionNoteId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get session note by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved session note by ID', getByIdResult.data);
    
    // GET SESSION NOTES BY SESSION ID
    const getBySessionResult = await getSessionNotesBySessionId(testData.sessionId);
    
    if (isErrorResponse(getBySessionResult)) {
      logError('Failed to get session notes by session ID', getBySessionResult.error);
      return false;
    }
    
    logSuccess(`Retrieved session notes by session ID (${getBySessionResult.data!.length} found)`,
      getBySessionResult.data);
    
    // UPDATE SESSION NOTE
    const updateData = {
      title: 'Updated Test Session Summary',
      content: {
        summary: 'This was a test session to validate the system',
        observations: 'Client seems to be responding well to testing',
        homework: 'Continue with the testing regimen',
        additional_notes: 'Added during update'
      }
    };
    
    const updateResult = await updateSessionNote(testData.sessionNoteId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update session note', updateResult.error);
      return false;
    }
    
    logSuccess('Updated session note', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in session notes tests', error);
    return false;
  }
}

// TREATMENT GOALS TESTS
async function testTreatmentGoalsOperations() {
  logSection('TREATMENT GOALS OPERATIONS');
  
  try {
    // Ensure we have a client ID
    if (!testData.clientId) {
      logError('Cannot test treatment goals operations without a client ID', null);
      return false;
    }
    
    // CREATE TREATMENT GOAL
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3); // Three months from now
    
    const goalData = {
      client_id: testData.clientId,
      goal_description: 'Complete all functional tests successfully',
      status: 'Not Started' as const,
      target_date: targetDate.toISOString()
    };
    
    const createResult = await createTreatmentGoal(goalData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create treatment goal', createResult.error);
      return false;
    }
    
    testData.goalId = createResult.data!.id;
    logSuccess('Created treatment goal', createResult.data);
    
    // GET TREATMENT GOAL BY ID
    const getByIdResult = await getTreatmentGoalById(testData.goalId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get treatment goal by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved treatment goal by ID', getByIdResult.data);
    
    // GET TREATMENT GOALS BY CLIENT ID
    const getByClientResult = await getTreatmentGoalsByClientId(testData.clientId);
    
    if (isErrorResponse(getByClientResult)) {
      logError('Failed to get treatment goals by client ID', getByClientResult.error);
      return false;
    }
    
    logSuccess(`Retrieved treatment goals by client ID (${getByClientResult.data!.length} found)`,
      getByClientResult.data);
    
    // UPDATE TREATMENT GOAL
    const updateData = {
      status: 'In Progress' as const,
      goal_description: 'Complete all functional tests successfully with high code coverage'
    };
    
    const updateResult = await updateTreatmentGoal(testData.goalId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update treatment goal', updateResult.error);
      return false;
    }
    
    logSuccess('Updated treatment goal', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in treatment goals tests', error);
    return false;
  }
}

// PROGRESS METRICS TESTS
async function testProgressMetricsOperations() {
  logSection('PROGRESS METRICS OPERATIONS');
  
  try {
    // Ensure we have a client ID
    if (!testData.clientId) {
      logError('Cannot test progress metrics operations without a client ID', null);
      return false;
    }
    
    // CREATE PROGRESS METRIC
    const metricData = {
      client_id: testData.clientId,
      metric_name: 'Test Completion',
      metric_value: 75,
      date_recorded: new Date().toISOString(),
      notes: 'Making good progress with tests'
    };
    
    const createResult = await createProgressMetric(metricData);
    
    if (isErrorResponse(createResult)) {
      logError('Failed to create progress metric', createResult.error);
      return false;
    }
    
    testData.metricId = createResult.data!.id;
    logSuccess('Created progress metric', createResult.data);
    
    // GET PROGRESS METRIC BY ID
    const getByIdResult = await getProgressMetricById(testData.metricId);
    
    if (isErrorResponse(getByIdResult)) {
      logError('Failed to get progress metric by ID', getByIdResult.error);
      return false;
    }
    
    logSuccess('Retrieved progress metric by ID', getByIdResult.data);
    
    // GET PROGRESS METRICS BY CLIENT ID
    const getByClientResult = await getProgressMetricsByClientId(testData.clientId);
    
    if (isErrorResponse(getByClientResult)) {
      logError('Failed to get progress metrics by client ID', getByClientResult.error);
      return false;
    }
    
    logSuccess(`Retrieved progress metrics by client ID (${getByClientResult.data!.length} found)`,
      getByClientResult.data);
    
    // GET CLIENT METRICS BY NAME
    const getByNameResult = await getClientMetricsByName(testData.clientId, 'Test Completion');
    
    if (isErrorResponse(getByNameResult)) {
      logError('Failed to get client metrics by name', getByNameResult.error);
      return false;
    }
    
    logSuccess(`Retrieved client metrics by name (${getByNameResult.data!.length} found)`,
      getByNameResult.data);
    
    // UPDATE PROGRESS METRIC
    const updateData = {
      metric_value: 85,
      notes: 'Tests are almost complete'
    };
    
    const updateResult = await updateProgressMetric(testData.metricId, updateData);
    
    if (isErrorResponse(updateResult)) {
      logError('Failed to update progress metric', updateResult.error);
      return false;
    }
    
    logSuccess('Updated progress metric', updateResult.data);
    
    return true;
  } catch (error) {
    logError('Unexpected error in progress metrics tests', error);
    return false;
  }
}

// CLEANUP TEST DATA
async function cleanupTestData() {
  logSection('CLEANUP');
  
  try {
    let success = true;
    
    // Delete in reverse order of dependency
    
    // Progress Metric
    if (testData.metricId) {
      const metricResult = await deleteProgressMetric(testData.metricId);
      if (isErrorResponse(metricResult)) {
        logError('Failed to delete progress metric', metricResult.error);
        success = false;
      } else {
        logSuccess('Deleted progress metric');
      }
    }
    
    // Treatment Goal
    if (testData.goalId) {
      const goalResult = await deleteTreatmentGoal(testData.goalId);
      if (isErrorResponse(goalResult)) {
        logError('Failed to delete treatment goal', goalResult.error);
        success = false;
      } else {
        logSuccess('Deleted treatment goal');
      }
    }
    
    // Session Note
    if (testData.sessionNoteId) {
      const noteResult = await deleteSessionNote(testData.sessionNoteId);
      if (isErrorResponse(noteResult)) {
        logError('Failed to delete session note', noteResult.error);
        success = false;
      } else {
        logSuccess('Deleted session note');
      }
    }
    
    // Session
    if (testData.sessionId) {
      const sessionResult = await deleteSession(testData.sessionId);
      if (isErrorResponse(sessionResult)) {
        logError('Failed to delete session', sessionResult.error);
        success = false;
      } else {
        logSuccess('Deleted session');
      }
    }
    
    // Client Profile
    if (testData.clientProfileId) {
      const profileResult = await deleteClientProfile(testData.clientProfileId);
      if (isErrorResponse(profileResult)) {
        logError('Failed to delete client profile', profileResult.error);
        success = false;
      } else {
        logSuccess('Deleted client profile');
      }
    }
    
    // Client
    if (testData.clientId) {
      const clientResult = await deleteClient(testData.clientId);
      if (isErrorResponse(clientResult)) {
        logError('Failed to delete client', clientResult.error);
        success = false;
      } else {
        logSuccess('Deleted client');
      }
    }
    
    // Therapist
    if (testData.therapistId) {
      const therapistResult = await deleteTherapist(testData.therapistId);
      if (isErrorResponse(therapistResult)) {
        logError('Failed to delete therapist', therapistResult.error);
        success = false;
      } else {
        logSuccess('Deleted therapist');
      }
    }
    
    return success;
  } catch (error) {
    logError('Unexpected error in cleanup', error);
    return false;
  }
}

// MAIN TEST RUNNER
async function runFunctionalTests() {
  console.log('🔍 Starting PsyPlex DB Operations Real Database Tests');
  console.log('================================================');
  console.log(`Test Run ID: ${TEST_PREFIX}`);
  console.log('================================================\n');
  
  let allTestsPassed = true;
  
  try {
    // Run all tests in sequence, with dependencies
    const therapistTestsPassed = await testTherapistOperations();
    allTestsPassed = allTestsPassed && therapistTestsPassed;
    
    if (therapistTestsPassed) {
      const clientTestsPassed = await testClientOperations();
      allTestsPassed = allTestsPassed && clientTestsPassed;
      
      if (clientTestsPassed) {
        // Run these tests in sequence to avoid potential race conditions
        const profileTestsPassed = await testClientProfileOperations();
        allTestsPassed = allTestsPassed && profileTestsPassed;
        
        const sessionTestsPassed = await testSessionOperations();
        allTestsPassed = allTestsPassed && sessionTestsPassed;
        
        const goalTestsPassed = await testTreatmentGoalsOperations();
        allTestsPassed = allTestsPassed && goalTestsPassed;
        
        const metricTestsPassed = await testProgressMetricsOperations();
        allTestsPassed = allTestsPassed && metricTestsPassed;
        
        // Session Notes depends on Session
        if (sessionTestsPassed) {
          const notesTestsPassed = await testSessionNotesOperations();
          allTestsPassed = allTestsPassed && notesTestsPassed;
        } else {
          console.log('Skipping session notes tests due to session test failures');
        }
      } else {
        console.log('Skipping dependent tests due to client test failures');
      }
    } else {
      console.log('Skipping dependent tests due to therapist test failures');
    }
  } catch (error) {
    console.error('Unexpected error during test execution:', error);
    allTestsPassed = false;
  } finally {
    // Always try to clean up, even if tests failed
    console.log('\n');
    const cleanupSuccess = await cleanupTestData();
    
    console.log('\n================================================');
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ SOME TESTS FAILED! Check logs for details.');
    }
    
    if (!cleanupSuccess) {
      console.log('⚠️ CLEANUP INCOMPLETE! Some test data may remain in the database.');
    }
    console.log('================================================\n');
  }
}

// Run the tests
runFunctionalTests()
  .then(() => console.log('Tests complete.'))
  .catch(error => console.error('Unhandled error in test execution:', error));
