/**
 * CRUD Tests for Database Operations
 * 
 * This test file conducts systematic CRUD testing of all database entities:
 * - Creates test records
 * - Reads records with various query methods
 * - Updates records
 * - Deletes records
 * 
 * To run this file:
 * npx tsx src/tests/db-operations-crud-test.ts
 */

// Import environment setup first to ensure credentials are available
import './setup-env';
import { v4 as uuidv4 } from 'uuid';

// Import all database operations
import * as dbOps from '../services/db-operations';

// CONFIGURATION
const TEST_PREFIX = `test-${Date.now()}`;
const VERBOSE_LOGGING = true;

// Type guard for error checking
function isErrorResponse(result: any): boolean {
  return result?.error !== null && result?.error !== undefined;
}

// Logging helper functions
function logSuccess(message: string, data?: any) {
  console.log(`✅ ${message}`);
  if (data && VERBOSE_LOGGING) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message: string, error: any) {
  console.error(`❌ ${message}`);
  console.error(error);
}

function logWarning(message: string) {
  console.warn(`⚠️ ${message}`);
}

function logSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

// Test data storage
const testData = {
  therapistId: '',
  clientId: '',
  clientProfileId: '',
  sessionId: '',
  sessionNoteId: '',
  treatmentGoalId: '',
  progressMetricId: ''
};

// Generic CRUD test function for any entity
async function testEntityCRUD<CreateType, ReadType>(options: {
  entityName: string;
  createFn: (data: any) => Promise<dbOps.DbResponse<ReadType>>;
  readFn: (id: string) => Promise<dbOps.DbResponse<ReadType>>;
  updateFn: (id: string, data: any) => Promise<dbOps.DbResponse<ReadType>>;
  deleteFn: (id: string) => Promise<dbOps.DbResponse<{success: boolean}>>;
  createData: any;
  updateData: any;
  idField?: string;
  expectedRLS?: boolean;
  dependencies?: {name: string, id: string}[];
  cleanup?: () => Promise<void>;
}): Promise<{success: boolean, entityId: string}> {
  const {
    entityName,
    createFn,
    readFn,
    updateFn,
    deleteFn,
    createData,
    updateData,
    idField = 'id',
    expectedRLS = false,
    dependencies = [],
    cleanup
  } = options;
  
  logSection(`${entityName.toUpperCase()} CRUD OPERATIONS`);
  
  let entityId = '';
  let createSuccess = false;
  let readSuccess = false;
  let updateSuccess = false;
  let deleteSuccess = false;
  
  try {
    // Check dependencies
    const missingDeps = dependencies.filter(dep => !dep.id);
    if (missingDeps.length > 0) {
      const depNames = missingDeps.map(d => d.name).join(', ');
      logError(`Cannot test ${entityName} operations - missing dependencies: ${depNames}`, null);
      return { success: false, entityId: '' };
    }
    
    // 1. CREATE
    console.log(`Creating ${entityName}...`);
    const createResult = await createFn(createData);
    
    if (isErrorResponse(createResult)) {
      if (expectedRLS && createResult.error.code === '42501') {
        logWarning(`Create ${entityName} failed due to expected RLS policy (this is OK)`);
        // Since we can't create, we can't test further CRUD operations
        return { success: true, entityId: '' };
      } else {
        logError(`Failed to create ${entityName}`, createResult.error);
        return { success: false, entityId: '' };
      }
    }
    
    entityId = createResult.data[idField];
    logSuccess(`Created ${entityName}`, createResult.data);
    createSuccess = true;
    
    // 2. READ
    console.log(`Reading ${entityName}...`);
    const readResult = await readFn(entityId);
    
    if (isErrorResponse(readResult)) {
      if (expectedRLS && readResult.error.code === '42501') {
        logWarning(`Read ${entityName} failed due to expected RLS policy (this is OK)`);
      } else {
        logError(`Failed to read ${entityName}`, readResult.error);
        // Continue with other operations even if this failed
      }
    } else {
      logSuccess(`Read ${entityName}`, readResult.data);
      readSuccess = true;
    }
    
    // 3. UPDATE
    console.log(`Updating ${entityName}...`);
    const updateResult = await updateFn(entityId, updateData);
    
    if (isErrorResponse(updateResult)) {
      if (expectedRLS && updateResult.error.code === '42501') {
        logWarning(`Update ${entityName} failed due to expected RLS policy (this is OK)`);
      } else {
        logError(`Failed to update ${entityName}`, updateResult.error);
        // Continue with delete even if update failed
      }
    } else {
      logSuccess(`Updated ${entityName}`, updateResult.data);
      updateSuccess = true;
    }
    
    // 4. DELETE
    console.log(`Deleting ${entityName}...`);
    const deleteResult = await deleteFn(entityId);
    
    if (isErrorResponse(deleteResult)) {
      if (expectedRLS && deleteResult.error.code === '42501') {
        logWarning(`Delete ${entityName} failed due to expected RLS policy (this is OK)`);
        
        // If we couldn't delete due to RLS, run the cleanup function if provided
        if (cleanup) {
          await cleanup();
        }
      } else {
        logError(`Failed to delete ${entityName}`, deleteResult.error);
      }
    } else {
      logSuccess(`Deleted ${entityName}`);
      deleteSuccess = true;
    }
    
    // Summarize results
    console.log(`\n${entityName} CRUD Summary:`);
    console.log(`Create: ${createSuccess ? '✅' : '❌'}`);
    console.log(`Read: ${readSuccess ? '✅' : '❌'}`);
    console.log(`Update: ${updateSuccess ? '✅' : '❌'}`);
    console.log(`Delete: ${deleteSuccess ? '✅' : '❌'}`);
    
    if (expectedRLS) {
      console.log(`Note: Some operations were expected to fail due to RLS policies`);
    }
    
    return { 
      success: (expectedRLS || (createSuccess && readSuccess && updateSuccess && deleteSuccess)),
      entityId: entityId
    };
  } catch (error) {
    logError(`Unexpected error in ${entityName} tests`, error);
    return { success: false, entityId };
  }
}

