import { supabase } from '@/lib/supabase';
import * as sessionNoteOperations from '@/services/db-operations/sessionNotes';
import { DbResponse } from '@/lib/supabase';
import { SessionNote, SessionNoteInput } from '@/services/db-operations/sessionNotes';

export interface NoteContent {
  insights: string[];
  recommendations: {
    nextSession: string[];
    homework: string[];
  };
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
  return {
    title: note.title,
    content: note.content,
    therapy_type: note.therapyType,
    tags: note.tags,
    client_id: note.clientId || '',
    session_id: note.sessionId || '',
    therapist_id: therapistId
  };
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
  async saveNote(note: Note, therapistId: string): Promise<DbResponse<Note>> {
    try {
      const sessionNoteInput = mapNoteToSessionNoteInput(note, therapistId);
      
      const { data, error } = await sessionNoteOperations.createSessionNote(sessionNoteInput);

      if (error) throw error;
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
      // We're not implementing mock data fallback here to ensure true database integration
      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { 
        data: data ? data.map(note => mapSessionNoteToNote(note as SessionNote)) : [], 
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
