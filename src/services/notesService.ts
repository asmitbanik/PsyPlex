import { ClinicalNote } from "@/types/notes";

class NotesService {
  private storageKey = "clinical_notes";

  getAllNotes(): ClinicalNote[] {
    const notes = localStorage.getItem(this.storageKey);
    return notes ? JSON.parse(notes) : [];
  }

  saveNote(note: Omit<ClinicalNote, "id" | "date">): ClinicalNote {
    const notes = this.getAllNotes();
    const newNote: ClinicalNote = {
      ...note,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };

    notes.push(newNote);
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    return newNote;
  }

  deleteNote(id: string): void {
    const notes = this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredNotes));
  }

  updateNote(id: string, updates: Partial<ClinicalNote>): ClinicalNote | null {
    const notes = this.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) return null;
    
    const updatedNote = { ...notes[noteIndex], ...updates };
    notes[noteIndex] = updatedNote;
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
    
    return updatedNote;
  }

  getNoteById(id: string): ClinicalNote | null {
    const notes = this.getAllNotes();
    return notes.find(note => note.id === id) || null;
  }
}

export const notesService = new NotesService();