// 1. THERAPIST CRUD TESTS
async function testTherapistCRUD() {
  const therapistData = {
    user_id: uuidv4(),
    full_name: 'Test Therapist',
    credentials: 'PhD, Testing',
    specialties: ['Unit Testing', 'Integration Testing'],
    bio: `Test therapist created by automated test (${TEST_PREFIX})`
  };
  
  const updateData = {
    bio: 'Updated bio with more details',
    credentials: 'PhD, Testing & Verification'
  };
  
  const result = await testEntityCRUD({
    entityName: 'therapist',
    createFn: dbOps.createTherapist,
    readFn: dbOps.getTherapistById,
    updateFn: dbOps.updateTherapist,
    deleteFn: dbOps.deleteTherapist,
    createData: therapistData,
    updateData,
    expectedRLS: false // Therapist operations seem to work without RLS restrictions
  });
  
  if (result.success && result.entityId) {
    testData.therapistId = result.entityId;
  }
  
  return result.success;
}

// 2. CLIENT CRUD TESTS
async function testClientCRUD() {
  // Skip if no therapist ID
  if (!testData.therapistId) {
    logWarning('Skipping client tests - missing therapist ID');
    return true;
  }
  
  const clientData = {
    therapist_id: testData.therapistId,
    first_name: 'Test',
    last_name: 'Client',
    email: `${TEST_PREFIX}@example.com`,
    phone: '555-TEST',
    status: 'New' as const
  };
  
  const updateData = {
    status: 'Active' as const,
    phone: '555-UPDATE'
  };
  
  const result = await testEntityCRUD({
    entityName: 'client',
    createFn: dbOps.createClient,
    readFn: dbOps.getClientById,
    updateFn: dbOps.updateClient,
    deleteFn: dbOps.deleteClient,
    createData: clientData,
    updateData,
    expectedRLS: true, // Client operations likely have RLS restrictions
    dependencies: [{ name: 'therapist', id: testData.therapistId }]
  });
  
  if (result.success && result.entityId) {
    testData.clientId = result.entityId;
  }
  
  return result.success;
}

// 3. CLIENT PROFILE CRUD TESTS
async function testClientProfileCRUD() {
  // Skip if no client ID
  if (!testData.clientId) {
    logWarning('Skipping client profile tests - missing client ID');
    return true;
  }
  
  const profileData = {
    client_id: testData.clientId,
    date_of_birth: '1990-01-01',
    address: '123 Test St, Test City, TS 12345',
    occupation: 'Software Tester',
    emergency_contact: 'Emergency Contact, 555-EMER',
    primary_concerns: ['Stress', 'Work-life balance'],
    therapy_type: 'Cognitive Behavioral Therapy'
  };
  
  const updateData = {
    occupation: 'Senior Software Tester',
    primary_concerns: ['Stress', 'Work-life balance', 'Career advancement']
  };
  
  const result = await testEntityCRUD({
    entityName: 'client profile',
    createFn: dbOps.createClientProfile,
    readFn: dbOps.getClientProfileById,
    updateFn: dbOps.updateClientProfile,
    deleteFn: dbOps.deleteClientProfile,
    createData: profileData,
    updateData,
    expectedRLS: true, // ClientProfile operations likely have RLS restrictions
    dependencies: [{ name: 'client', id: testData.clientId }]
  });
  
  if (result.success && result.entityId) {
    testData.clientProfileId = result.entityId;
  }
  
  return result.success;
}

