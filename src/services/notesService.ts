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
   * @param therapistId The ID of the therapist saving the note
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
      
      // ================ STEP 1: DETERMINE THERAPIST ID ================
      // This is critical to avoid foreign key constraint violations later
      let therapistId = '';
      
      console.log('Determining valid therapist ID...');
      
      // First check if we already have a valid therapist ID in the note object
      if (note.therapistId && note.therapistId.trim() !== '') {
        // We have a therapist ID in the note, let's verify it exists
        const { data: therapistFromNoteId } = await supabaseAdmin
          .from('therapists')
          .select('id')
          .eq('id', note.therapistId.trim())
          .maybeSingle();
          
        if (therapistFromNoteId) {
          therapistId = note.therapistId.trim();
          console.log(`Using valid therapist ID from note: ${therapistId}`);
        }
      }
      
      // If we still don't have a valid therapist ID, check if the provided ID is a therapist ID
      if (!therapistId) {
        const { data: therapistData } = await supabaseAdmin
          .from('therapists')
          .select('id')
          .eq('id', cleanUserId)
          .maybeSingle();
        
        if (therapistData) {
          // The provided ID is a valid therapist ID
          therapistId = cleanUserId;
          console.log(`Using provided therapist ID: ${therapistId}`);
        }
      }
      
      // If we still don't have a valid therapist ID, look up by user ID
      if (!therapistId) {
        console.log('Looking up therapist by user ID...');
        
        const { data: therapistByUserId, error: therapistError } = await supabaseAdmin
          .from('therapists')
          .select('id')
          .eq('user_id', cleanUserId)
          .maybeSingle();
          
        if (therapistError && !therapistError.message.includes('No rows found')) {
          console.error('Error fetching therapist by user ID:', therapistError);
        }
        
        if (therapistByUserId) {
          // Found therapist record
          therapistId = therapistByUserId.id;
          console.log(`Found therapist ID ${therapistId} for user ID ${cleanUserId}`);
        }
      }
      
      // ================ STEP 2: CREATE THERAPIST IF NEEDED ================
      // If we still don't have a valid therapist, create one using the service role
      if (!therapistId) {
        console.log('No existing therapist found, creating a therapist record with user ID', cleanUserId);
        
        try {
          // Generate a new UUID for the therapist if needed
          const newTherapistId = uuidv4();
          
          // Create a therapist record with the admin client
          const { data: newTherapist, error: createError } = await supabaseAdmin
            .from('therapists')
            .insert({
              id: newTherapistId,
              user_id: cleanUserId,
              full_name: 'Auto-created Therapist', // Placeholder name
            })
            .select()
            .single();
            
          if (createError || !newTherapist) {
            console.error('Failed to create therapist record:', createError);
            throw new Error(`Unable to create therapist record: ${createError?.message || 'Unknown error'}`);
          }
          
          therapistId = newTherapist.id;
          console.log(`Successfully created new therapist with ID: ${therapistId}`);
        } catch (error) {
          console.error('Error creating therapist:', error);
          throw new Error('Failed to create therapist record. Please contact support.');
        }
      }
      
      // Set the therapist ID on the note
      note.therapistId = therapistId;
      
      // Check if we have a valid therapist ID now
      if (!therapistId) {
        throw new Error('Failed to identify or create a valid therapist ID for this note');
      }
      
      // ================ STEP 3: PREPARE NOTE INPUT ================
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
      // This method will handle Row-Level Security to create the note
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
   * @param therapistId The ID of the therapist
   * @returns Promise with array of notes
   */
  async getNotesByTherapist(therapistId: string): Promise<DbResponse<Note[]>> {
    try {
      // Validate therapist ID
      if (!therapistId || therapistId.trim() === '') {
        throw new Error('Valid therapist ID is required to fetch notes');
      }

      console.log('Fetching notes for therapist ID:', therapistId);

      // First we need to find all the therapist records for this user
      const { data: therapistData, error: therapistError } = await supabase
        .from('therapists')
        .select('id')
        .eq('user_id', therapistId);

      if (therapistError) {
        console.error('Error finding therapist records:', therapistError);
        throw therapistError;
      }

      // If no therapist records found, return empty array
      if (!therapistData || therapistData.length === 0) {
        console.log(`No therapist records found for user ID: ${therapistId}`);
        return { data: [], error: null };
      }

      // Extract therapist IDs
      const therapistIds = therapistData.map(t => t.id);
      console.log(`Found ${therapistIds.length} therapist IDs:`, therapistIds);

      // Use the sessionNoteOperations module for consistency
      // First try to fetch notes using the first therapist ID
      let allNotes: SessionNote[] = [];

      for (const tId of therapistIds) {
        const { data, error } = await supabase
          .from('session_notes')
          .select('*')
          .eq('therapist_id', tId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching notes for therapist ID ${tId}:`, error);
        } else if (data && data.length > 0) {
          console.log(`Found ${data.length} notes for therapist ID ${tId}`);
          allNotes = [...allNotes, ...data];
        }
      }

      // Convert all notes to the Note interface
      return { 
        data: allNotes.map(note => mapSessionNoteToNote(note as SessionNote)), 
        error: null 
      };
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
