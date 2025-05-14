import { supabase } from '../services/db-operations';

/**
 * Simple test to verify Supabase connectivity
 */
async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check if we're using a mock client
    const isMockClient = supabase?.constructor?.name === 'MockSupabaseClient';
    
    if (isMockClient) {
      console.log('Using mock Supabase client - this is expected in testing environments');
      console.log('To test with a real Supabase connection, ensure your .env file contains valid credentials:');
      console.log('- VITE_SUPABASE_URL: Your Supabase project URL');
      console.log('- VITE_SUPABASE_ANON_KEY: Your Supabase anon/public key');
      return;
    }
    
    // If we have a real client, try a simple query
    console.log('Using real Supabase client, attempting connection...');
    
    // Try to ping the database with a simple query
    const { data, error } = await supabase.from('therapists').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('✅ Successfully connected to Supabase');
      console.log('Connection is working properly');
    }
  } catch (error) {
    console.error('❌ Error testing connection:', error);
  }
}

// Print environment variables (without actual values for security)
console.log('Environment Variables:');
console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '(set)' : '(not set)'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? '(set)' : '(not set)'}`);

// Run the test
testSupabaseConnection();

// To run this file:
// 1. Make sure your .env file has the correct Supabase credentials
// 2. Run with: npx tsx src/tests/db-connection-test.ts
