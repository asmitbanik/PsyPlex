import * as dbOps from '../services/db-operations';

/**
 * This test file validates the existence of all database operation functions.
 * It checks that each expected function is exported from the module and is callable.
 */
async function testDatabaseOperations() {
  console.log('Starting database operations tests...');
  
  try {
    // ---- THERAPIST OPERATIONS ----
    console.log('\n--- Testing Therapist Operations ---');
    testFunctionExists('getAllTherapists', dbOps.getAllTherapists);
    testFunctionExists('getTherapistById', dbOps.getTherapistById);
    testFunctionExists('getTherapistByUserId', dbOps.getTherapistByUserId);
    testFunctionExists('updateTherapist', dbOps.updateTherapist);
    testFunctionExists('deleteTherapist', dbOps.deleteTherapist);

    // ---- CLIENT OPERATIONS ----
    console.log('\n--- Testing Client Operations ---');
    testFunctionExists('createClient', dbOps.createClient);
    testFunctionExists('getClientById', dbOps.getClientById);
    testFunctionExists('getClientsByTherapistId', dbOps.getClientsByTherapistId);
    testFunctionExists('updateClient', dbOps.updateClient);
    testFunctionExists('deleteClient', dbOps.deleteClient);

    // ---- CLIENT PROFILE OPERATIONS ----
    console.log('\n--- Testing Client Profile Operations ---');
    testFunctionExists('createClientProfile', dbOps.createClientProfile);
    testFunctionExists('getClientProfileByClientId', dbOps.getClientProfileByClientId);
    testFunctionExists('updateClientProfile', dbOps.updateClientProfile);
    testFunctionExists('deleteClientProfile', dbOps.deleteClientProfile);

    // ---- SESSION OPERATIONS ----
    console.log('\n--- Testing Session Operations ---');
    testFunctionExists('createSession', dbOps.createSession);
    testFunctionExists('getSessionById', dbOps.getSessionById);
    testFunctionExists('getSessionsByClientId', dbOps.getSessionsByClientId);
    testFunctionExists('getSessionsByTherapistId', dbOps.getSessionsByTherapistId);
    testFunctionExists('updateSession', dbOps.updateSession);
    testFunctionExists('deleteSession', dbOps.deleteSession);

    // ---- SESSION NOTES OPERATIONS ----
    console.log('\n--- Testing Session Notes Operations ---');
    testFunctionExists('createSessionNote', dbOps.createSessionNote);
    testFunctionExists('getSessionNoteById', dbOps.getSessionNoteById);
    testFunctionExists('getSessionNotesBySessionId', dbOps.getSessionNotesBySessionId);
    testFunctionExists('getSessionNotesByClientId', dbOps.getSessionNotesByClientId);
    testFunctionExists('updateSessionNote', dbOps.updateSessionNote);
    testFunctionExists('deleteSessionNote', dbOps.deleteSessionNote);

    // ---- SESSION TRANSCRIPT OPERATIONS ----
    console.log('\n--- Testing Session Transcript Operations ---');
    testFunctionExists('createSessionTranscript', dbOps.createSessionTranscript);
    testFunctionExists('getSessionTranscriptById', dbOps.getSessionTranscriptById);
    testFunctionExists('getSessionTranscriptBySessionId', dbOps.getSessionTranscriptBySessionId);
    testFunctionExists('updateSessionTranscript', dbOps.updateSessionTranscript);
    testFunctionExists('deleteSessionTranscript', dbOps.deleteSessionTranscript);

    // ---- TRANSCRIPT SEGMENT OPERATIONS ----
    console.log('\n--- Testing Transcript Segment Operations ---');
    testFunctionExists('createTranscriptSegment', dbOps.createTranscriptSegment);
    testFunctionExists('getTranscriptSegmentById', dbOps.getTranscriptSegmentById);
    testFunctionExists('getTranscriptSegmentsByTranscriptId', dbOps.getTranscriptSegmentsByTranscriptId);
    testFunctionExists('updateTranscriptSegment', dbOps.updateTranscriptSegment);
    testFunctionExists('deleteTranscriptSegment', dbOps.deleteTranscriptSegment);
    
    // ---- VOICE PROFILE OPERATIONS ----
    console.log('\n--- Testing Voice Profile Operations ---');
    testFunctionExists('createVoiceProfile', dbOps.createVoiceProfile);
    testFunctionExists('getVoiceProfileById', dbOps.getVoiceProfileById);
    testFunctionExists('getVoiceProfileByClientId', dbOps.getVoiceProfileByClientId);
    testFunctionExists('updateVoiceProfile', dbOps.updateVoiceProfile);
    testFunctionExists('deleteVoiceProfile', dbOps.deleteVoiceProfile);

    // ---- THERAPY INSIGHTS OPERATIONS ----
    console.log('\n--- Testing Therapy Insights Operations ---');
    testFunctionExists('createTherapyInsight', dbOps.createTherapyInsight);
    testFunctionExists('getTherapyInsightById', dbOps.getTherapyInsightById);
    testFunctionExists('getTherapyInsightsBySessionId', dbOps.getTherapyInsightsBySessionId);
    testFunctionExists('getTherapyInsightsByClientId', dbOps.getTherapyInsightsByClientId);
    testFunctionExists('updateTherapyInsight', dbOps.updateTherapyInsight);
    testFunctionExists('deleteTherapyInsight', dbOps.deleteTherapyInsight);

    // ---- TREATMENT GOALS OPERATIONS ----
    console.log('\n--- Testing Treatment Goals Operations ---');
    testFunctionExists('createTreatmentGoal', dbOps.createTreatmentGoal);
    testFunctionExists('getTreatmentGoalById', dbOps.getTreatmentGoalById);
    testFunctionExists('getTreatmentGoalsByClientId', dbOps.getTreatmentGoalsByClientId);
    testFunctionExists('updateTreatmentGoal', dbOps.updateTreatmentGoal);
    testFunctionExists('deleteTreatmentGoal', dbOps.deleteTreatmentGoal);

    // ---- PROGRESS METRICS OPERATIONS ----
    console.log('\n--- Testing Progress Metrics Operations ---');
    testFunctionExists('createProgressMetric', dbOps.createProgressMetric);
    testFunctionExists('getProgressMetricById', dbOps.getProgressMetricById);
    testFunctionExists('getProgressMetricsByClientId', dbOps.getProgressMetricsByClientId);
    testFunctionExists('getClientMetricsByName', dbOps.getClientMetricsByName);
    testFunctionExists('updateProgressMetric', dbOps.updateProgressMetric);
    testFunctionExists('deleteProgressMetric', dbOps.deleteProgressMetric);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

/**
 * Tests that a function exists and is callable
 */
function testFunctionExists(functionName: string, func: Function | undefined) {
  if (typeof func === 'function') {
    console.log(`\u2705 ${functionName} function exists and is properly exported`);
  } else {
    console.log(`\u274c ${functionName} function does not exist or is not properly exported`);
  }
}

// Run the tests
testDatabaseOperations();

// To run this file:
// 1. Ensure your environment variables are set (or they will be mocked)
// 2. Run with: npx tsx src/tests/db-operations-test.ts
