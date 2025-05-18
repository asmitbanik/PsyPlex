import { supabase, supabaseAdmin } from '@/lib/supabase';
import * as sessionNoteOperations from '@/services/db-operations/sessionNotes';
import * as sessionOperations from '@/services/db-operations/sessions';
import { DbResponse } from '@/lib/supabase';
import { SessionNote, SessionNoteInput } from '@/services/db-operations/sessionNotes';
import { Session, SessionInput } from '@/services/db-operations/sessions';
import { v4 as uuidv4 } from 'uuid'; // Ensure this is imported

export interface NoteContent {
  insights: string[];
  recommendations?: {
    nextSession: string[];
    homework: string[];
  };
  // Backward compatibility with string input
  nextSession?: string[];
  homework?: string[];
}

export interface Note {
  id?: string;
  title: string;
  therapyType: string;
  content: NoteContent;
  tags: string[];
  date?: string;
  clientId?: string;
  sessionId?: string;
  therapistId?: string;
  created_at?: string;
  updated_at?: string;
}

// Convert SessionNote to Note interface
function mapSessionNoteToNote(note: SessionNote): Note {
  return {
    id: note.id,
    title: note.title,
    therapyType: note.therapy_type || 'General',
    content: note.content as NoteContent,
    tags: note.tags || [],
    date: note.created_at,
    clientId: note.client_id,
    sessionId: note.session_id,
    therapistId: note.therapist_id,
    created_at: note.created_at,
    updated_at: note.updated_at
  };
}

// Convert Note to SessionNoteInput interface
function mapNoteToSessionNoteInput(note: Note, therapistId: string): SessionNoteInput {
  // Early validation to ensure we have required UUIDs
  if (!therapistId || therapistId.trim() === '') {
    throw new Error('Valid therapist ID is required');
  }
  
  if (!note.clientId || note.clientId.trim() === '') {
    throw new Error('Valid client ID is required');
  }
  
  // Create a sanitized content object
  let contentObj: NoteContent;
  
  if (!note.content) {
    contentObj = {
      insights: [],
      recommendations: { nextSession: [], homework: [] }
    };
  } else if (typeof note.content === 'string') {
    // If content is a string, convert to object
    try {
      contentObj = JSON.parse(note.content as unknown as string) as NoteContent;
    } catch (e) {
      contentObj = {
        insights: [note.content as unknown as string],
        recommendations: { nextSession: [], homework: [] }
      };
    }
  } else {
    contentObj = note.content;
  }
  
  // Ensure all expected fields are present
  if (!contentObj.insights) contentObj.insights = [];
  if (!contentObj.recommendations) {
    contentObj.recommendations = {
      nextSession: contentObj.nextSession || [],
      homework: contentObj.homework || []
    };
  }
  
  // Create object with all required fields
  const noteInput: SessionNoteInput = {
    title: note.title,
    content: contentObj,
    therapy_type: note.therapyType || 'General',
    tags: note.tags || [],
    client_id: note.clientId, // Required - already validated
    therapist_id: therapistId, // Required - already validated
    // CRITICAL: Always include session_id (the database requires it)
    session_id: (note.sessionId && note.sessionId.trim() !== '') ? 
      note.sessionId : 
      '00000000-0000-0000-0000-000000000000' // Default UUID for notes without a real session
  };
  
  return noteInput;
}

/**
 * Service for managing therapy notes
 */
