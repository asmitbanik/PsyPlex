/**
 * Set up environment variables for testing
 * This file is used to set environment variables before running tests
 */

// Set Supabase credentials for testing
process.env.VITE_SUPABASE_URL = 'https://zoewqivrhlkrfpqdwkay.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZXdxaXZyaGxrcmZwcWR3a2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Mzk3NDQsImV4cCI6MjA2MjIxNTc0NH0.PlGM1lECzCP-RP7sh2TipNlbXW5QLB_REeTQQ-m1gAs';

console.log('Environment variables set for testing');