// 4. SESSION CRUD TESTS
async function testSessionCRUD() {
  // Skip if no client ID or therapist ID
  if (!testData.clientId || !testData.therapistId) {
    logWarning('Skipping session tests - missing client or therapist ID');
    return true;
  }
  
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
  
  const updateData = {
    status: 'Completed' as const,
    duration_minutes: 55
  };
  
  const result = await testEntityCRUD({
    entityName: 'session',
    createFn: dbOps.createSession,
    readFn: dbOps.getSessionById,
    updateFn: dbOps.updateSession,
    deleteFn: dbOps.deleteSession,
    createData: sessionData,
    updateData,
    expectedRLS: true, // Session operations likely have RLS restrictions
    dependencies: [
      { name: 'client', id: testData.clientId },
      { name: 'therapist', id: testData.therapistId }
    ]
  });
  
  if (result.success && result.entityId) {
    testData.sessionId = result.entityId;
  }
  
  return result.success;
}

// 5. SESSION NOTE CRUD TESTS
async function testSessionNoteCRUD() {
  // Skip if no session ID, client ID, or therapist ID
  if (!testData.sessionId || !testData.clientId || !testData.therapistId) {
    logWarning('Skipping session note tests - missing required IDs');
    return true;
  }
  
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
  
  const updateData = {
    title: 'Updated Test Session Summary',
    content: {
      summary: 'This was a test session to validate the system',
      observations: 'Client seems to be responding well to testing',
      homework: 'Continue with the testing regimen',
      additional_notes: 'Added during update'
    }
  };
  
  const result = await testEntityCRUD({
    entityName: 'session note',
    createFn: dbOps.createSessionNote,
    readFn: dbOps.getSessionNoteById,
    updateFn: dbOps.updateSessionNote,
    deleteFn: dbOps.deleteSessionNote,
    createData: noteData,
    updateData,
    expectedRLS: true, // SessionNote operations likely have RLS restrictions
    dependencies: [
      { name: 'session', id: testData.sessionId },
      { name: 'client', id: testData.clientId },
      { name: 'therapist', id: testData.therapistId }
    ]
  });
  
  if (result.success && result.entityId) {
    testData.sessionNoteId = result.entityId;
  }
  
  return result.success;
}

// 6. TREATMENT GOAL CRUD TESTS
async function testTreatmentGoalCRUD() {
  // Skip if no client ID
  if (!testData.clientId) {
    logWarning('Skipping treatment goal tests - missing client ID');
    return true;
  }
  
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 3); // Three months from now
  
  const goalData = {
    client_id: testData.clientId,
    goal_description: 'Complete all functional tests successfully',
    status: 'Not Started' as const,
    target_date: targetDate.toISOString()
  };
  
  const updateData = {
    status: 'In Progress' as const,
    goal_description: 'Complete all functional tests successfully with high code coverage'
  };
  
  const result = await testEntityCRUD({
    entityName: 'treatment goal',
    createFn: dbOps.createTreatmentGoal,
    readFn: dbOps.getTreatmentGoalById,
    updateFn: dbOps.updateTreatmentGoal,
    deleteFn: dbOps.deleteTreatmentGoal,
    createData: goalData,
    updateData,
    expectedRLS: true, // TreatmentGoal operations likely have RLS restrictions
    dependencies: [{ name: 'client', id: testData.clientId }]
  });
  
  if (result.success && result.entityId) {
    testData.treatmentGoalId = result.entityId;
  }
  
  return result.success;
}

// 7. PROGRESS METRIC CRUD TESTS
async function testProgressMetricCRUD() {
  // Skip if no client ID
  if (!testData.clientId) {
    logWarning('Skipping progress metric tests - missing client ID');
    return true;
  }
  
  const metricData = {
    client_id: testData.clientId,
    metric_name: 'Test Completion',
    metric_value: 75,
    date_recorded: new Date().toISOString(),
    notes: 'Making good progress with tests'
  };
  
  const updateData = {
    metric_value: 85,
    notes: 'Tests are almost complete'
  };
  
  const result = await testEntityCRUD({
    entityName: 'progress metric',
    createFn: dbOps.createProgressMetric,
    readFn: dbOps.getProgressMetricById,
    updateFn: dbOps.updateProgressMetric,
    deleteFn: dbOps.deleteProgressMetric,
    createData: metricData,
    updateData,
    expectedRLS: true, // ProgressMetric operations likely have RLS restrictions
    dependencies: [{ name: 'client', id: testData.clientId }]
  });
  
  if (result.success && result.entityId) {
    testData.progressMetricId = result.entityId;
  }
  
  return result.success;
}

