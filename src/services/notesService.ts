import { supabase } from '@/lib/supabase';

export interface NoteContent {
  insights: any;
  recommendations: any;
}

export interface Note {
  title: string;
  therapyType: string;
  content: NoteContent;
  tags: string[];
}

/**
 * Service for managing therapy notes
 */
export const notesService = {
  /**
   * Save a therapy note to the database
   * @param note The note data to save
   * @returns Promise with the saved note or error
   */
  async saveNote(note: Note) {
    try {
      const { data, error } = await supabase
        .from('therapy_notes')
        .insert([
          {
            title: note.title,
            therapy_type: note.therapyType,
            content: note.content,
            tags: note.tags,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  },

  /**
   * Get all notes
   * @returns Promise with array of notes
   */
  async getNotes() {
    try {
      const { data, error } = await supabase
        .from('therapy_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  /**
   * Get a note by its ID
   * @param id The note ID
   * @returns Promise with the note or null if not found
   */
  async getNoteById(id: string) {
    try {
      const { data, error } = await supabase
        .from('therapy_notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      throw error;
    }
  }
};
