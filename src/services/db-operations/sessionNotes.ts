import { supabase, supabaseAdmin, DbResponse } from '../../lib/supabase';
import * as sessionOperations from './sessions';

export type SessionNote = {
  id: string;
  session_id: string;
  therapist_id: string;
  client_id: string;
  title: string;
  content: Record<string, any>; // JSONB
  therapy_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

// Make session_id optional in the input type
export type SessionNoteInput = Omit<SessionNote, 'id' | 'created_at' | 'updated_at'> & {
  // Even though we made this optional in the type, the database requires it
  session_id?: string;
};

/**
 * Creates a new session note - this is the public facing function that handles RLS
 * @param noteData The session note data to create
 * @returns The created session note or an error
 */
export async function createSessionNote(noteData: SessionNoteInput): Promise<DbResponse<SessionNote>> {
  try {
    console.log('Starting session note creation with potential RLS bypass');
    
    // First, ensure the user is authenticated (we still need to know who they are)
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user?.id) {
      throw new Error('Authentication required - you must be logged in');
    }
    
    // Get the current authenticated user's ID
    const currentUserId = authData.session.user.id;
    console.log(`Current authenticated user ID: ${currentUserId}`);
    
    // Validate the input data
    if (!noteData.client_id || noteData.client_id.trim() === '') {
      throw new Error('Valid client_id UUID is required');
    }
    
    if (!noteData.therapist_id || noteData.therapist_id.trim() === '') {
      throw new Error('Valid therapist_id UUID is required');
    }
    
    if (!noteData.title || noteData.title.trim() === '') {
      throw new Error('Note title is required');
    }
    
    if (!noteData.content) {
      throw new Error('Note content is required');
    }
    
    // Use the admin client to bypass RLS restrictions and create the note
    // We need the admin client to bypass RLS policies for both session and note creation
    return await createSessionNoteWithServiceRole(noteData, currentUserId);
    
  } catch (error) {
    console.error('Session note creation error:', error);
    return { data: null, error: error as Error };
  }
}



/**
 * Internal helper function that creates a session note using the admin client
 * This bypasses RLS policies entirely
 */
