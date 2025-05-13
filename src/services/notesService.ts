import { Database } from '@/types/supabase';
import { BaseService, ServiceResponse } from './base/BaseService';
import { supabase } from '@/lib/supabase';
import { ClinicalNote } from "@/types/notes";

export type SessionNote = Database['public']['Tables']['session_notes']['Row'];

export interface NoteWithSessionDetails extends SessionNote {
  session?: {
    session_date: string;
    session_type: string;
    status: string;
  };
  client?: {
    first_name: string;
    last_name: string;
  };
}

export class NotesService extends BaseService<SessionNote> {
  constructor() {
    super('session_notes');
  }

  /**
   * Get all notes for a therapist with session and client details
   */
  async getNotesByTherapist(therapistId: string): Promise<ServiceResponse<NoteWithSessionDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          session:sessions(session_date, session_type, status),
          client:clients(first_name, last_name)
        `)
        .eq('therapist_id', therapistId);

      return {
        data: data as unknown as NoteWithSessionDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all notes for a client
   */
  async getNotesByClient(clientId: string): Promise<ServiceResponse<NoteWithSessionDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          session:sessions(session_date, session_type, status)
        `)
        .eq('client_id', clientId);

      return {
        data: data as unknown as NoteWithSessionDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get notes for a specific session
   */
  async getNotesBySession(sessionId: string): Promise<ServiceResponse<SessionNote[]>> {
    return await this.getByFilter('session_id', sessionId);
  }

  /**
   * Create a new note
   */
  async createNote(noteData: Partial<SessionNote>): Promise<ServiceResponse<SessionNote>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...noteData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      return { data: data as SessionNote, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Search notes by content or tags
   */
  async searchNotes(
    therapistId: string, 
    searchTerm: string
  ): Promise<ServiceResponse<NoteWithSessionDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          session:sessions(session_date, session_type, status),
          client:clients(first_name, last_name)
        `)
        .eq('therapist_id', therapistId)
        .or(`title.ilike.%${searchTerm}%,tags.cs.{"${searchTerm}"}`)
        .order('created_at', { ascending: false });

      return {
        data: data as unknown as NoteWithSessionDetails[],
        error
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get a note by ID
   */
  async getNoteById(id: string): Promise<ServiceResponse<SessionNote>> {
    return await this.getById(id);
  }

  /**
   * Update a note
   */
  async updateNote(id: string, updates: Partial<SessionNote>): Promise<ServiceResponse<SessionNote>> {
    return await this.update(id, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<ServiceResponse<null>> {
    return await this.delete(id);
  }

  /**
   * Get all notes (compatibility with old API)
   */
  async getAllNotes(therapistId?: string): Promise<ClinicalNote[]> {
    if (!therapistId) {
      return [];
    }

    const { data } = await this.getNotesByTherapist(therapistId);
    if (!data) return [];

    // Convert from new format to old format for compatibility
    return data.map(note => ({
      id: note.id,
      title: note.title,
      date: note.created_at,
      therapyType: note.therapy_type || '',
      content: note.content as any,
      clientId: note.client_id,
      tags: note.tags || []
    }));
  }

  /**
   * Save note (compatibility with old API)
   */
  async saveNote(note: Omit<ClinicalNote, "id" | "date">, therapistId: string, sessionId: string, clientId: string): Promise<ClinicalNote> {
    const { data } = await this.createNote({
      title: note.title,
      content: note.content as any,
      therapy_type: note.therapyType,
      tags: note.tags,
      session_id: sessionId,
      therapist_id: therapistId,
      client_id: clientId
    });

    if (!data) {
      throw new Error('Failed to create note');
    }

    return {
      id: data.id,
      title: data.title,
      date: data.created_at,
      therapyType: data.therapy_type || '',
      content: data.content as any,
      clientId: data.client_id,
      tags: data.tags || []
    };
  }
}

export const notesService = new NotesService();
