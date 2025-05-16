import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { supabase } from '../services/db-operations';

// Load environment variables from .env file
dotenv.config();

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * This file helps debug environment variable loading issues
 */
async function debugEnvVariables() {
  console.log('===== ENVIRONMENT VARIABLES DEBUG =====');
  
  console.log('Environment variables directly:');
  console.log(`- VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`- VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
  
  // Print values (careful with actual keys, truncated for security)
  if (process.env.VITE_SUPABASE_URL) {
    console.log(`- URL starts with: ${process.env.VITE_SUPABASE_URL.substring(0, 10)}...`);
  }
  
  if (process.env.VITE_SUPABASE_ANON_KEY) {
    console.log(`- KEY starts with: ${process.env.VITE_SUPABASE_ANON_KEY.substring(0, 10)}...`);
  }
  
  console.log('\nDotenv package:');
  console.log('- dotenv loaded successfully');
  
  console.log('\nEnv file location:');
  const rootDir = resolve(__dirname, '../..');
  const envPath = join(rootDir, '.env');
  
  if (existsSync(envPath)) {
    console.log(`- .env file exists at: ${envPath}`);
    // Read first line without displaying sensitive info
    const firstLine = readFileSync(envPath, 'utf8').split('\n')[0];
    console.log(`- First line starts with: ${firstLine.substring(0, 20)}...`);
  } else {
    console.log(`- No .env file found at: ${envPath}`);
  }
  
  console.log('\nSupabase client:');
  console.log(`- Client type: ${supabase?.constructor?.name || 'Unknown'}`);
  
  // Test the Supabase client with a simple query
  console.log('\nTesting Supabase connection:');
  try {
    const { count, error } = await supabase.from('therapists').select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`- Connection error: ${error.message}`);
    } else {
      console.log(`- Connection successful! Therapist count: ${count}`);
    }
  } catch (error) {
    console.log(`- Connection failed: ${error}`);
  }
  
  console.log('\n===== DEBUG INFO COMPLETE =====');
}

debugEnvVariables();