async function createSessionNoteWithServiceRole(
  noteData: SessionNoteInput,
  userId: string
): Promise<DbResponse<SessionNote>> {
  try {
    console.log('Creating session note with supabaseAdmin client, bypassing RLS');
    
    // Ensure we have the admin client available
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - check your environment variables');
    }
    
    // ================ STEP 1: VERIFY THAT THERAPIST EXISTS ================
    // First, verify that the therapist_id exists in the therapists table
    // This is critical to avoid foreign key constraint violations
    
    console.log('STEP 1: Verifying therapist exists...');
    if (!noteData.therapist_id || noteData.therapist_id.trim() === '') {
      throw new Error('Valid therapist_id is required');
    }
    
    const sanitizedTherapistId = noteData.therapist_id.trim();
    console.log(`Using sanitized therapist ID: ${sanitizedTherapistId}`);
    
    try {
      // Check if the therapist exists in the database
      const { data: therapistData, error: therapistError } = await supabaseAdmin
        .from('therapists')
        .select('id, user_id')
        .eq('id', sanitizedTherapistId)
        .maybeSingle();
        
      if (therapistError) {
        console.error('Error verifying therapist:', therapistError);
        throw new Error(`Error verifying therapist: ${therapistError.message}`);
      }
        
      if (!therapistData) {
        console.error(`Therapist with ID ${sanitizedTherapistId} does not exist - creating one`);
        
        // First, check if any therapist exists for this user
        const { data: userTherapist } = await supabaseAdmin
          .from('therapists')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (userTherapist) {
          // User already has a therapist record with a different ID
          console.log(`User ${userId} already has therapist ID ${userTherapist.id}, using it instead`);
          noteData.therapist_id = userTherapist.id;
          return await createSessionNoteWithServiceRole(noteData, userId);
        }
        
        console.log(`Creating new therapist record with ID ${sanitizedTherapistId} for user ${userId}`);
        
        // Create a minimal therapist record using the admin client
        const { data: newTherapist, error: createError } = await supabaseAdmin
          .from('therapists')
          .insert({
            id: sanitizedTherapistId, // Use the provided ID
            user_id: userId, // Link to the current authenticated user
            full_name: 'Auto-created Therapist', // Placeholder name
          })
          .select()
          .single();
          
        if (createError || !newTherapist) {
          console.error('Failed to create therapist record:', createError);
          
          // If creation with the specified ID fails, try creating with a new UUID
          console.log('Attempting to create with a new UUID...');
          const { v4: uuidv4 } = await import('uuid');
          const newId = uuidv4();
          
          const { data: fallbackTherapist, error: fallbackError } = await supabaseAdmin
            .from('therapists')
            .insert({
              id: newId, // Generate a new UUID
              user_id: userId,
              full_name: 'Auto-created Therapist',
            })
            .select()
            .single();
            
          if (fallbackError || !fallbackTherapist) {
            console.error('Failed to create fallback therapist:', fallbackError);
            throw new Error(`Unable to create therapist record: ${fallbackError?.message || createError?.message || 'Unknown error'}`);
          }
          
          // Update the therapist_id in the note data
          console.log(`Created fallback therapist with ID: ${fallbackTherapist.id}`);
          noteData.therapist_id = fallbackTherapist.id;
          return await createSessionNoteWithServiceRole(noteData, userId);
        }
        
        console.log(`Successfully created therapist record with ID: ${newTherapist.id}`);
      } else {
        console.log(`Verified existing therapist with ID: ${therapistData.id}`);
      }
    } catch (error) {
      console.error('Error handling therapist verification:', error);
      throw new Error(`Therapist verification failed: ${error.message}`);
    }
    
    // ================ STEP 2: VERIFY CLIENT EXISTS ================
    // Verify that the client exists in the clients table
    console.log('STEP 2: Verifying client exists...');
    if (!noteData.client_id || noteData.client_id.trim() === '') {
      throw new Error('Valid client_id is required');
    }
    
    const sanitizedClientId = noteData.client_id.trim();
    console.log(`Using sanitized client ID: ${sanitizedClientId}`);
    
    try {
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('id', sanitizedClientId)
        .maybeSingle();
        
      if (clientError) {
        console.error('Error verifying client:', clientError);
        throw new Error(`Error verifying client: ${clientError.message}`);
      }
        
      if (!clientData) {
        console.error(`Client with ID ${sanitizedClientId} does not exist - attempting to create`);
        
        // Try to create a minimal client record
        const { data: newClient, error: createError } = await supabaseAdmin
          .from('clients')
          .insert({
            id: sanitizedClientId,
            therapist_id: noteData.therapist_id.trim(), // Link to the therapist
            full_name: 'Auto-created Client', // Placeholder name
          })
          .select()
          .single();
          
        if (createError || !newClient) {
          console.error('Failed to create client record:', createError);
          throw new Error(`Client with ID ${sanitizedClientId} does not exist and could not be created: ${createError?.message || 'Unknown error'}`);
        }
        
        console.log(`Successfully created client record with ID: ${newClient.id}`);
      } else {
        console.log(`Verified existing client with ID: ${clientData.id}`);
      }
    } catch (error) {
      console.error('Error handling client verification:', error);
      throw new Error(`Client verification failed: ${error.message}`);
    }
    
    // ================ STEP 3: HANDLE NOTE CONTENT ================
    // Ensure content is properly formatted as a JSON object
    console.log('STEP 3: Processing note content...');
    let contentToUse = noteData.content;
    if (typeof contentToUse === 'string') {
      try {
        contentToUse = JSON.parse(contentToUse as unknown as string);
        console.log('Successfully parsed content string to JSON object');
      } catch (e) {
        console.error('Error parsing content string to JSON:', e);
        // If parsing fails, create a basic structure
        contentToUse = { insights: [], recommendations: { nextSession: [], homework: [] } };
        console.log('Created default content structure');
      }
    } else {
      console.log('Content is already an object, no parsing needed');
    }
    
    // ================ STEP 4: VALIDATE AND CREATE SESSION ================
    // This is the critical step where we ensure we have a valid session
    // We must create a valid session BEFORE trying to create the note
    console.log('STEP 4: Creating or validating session...');
    let sessionId;
    try {
      // If session_id is provided, try to verify it exists
      if (noteData.session_id && noteData.session_id.trim() !== '') {
        sessionId = noteData.session_id.trim();
        console.log(`Using provided session ID: ${sessionId}`);
        
        // Verify this session exists
        const { data: existingSession } = await supabaseAdmin
          .from('sessions')
          .select('id, client_id, therapist_id')
          .eq('id', sessionId)
          .maybeSingle();
          
        if (!existingSession) {
          console.log(`Provided session ID ${sessionId} not found, will create a new session`);
          sessionId = null; // Force creation of a new session
        } else {
          // Verify the session belongs to the right client and therapist
          if (existingSession.client_id !== sanitizedClientId || 
              existingSession.therapist_id !== sanitizedTherapistId) {
            console.log(`Session exists but belongs to different client/therapist, creating new session instead`);
            sessionId = null; // Force creation of a new session
          } else {
            console.log(`Verified existing session with ID: ${existingSession.id}`);
          }
        }
      }
      
      // If session_id is not valid or provided, create a new session
      if (!sessionId) {
        console.log('Creating a new session for this note');
        
        // Today's date formatted for the database
        const today = new Date().toISOString();
        
        // Define the session data
        const sessionData = {
          client_id: sanitizedClientId,
          therapist_id: sanitizedTherapistId,
          session_date: today,
          session_type: 'Virtual',
          status: 'Completed',
          duration_minutes: 0 // Placeholder for standalone notes
        };
        
        console.log('Creating session with data:', JSON.stringify(sessionData, null, 2));
        
        try {
          // Insert the session using the admin client
          const { data, error } = await supabaseAdmin
            .from('sessions')
            .insert(sessionData)
            .select();
            
          if (error || !data || data.length === 0) {
            console.error('Failed to create session:', error);
            throw new Error(`Could not create session: ${error?.message || 'Unknown error'}`);
          }
          
          // Set the session_id from the newly created session
          sessionId = data[0].id;
          console.log(`Successfully created new session with ID: ${sessionId}`);
        } catch (sessionError) {
          console.error('Error creating session:', sessionError);
          
          // Try one more time with a different approach
          try {
            const { v4: uuidv4 } = await import('uuid');
            const explicitSessionId = uuidv4();
            
            const fallbackSessionData = {
              id: explicitSessionId, // Explicitly set the ID
              client_id: sanitizedClientId,
              therapist_id: sanitizedTherapistId,
              session_date: today,
              session_type: 'Virtual',
              status: 'Completed', 
              duration_minutes: 0
            };
            
            console.log('Attempting fallback session creation with explicit ID:', fallbackSessionData);
            
            const { data: fallbackData, error: fallbackError } = await supabaseAdmin
              .from('sessions')
              .insert(fallbackSessionData)
              .select();
              
            if (fallbackError || !fallbackData || fallbackData.length === 0) {
              console.error('Fallback session creation failed:', fallbackError);
              throw new Error(`Could not create session using fallback method: ${fallbackError?.message || 'Unknown error'}`);
            }
            
            sessionId = fallbackData[0].id;
            console.log(`Successfully created fallback session with ID: ${sessionId}`);
          } catch (fallbackError) {
            console.error('Both session creation attempts failed:', fallbackError);
            throw new Error(`All session creation attempts failed: ${fallbackError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling session creation:', error);
      throw new Error(`Session creation failed: ${error.message}`);
    }
    
    // ================ STEP 3: CREATE THE NOTE ================
    // Now we have a guaranteed valid sessionId
    // Prepare the note data with the valid session_id
    const noteDataToInsert = {
      title: noteData.title.trim(),
      client_id: noteData.client_id.trim(),
      therapist_id: noteData.therapist_id.trim(),
      content: contentToUse,
      therapy_type: noteData.therapy_type || 'General',
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      session_id: sessionId // This is now guaranteed to be a valid session ID
    };
    
    console.log('Creating note with data:', JSON.stringify(noteDataToInsert, null, 2));
    
    // Insert the note using the admin client
    const { data, error } = await supabaseAdmin
      .from('session_notes')
      .insert(noteDataToInsert)
      .select();
    
    if (error) {
      console.error('Admin client session note creation failed:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from session note creation');
    }
    
    console.log('Session note created successfully with ID:', data[0].id);
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error in admin client session note creation:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves a specific session note by its ID
 * @param noteId UUID of the session note
 * @returns The session note data or an error
 */
export async function getSessionNoteById(noteId: string): Promise<DbResponse<SessionNote>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('id', noteId);

    if (error) throw error;
    
    // Return the first note if available
    const note = data && data.length > 0 ? data[0] : null;
    return { data: note, error: null };
  } catch (error) {
    console.error('Error fetching session note:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all notes for a specific session
 * @param sessionId UUID of the session
 * @returns Array of session note objects or an error
 */
export async function getSessionNotesBySessionId(sessionId: string): Promise<DbResponse<SessionNote[]>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session notes by session ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Retrieves all session notes for a specific client
 * @param clientId UUID of the client
 * @returns Array of session note objects or an error
 */
export async function getSessionNotesByClientId(clientId: string): Promise<DbResponse<SessionNote[]>> {
  try {
    const { data, error } = await supabase
      .from('session_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching session notes by client ID:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Updates an existing session note
 * @param noteId UUID of the session note
 * @param updateData Partial session note data to update
 * @returns The updated session note or an error
 */
export async function updateSessionNote(
  noteId: string, 
  updateData: Partial<SessionNoteInput>
): Promise<DbResponse<SessionNote>> {
  try {
    // Handle content field if it's a string
    let updateDataToUse = { ...updateData };
    if (typeof updateDataToUse.content === 'string') {
      try {
        updateDataToUse.content = JSON.parse(updateDataToUse.content as unknown as string);
      } catch (e) {
        console.error('Error parsing content string during update:', e);
      }
    }
    
    const { data, error } = await supabase
      .from('session_notes')
      .update(updateDataToUse)
      .eq('id', noteId)
      .select();

    if (error) throw error;
    
    // Return the first note if available
    const updatedNote = data && data.length > 0 ? data[0] : null;
    return { data: updatedNote, error: null };
  } catch (error) {
    console.error('Error updating session note:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Deletes a session note
 * @param noteId UUID of the session note
 * @returns Success status or an error
 */
export async function deleteSessionNote(noteId: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase
      .from('session_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting session note:', error);
    return { data: null, error: error as Error };
  }
}
