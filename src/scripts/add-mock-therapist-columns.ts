/**
 * Script to create and update therapist records for Supabase testing
 * 
 * This script will:
 * 1. Create 10 therapist records with different values to verify Supabase connectivity
 * 2. Update these records with different values to verify updates work
 * 3. List out all therapists to verify changes
 * 
 * Run with: npx tsx src/scripts/add-mock-therapist-columns.ts
 */

import '../tests/setup-env';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Make sure we have the environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Utility function to log success or error
function logResult(operation: string, error: any, data: any) {
  if (error) {
    console.error(`❌ Error during ${operation}:`, error);
    return false;
  } else {
    console.log(`✅ ${operation} successful:`, data);
    return true;
  }
}

// Create a therapist with specified data
async function createTherapist(index: number) {
  const name = `Test Therapist ${index}`;
  console.log(`Creating ${name}...`);
  
  const therapistData = {
    user_id: uuidv4(),
    full_name: name,
    credentials: `PhD, Specialty ${index}`,
    specialties: [`Specialty ${index}`, `Technique ${index}`],
    bio: `This is test therapist number ${index} created at ${new Date().toISOString()}`,
    profile_image_url: index % 2 === 0 ? `https://example.com/profile${index}.jpg` : null
  };
  
  const { data, error } = await supabase
    .from('therapists')
    .insert([therapistData])
    .select();
  
  logResult(`Creating ${name}`, error, data);
  return error ? null : data?.[0];
}

// Update a therapist with new data
async function updateTherapist(therapist: any, index: number) {
  if (!therapist?.id) return null;
  
  console.log(`Updating therapist ${therapist.full_name}...`);
  
  const updateData = {
    full_name: `${therapist.full_name} (Updated)`,
    credentials: `${therapist.credentials} + Updated Certification`,
    bio: `${therapist.bio} - UPDATED at ${new Date().toISOString()}`,
    specialties: [...(therapist.specialties || []), 'Updated Specialty']
  };
  
  const { data, error } = await supabase
    .from('therapists')
    .update(updateData)
    .eq('id', therapist.id)
    .select();
  
  logResult(`Updating ${therapist.full_name}`, error, data);
  return error ? null : data?.[0];
}

// Get all therapists to verify changes
async function getAllTherapists() {
  console.log('\nRetrieving all therapists...');
  
  const { data, error } = await supabase
    .from('therapists')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Error retrieving therapists:', error);
    return [];
  } else {
    console.log(`Retrieved ${data.length} therapists`);
    return data;
  }
}

// Delete test therapists to clean up
async function deleteTestTherapists(therapists: any[]) {
  if (!therapists || therapists.length === 0) return;
  
  console.log('\nCleaning up test therapists...');
  
  for (const therapist of therapists) {
    if (therapist.full_name.startsWith('Test Therapist')) {
      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', therapist.id);
      
      if (error) {
        console.error(`Failed to delete ${therapist.full_name}:`, error);
      } else {
        console.log(`✅ Deleted ${therapist.full_name}`);
      }
    }
  }
}

// Print table of therapists for verification
function displayTherapistsTable(therapists: any[]) {
  console.log('\n=== THERAPISTS TABLE ===');
  console.log('ID | User ID | Full Name | Specialties | Updated At');
  console.log('-'.repeat(80));
  
  therapists.forEach(t => {
    const specialtiesStr = Array.isArray(t.specialties) 
      ? t.specialties.join(', ')
      : t.specialties || 'none';
      
    console.log(`${t.id.substring(0, 8)}... | ${t.user_id.substring(0, 8)}... | ${t.full_name} | ${specialtiesStr.substring(0, 20)}${specialtiesStr.length > 20 ? '...' : ''} | ${t.updated_at}`);
  });
  
  console.log('-'.repeat(80));
}

// Main function
async function main() {
  console.log('Starting Supabase Therapist Testing');
  console.log('===================================');
  
  try {
    // Create 10 therapists with different data
    const createdTherapists = [];
    for (let i = 1; i <= 10; i++) {
      const therapist = await createTherapist(i);
      if (therapist) createdTherapists.push(therapist);
    }
    
    console.log(`\nSuccessfully created ${createdTherapists.length} therapists`);
    
    // Update the therapists
    const updatedTherapists = [];
    for (let i = 0; i < createdTherapists.length; i++) {
      const updated = await updateTherapist(createdTherapists[i], i + 1);
      if (updated) updatedTherapists.push(updated);
    }
    
    console.log(`\nSuccessfully updated ${updatedTherapists.length} therapists`);
    
    // Get all therapists to verify
    const allTherapists = await getAllTherapists();
    
    // Display therapist table
    displayTherapistsTable(allTherapists);
    
    // Ask user whether to keep or delete test therapists
    console.log('\nTest therapists have been created and updated.');
    console.log('You can now verify these changes in your Supabase dashboard.');
    console.log(`Check your database at: ${supabaseUrl.replace('.supabase.co', '')}/dashboard/table/therapists`);
    
    // Clean up by default
    await deleteTestTherapists(allTherapists);
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Unhandled error:', error);
  }
}

// Run the script
main()
  .catch(err => console.error('Unhandled exception:', err));
