import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import { v4 as uuidv4 } from 'uuid';
import * as dbOps from '../services/db-operations';

/**
 * This integration test verifies that our database operations work correctly
 * by performing actual CRUD operations against the Supabase database.
 * 
 * IMPORTANT: Running this test will create and delete real data in your database.
 */
async function runIntegrationTests() {
  console.log('Starting database operations integration tests...');
  console.log('This test will create and delete real data in your database.');
  
  try {
    // Generate unique IDs and test data to avoid collisions
    const testId = uuidv4();
    const timestamp = new Date().toISOString();
    
    console.log(`Using test ID: ${testId}`);
    console.log(`Current timestamp: ${timestamp}`);
    
    // ---- THERAPIST OPERATIONS ----
    console.log('\n=== Testing Therapist Operations ===');
    
    // Create a test therapist
    const therapistInput = {
      user_id: `test-user-${testId}`,
      full_name: 'Test Therapist',
      credentials: 'PhD, Test Certification',
      specialties: ['Testing', 'Integration Testing'],
      bio: 'A therapist created for testing purposes',
      profile_image_url: 'https://example.com/test-image.jpg'
    };
    
    console.log('Creating test therapist...');
    const createTherapistResult = await dbOps.createTherapist(therapistInput);
    
    if (createTherapistResult.error) {
      throw new Error(`Failed to create therapist: ${createTherapistResult.error.message}`);
    }
    
    const therapistId = createTherapistResult.data?.id;
    console.log(`✅ Created therapist with ID: ${therapistId}`);
    
    // Read the therapist
    console.log('Fetching therapist by ID...');
    const getTherapistResult = await dbOps.getTherapistById(therapistId!);
    
    if (getTherapistResult.error) {
      throw new Error(`Failed to get therapist: ${getTherapistResult.error.message}`);
    }
    
    console.log(`✅ Retrieved therapist: ${getTherapistResult.data?.full_name}`);
    
    // Update the therapist
    console.log('Updating therapist...');
    const updateTherapistResult = await dbOps.updateTherapist(therapistId!, {
      full_name: 'Updated Test Therapist',
      bio: 'Updated bio for testing purposes'
    });
    
    if (updateTherapistResult.error) {
      throw new Error(`Failed to update therapist: ${updateTherapistResult.error.message}`);
    }
    
    console.log(`✅ Updated therapist name to: ${updateTherapistResult.data?.full_name}`);
    
    // ---- CLIENT OPERATIONS ----
    console.log('\n=== Testing Client Operations ===');
    
    // Create a test client
    const clientInput = {
      therapist_id: therapistId!,
      first_name: 'Test',
      last_name: 'Client',
      email: `test.client.${testId}@example.com`,
      phone: '123-456-7890',
      status: 'Active' as const
    };
    
    console.log('Creating test client...');
    const createClientResult = await dbOps.createClient(clientInput);
    
    if (createClientResult.error) {
      throw new Error(`Failed to create client: ${createClientResult.error.message}`);
    }
    
    const clientId = createClientResult.data?.id;
    console.log(`✅ Created client with ID: ${clientId}`);
    
    // Read the client
    console.log('Fetching client by ID...');
    const getClientResult = await dbOps.getClientById(clientId!);
    
    if (getClientResult.error) {
      throw new Error(`Failed to get client: ${getClientResult.error.message}`);
    }
    
    console.log(`✅ Retrieved client: ${getClientResult.data?.first_name} ${getClientResult.data?.last_name}`);
    
    // Get clients by therapist ID
    console.log('Fetching clients by therapist ID...');
    const getClientsByTherapistResult = await dbOps.getClientsByTherapistId(therapistId!);
    
    if (getClientsByTherapistResult.error) {
      throw new Error(`Failed to get clients by therapist ID: ${getClientsByTherapistResult.error.message}`);
    }
    
    console.log(`✅ Retrieved ${getClientsByTherapistResult.data?.length} clients for therapist`);
    
    // Update the client
    console.log('Updating client...');
    const updateClientResult = await dbOps.updateClient(clientId!, {
      first_name: 'Updated',
      last_name: 'Test Client'
    });
    
    if (updateClientResult.error) {
      throw new Error(`Failed to update client: ${updateClientResult.error.message}`);
    }
    
    console.log(`✅ Updated client name to: ${updateClientResult.data?.first_name} ${updateClientResult.data?.last_name}`);
    
    // ---- CLIENT PROFILE OPERATIONS ----
    console.log('\n=== Testing Client Profile Operations ===');
    
    // Create a test client profile
    const clientProfileInput = {
      client_id: clientId!,
      date_of_birth: '1990-01-01',
      address: '123 Test Street',
      occupation: 'Software Engineer',
      emergency_contact: 'John Doe (555-123-4567)',
      primary_concerns: ['Anxiety', 'Stress Management'],
      therapy_type: 'Cognitive Behavioral Therapy',
      start_date: new Date().toISOString().split('T')[0]
    };
    
    console.log('Creating test client profile...');
    const createClientProfileResult = await dbOps.createClientProfile(clientProfileInput);
    
    if (createClientProfileResult.error) {
      throw new Error(`Failed to create client profile: ${createClientProfileResult.error.message}`);
    }
    
    const clientProfileId = createClientProfileResult.data?.id;
    console.log(`✅ Created client profile with ID: ${clientProfileId}`);
    
    // Read the client profile
    console.log('Fetching client profile by client ID...');
    const getClientProfileResult = await dbOps.getClientProfileByClientId(clientId!);
    
    if (getClientProfileResult.error) {
      throw new Error(`Failed to get client profile: ${getClientProfileResult.error.message}`);
    }
    
    console.log(`✅ Retrieved client profile for client`);
    
    // Update the client profile
    console.log('Updating client profile...');
    const updateClientProfileResult = await dbOps.updateClientProfile(clientProfileId!, {
      address: 'Updated Address: 456 New Street',
      primary_concerns: ['Updated: Work-Life Balance']
    });
    
    if (updateClientProfileResult.error) {
      throw new Error(`Failed to update client profile: ${updateClientProfileResult.error.message}`);
    }
    
    console.log(`✅ Updated client profile`);
    
    // ---- SESSION OPERATIONS ----
    console.log('\n=== Testing Session Operations ===');
    
    // Create a test session
    const sessionInput = {
      client_id: clientId!,
      therapist_id: therapistId!,
      session_date: timestamp,
      duration_minutes: 50,
      session_type: 'Virtual' as const, // Type assertion for literal type
      status: 'Scheduled' as const // Type assertion for literal type
    };
    
    console.log('Creating test session...');
    const createSessionResult = await dbOps.createSession(sessionInput);
    
    if (createSessionResult.error) {
      throw new Error(`Failed to create session: ${createSessionResult.error.message}`);
    }
    
    const sessionId = createSessionResult.data?.id;
    console.log(`✅ Created session with ID: ${sessionId}`);
    
    // Read the session
    console.log('Fetching session by ID...');
    const getSessionResult = await dbOps.getSessionById(sessionId!);
    
    if (getSessionResult.error) {
      throw new Error(`Failed to get session: ${getSessionResult.error.message}`);
    }
    
    console.log(`✅ Retrieved session`);
    
    // Get sessions by client ID
    console.log('Fetching sessions by client ID...');
    const getSessionsByClientResult = await dbOps.getSessionsByClientId(clientId!);
    
    if (getSessionsByClientResult.error) {
      throw new Error(`Failed to get sessions by client ID: ${getSessionsByClientResult.error.message}`);
    }
    
    console.log(`✅ Retrieved ${getSessionsByClientResult.data?.length} sessions for client`);
    
    // Update the session
    console.log('Updating session...');
    const updateSessionResult = await dbOps.updateSession(sessionId!, {
      status: 'Completed' as const
      // Removed notes field as it may not be in the type definition
    });
    
    if (updateSessionResult.error) {
      throw new Error(`Failed to update session: ${updateSessionResult.error.message}`);
    }
    
    console.log(`✅ Updated session status to: ${updateSessionResult.data?.status}`);
    
    // ---- CLEAN UP ----
    console.log('\n=== Cleaning Up ===');
    
    // Delete session
    console.log('Deleting session...');
    const deleteSessionResult = await dbOps.deleteSession(sessionId!);
    
    if (deleteSessionResult.error) {
      throw new Error(`Failed to delete session: ${deleteSessionResult.error.message}`);
    }
    
    console.log('✅ Deleted session');
    
    // Delete client profile
    console.log('Deleting client profile...');
    const deleteClientProfileResult = await dbOps.deleteClientProfile(clientProfileId!);
    
    if (deleteClientProfileResult.error) {
      throw new Error(`Failed to delete client profile: ${deleteClientProfileResult.error.message}`);
    }
    
    console.log('✅ Deleted client profile');
    
    // Delete client
    console.log('Deleting client...');
    const deleteClientResult = await dbOps.deleteClient(clientId!);
    
    if (deleteClientResult.error) {
      throw new Error(`Failed to delete client: ${deleteClientResult.error.message}`);
    }
    
    console.log('✅ Deleted client');
    
    // Delete therapist
    console.log('Deleting therapist...');
    const deleteTherapistResult = await dbOps.deleteTherapist(therapistId!);
    
    if (deleteTherapistResult.error) {
      throw new Error(`Failed to delete therapist: ${deleteTherapistResult.error.message}`);
    }
    
    console.log('✅ Deleted therapist');
    
    console.log('\n🎉 All integration tests completed successfully!');
    console.log('Database operations are working correctly.');
    
  } catch (error) {
    console.error('❌ Error during integration tests:', error);
  }
}

// Run the integration tests
runIntegrationTests();

// To run this file:
// 1. Ensure your environment variables are set with valid Supabase credentials
// 2. Run with: npx tsx src/tests/db-operations-integration-test.ts