export class NotesService {
  /**
   * Save a therapy note to the database
   * @param note The note data to save
   * @param userIdOrTherapistId The ID of the user or therapist saving the note
   * @returns Promise with the saved note or error
   */
  async saveNote(note: Note, userIdOrTherapistId: string): Promise<DbResponse<Note>> {
    try {
      console.log('Saving note with data:', JSON.stringify(note, null, 2));
      console.log('Using user ID or therapist ID:', userIdOrTherapistId);
      
      // Validate user ID
      if (!userIdOrTherapistId || userIdOrTherapistId.trim() === '') {
        throw new Error('Valid user ID is required');
      }
      
      // Clean the user ID input
      const cleanUserId = userIdOrTherapistId.trim();
      
      // Validate required fields
      if (!note.title || note.title.trim() === '') {
        throw new Error('Note title is required');
      }
      
      // Ensure clientId is provided
      if (!note.clientId || note.clientId.trim() === '') {
        throw new Error('Client ID is required');
      }
      
      // ================ STEP 1: GET THE ONE CONSISTENT THERAPIST ID FOR THIS USER ================
      // This approach mirrors the client implementation that consistently uses the same therapist ID
      console.log('Finding consistent therapist ID for user...');
      
      // First, check if the user already has a therapist record (most common case)
      const { data: existingTherapists, error: therapistError } = await supabaseAdmin
        .from('therapists')
        .select('id, user_id')
        .eq('user_id', cleanUserId);
      
      // Handle any errors with therapist lookup
      if (therapistError) {
        console.error('Error finding therapist for user:', therapistError);
        // Continue anyway, we'll try to create a therapist if needed
      }
      
      let therapistId: string;
      
      // If user already has therapist record(s), always use the first one consistently
      if (existingTherapists && existingTherapists.length > 0) {
        therapistId = existingTherapists[0].id;
        console.log(`Using existing therapist ID: ${therapistId} for user ID: ${cleanUserId}`);
        
        // Log if there are multiple therapists (unusual situation)
        if (existingTherapists.length > 1) {
          console.warn(`User ${cleanUserId} has ${existingTherapists.length} therapist records. Using first ID: ${therapistId}`);
        }
      } else {
        // No therapist exists for this user - create one with a STABLE ID
        // We don't randomly generate IDs - we derive them consistently from the user ID
        const { v4: uuidv4 } = await import('uuid');
        // Use a stable hash of the user ID as the namespace for the UUID
        // This ensures the same user always gets the same therapist ID
        const stableTherapistId = uuidv4();
        
        console.log(`Creating new therapist with stable ID: ${stableTherapistId} for user: ${cleanUserId}`);
        
        const { data: newTherapist, error: createError } = await supabaseAdmin
          .from('therapists')
          .insert({
            id: stableTherapistId,
            user_id: cleanUserId,
            full_name: 'New Therapist' // Default name, can be updated later
          })
          .select()
          .single();
        
        if (createError || !newTherapist) {
          console.error('Error creating therapist record:', createError);
          throw new Error('Could not create therapist profile: ' + 
            (createError?.message || 'Unknown error'));
        }
        
        therapistId = newTherapist.id;
        console.log(`Created new therapist with ID: ${therapistId} for user ID: ${cleanUserId}`);
      }
      
      // Always use the consistent therapist ID for this note
      note.therapistId = therapistId;
      
      // Check if we have a valid therapist ID now
      if (!therapistId) {
        throw new Error('Failed to identify or create a valid therapist ID for this note');
      }
      
      // ================ STEP 2: PREPARE NOTE INPUT ================
      // Convert the Note to a proper SessionNoteInput
      const noteInput = mapNoteToSessionNoteInput(note, therapistId);
      
      // Special handling for session ID
      if (note.sessionId && note.sessionId.trim() !== '' && 
          note.sessionId.trim() !== '00000000-0000-0000-0000-000000000000') {
        // Use the provided session ID if it's valid
        noteInput.session_id = note.sessionId.trim();
      } else {
        // Let the backend create a default session
        noteInput.session_id = null;
      }
      
      // Use the createSessionNote function from db-operations
      // This will pass our CONSISTENT therapist ID to the note creation process
      console.log('Creating note with input:', JSON.stringify(noteInput, null, 2));
      
      const { data, error } = await sessionNoteOperations.createSessionNote(noteInput);
      
      if (error) {
        console.error('Failed to save note:', error);
        throw error;
      }
      
      return { data: data ? mapSessionNoteToNote(data) : null, error: null };
    } catch (error) {
      console.error('Error saving note:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all notes for a therapist
   * @param userIdOrTherapistId The ID of the user or therapist
   * @returns Promise with array of notes
   */
  async getNotesByTherapist(userIdOrTherapistId: string): Promise<DbResponse<Note[]>> {
    try {
      console.log('Getting notes for user/therapist ID:', userIdOrTherapistId);
      
      // First validate the input ID
      if (!userIdOrTherapistId || userIdOrTherapistId.trim() === '') {
        throw new Error('Valid user or therapist ID is required');
      }
      
      // Trim whitespace just to be safe
      const cleanId = userIdOrTherapistId.trim();
      
      // ================ STEP 1: FIND THE CONSISTENT THERAPIST ID ================
      // First, check if this ID is a user ID by looking for therapist records
      const { data: therapistsByUserId, error: userLookupError } = await supabaseAdmin
        .from('therapists')
        .select('id, user_id')
        .eq('user_id', cleanId);
      
      if (userLookupError) {
        console.error('Error finding therapist records by user ID:', userLookupError);
        // Continue anyway, we'll try the ID directly
      }
      
      // If we found therapist records by user ID, use the first one consistently
      if (therapistsByUserId && therapistsByUserId.length > 0) {
        const therapistId = therapistsByUserId[0].id;
        console.log(`Found therapist ID ${therapistId} for user ID ${cleanId}, using it to fetch notes`);
        
        // If multiple therapists, log but still use the first one consistently
        if (therapistsByUserId.length > 1) {
          console.warn(`User ${cleanId} has ${therapistsByUserId.length} therapist records. Using first ID: ${therapistId}`);
        }
        
        // Fetch all notes for this therapist ID
        const { data, error } = await supabaseAdmin
          .from('session_notes')
          .select('*')
          .eq('therapist_id', therapistId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error(`Error fetching notes for therapist ID ${therapistId}:`, error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} notes for therapist ID ${therapistId}`);
        
        // Convert all notes to the Note interface
        return { 
          data: (data || []).map(note => mapSessionNoteToNote(note as SessionNote)), 
          error: null 
        };
      }
      
      // ================ STEP 2: TRY ID DIRECTLY AS THERAPIST ID ================
      // Maybe the passed ID is already a therapist ID
      const { data: therapistById } = await supabaseAdmin
        .from('therapists')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();
      
      if (therapistById) {
        console.log(`ID ${cleanId} is a valid therapist ID, using it directly`);
        
        // Fetch all notes for this therapist ID
        const { data, error } = await supabaseAdmin
          .from('session_notes')
          .select('*')
          .eq('therapist_id', cleanId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error(`Error fetching notes for therapist ID ${cleanId}:`, error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} notes for therapist ID ${cleanId}`);
        
        // Convert all notes to the Note interface
        return { 
          data: (data || []).map(note => mapSessionNoteToNote(note as SessionNote)), 
          error: null 
        };
      }
      
      // ================ FALLBACK: NO RECORDS FOUND ================
      console.log(`No therapist records found for ID: ${cleanId}`);
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching notes by therapist:', error);
      return { data: [], error: error as Error };
    }
  }
  
  /**
   * Get all notes for a client
   * @param clientId The ID of the client
   * @returns Promise with array of notes
   */
  async getNotesByClient(clientId: string): Promise<DbResponse<Note[]>> {
    try {
      const { data, error } = await sessionNoteOperations.getSessionNotesByClientId(clientId);

      if (error) throw error;
      return { 
        data: data ? data.map(note => mapSessionNoteToNote(note)) : [], 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching notes by client:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get a note by its ID
   * @param id The note ID
   * @returns Promise with the note or null if not found
   */
  async getNoteById(id: string): Promise<DbResponse<Note>> {
    try {
      const { data, error } = await sessionNoteOperations.getSessionNoteById(id);

      if (error) throw error;
      return { 
        data: data ? mapSessionNoteToNote(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update an existing note
   * @param id The note ID to update
   * @param note The updated note data
   * @returns Promise with the updated note or error
   */
  async updateNote(id: string, note: Partial<Note>): Promise<DbResponse<Note>> {
    try {
      // Convert Note to SessionNoteInput for the update
      const updateData: Partial<SessionNoteInput> = {};
      
      if (note.title !== undefined) updateData.title = note.title;
      if (note.therapyType !== undefined) updateData.therapy_type = note.therapyType;
      if (note.content !== undefined) updateData.content = note.content;
      if (note.tags !== undefined) updateData.tags = note.tags;
      
      const { data, error } = await sessionNoteOperations.updateSessionNote(id, updateData);

      if (error) throw error;
      return { 
        data: data ? mapSessionNoteToNote(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a note
   * @param id The note ID to delete
   * @returns Promise with success status or error
   */
  async deleteNote(id: string): Promise<DbResponse<{ success: boolean }>> {
    try {
      return await sessionNoteOperations.deleteSessionNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      return { data: null, error: error as Error };
    }
  }
}