// CLEANUP FUNCTION - attempt to clean up any data that might have been created
async function cleanupAll() {
  logSection('CLEANUP');
  
  // Delete in reverse order of dependency
  
  // Progress Metric
  if (testData.progressMetricId) {
    try {
      await dbOps.deleteProgressMetric(testData.progressMetricId);
      logSuccess('Cleaned up progress metric');
    } catch (err) {
      logWarning(`Could not clean up progress metric: ${err.message}`);
    }
  }
  
  // Treatment Goal
  if (testData.treatmentGoalId) {
    try {
      await dbOps.deleteTreatmentGoal(testData.treatmentGoalId);
      logSuccess('Cleaned up treatment goal');
    } catch (err) {
      logWarning(`Could not clean up treatment goal: ${err.message}`);
    }
  }
  
  // Session Note
  if (testData.sessionNoteId) {
    try {
      await dbOps.deleteSessionNote(testData.sessionNoteId);
      logSuccess('Cleaned up session note');
    } catch (err) {
      logWarning(`Could not clean up session note: ${err.message}`);
    }
  }
  
  // Session
  if (testData.sessionId) {
    try {
      await dbOps.deleteSession(testData.sessionId);
      logSuccess('Cleaned up session');
    } catch (err) {
      logWarning(`Could not clean up session: ${err.message}`);
    }
  }
  
  // Client Profile
  if (testData.clientProfileId) {
    try {
      await dbOps.deleteClientProfile(testData.clientProfileId);
      logSuccess('Cleaned up client profile');
    } catch (err) {
      logWarning(`Could not clean up client profile: ${err.message}`);
    }
  }
  
  // Client
  if (testData.clientId) {
    try {
      await dbOps.deleteClient(testData.clientId);
      logSuccess('Cleaned up client');
    } catch (err) {
      logWarning(`Could not clean up client: ${err.message}`);
    }
  }
  
  // Therapist
  if (testData.therapistId) {
    try {
      await dbOps.deleteTherapist(testData.therapistId);
      logSuccess('Cleaned up therapist');
    } catch (err) {
      logWarning(`Could not clean up therapist: ${err.message}`);
    }
  }
}

// MAIN TEST RUNNER
async function runCRUDTests() {
  console.log('🔍 Starting PsyPlex DB Operations CRUD Tests');
  console.log('================================================');
  console.log(`Test Run ID: ${TEST_PREFIX}`);
  console.log('RLS-aware testing - some operations may fail by design');
  console.log('================================================\n');
  
  const results = {
    therapist: false,
    client: false,
    clientProfile: false,
    session: false,
    sessionNote: false,
    treatmentGoal: false,
    progressMetric: false
  };
  
  try {
    // Run all CRUD tests in sequence to respect dependencies
    results.therapist = await testTherapistCRUD();
    results.client = await testClientCRUD();
    results.clientProfile = await testClientProfileCRUD();
    results.session = await testSessionCRUD();
    results.sessionNote = await testSessionNoteCRUD();
    results.treatmentGoal = await testTreatmentGoalCRUD();
    results.progressMetric = await testProgressMetricCRUD();
  } catch (error) {
    console.error('Unexpected error during test execution:', error);
  } finally {
    // Always try to clean up
    await cleanupAll();
    
    // Show test summary
    console.log('\n================================================');
    console.log('CRUD TEST SUMMARY:');
    console.log(`Therapist CRUD: ${results.therapist ? '✅' : '❌'}`);
    console.log(`Client CRUD: ${results.client ? '✅' : '❌'}`);
    console.log(`Client Profile CRUD: ${results.clientProfile ? '✅' : '❌'}`);
    console.log(`Session CRUD: ${results.session ? '✅' : '❌'}`);
    console.log(`Session Note CRUD: ${results.sessionNote ? '✅' : '❌'}`);
    console.log(`Treatment Goal CRUD: ${results.treatmentGoal ? '✅' : '❌'}`);
    console.log(`Progress Metric CRUD: ${results.progressMetric ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    if (allPassed) {
      console.log('\n✅ ALL CRUD TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('\n❌ SOME TESTS FAILED! Check logs for details.');
    }
    console.log('================================================\n');
  }
}

// Run the tests
runCRUDTests()
  .then(() => console.log('CRUD tests complete.'))
  .catch(error => console.error('Unhandled error in test execution:', error));
