import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Calendar, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { ClinicalNote } from "@/types/notes";
import { format } from "date-fns";
import NoteDetailsModal from "@/components/NoteDetailsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

function getPreview(text: string, maxLength = 80) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const NotesGrid = ({ notes }: { notes: ClinicalNote[] }) => {
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleCardClick = (note: any) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteClick = (note: any) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      const idx = notes.findIndex((n) => n.id === noteToDelete.id);
      if (idx !== -1) {
        notes.splice(idx, 1);
      }
    }
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleEditClick = (note: any) => {
    setNoteToEdit(note);
    setEditForm({
      title: note.title,
      date: note.date,
      therapyType: note.therapyType,
      tags: note.tags ? note.tags.join(", ") : "",
      content: note.content.insights ? note.content.insights.join("\n") : "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    if (noteToEdit) {
      noteToEdit.title = editForm.title;
      noteToEdit.date = editForm.date;
      noteToEdit.therapyType = editForm.therapyType;
      noteToEdit.tags = editForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
      noteToEdit.content.insights = editForm.content.split("\n").filter(Boolean);
    }
    setEditDialogOpen(false);
    setNoteToEdit(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setNoteToEdit(null);
  };

  if (!notes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <ScrollText className="w-12 h-12 mb-4 text-therapy-purple/40" />
        <p className="text-lg font-semibold mb-2">No notes found</p>
        <p className="text-sm">Create a new note to get started.</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-2">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="group transition-all cursor-pointer rounded-lg border border-gray-100 bg-white/90 focus-within:ring-2 focus-within:ring-therapy-purple relative overflow-hidden px-1 pt-1 pb-2 shadow-sm hover:shadow-lg hover:scale-[1.015] min-h-[210px]"
            tabIndex={0}
            onClick={() => handleCardClick(note)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(note); }}
            aria-label={`Open details for note ${note.title}`}
          >
            {/* Left accent bar and icon */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-therapy-purple to-therapy-blue rounded-l-lg" />
            <div className="absolute left-3 top-3">
              <FileText className="w-4 h-4 text-therapy-purple/80" />
            </div>
            <CardHeader className="pb-1 pl-10 pr-1 pt-1 flex flex-row items-start justify-between gap-2">
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <CardTitle className="text-base font-bold text-therapy-gray break-words mb-0.5">
                  {note.title}
                </CardTitle>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-therapy-blue/20 to-therapy-purple/20 text-therapy-purple shadow border border-therapy-purple/10 tracking-wide uppercase whitespace-nowrap mb-0.5 w-fit">
                  {note.therapyType}
                </span>
                <CardDescription className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(note.date), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 mt-0.5">
                <div className="flex gap-1">
                  <Tooltip content="Edit">
                    <button
                      className="p-1 rounded hover:bg-therapy-blue/20 text-therapy-purple hover:text-therapy-blue transition-colors focus:outline-none focus:ring-2 focus:ring-therapy-purple"
                      aria-label="Edit note"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleEditClick(note); }}
                      tabIndex={0}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <button
                      className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Delete note"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(note); }}
                      tabIndex={0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-10 pr-1">
              <div className="space-y-1">
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-therapy-blue/10 text-therapy-blue border border-therapy-blue/20 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-600 text-xs mb-1 min-h-[2em]">
                  {getPreview(note.content.insights[0])}
                </div>
                <div className="flex justify-center mt-2">
                  <button
                    className="flex items-center gap-1 text-therapy-purple font-semibold px-4 py-1.5 rounded-full bg-gradient-to-r from-therapy-blue/20 to-therapy-purple/20 hover:from-therapy-purple/30 hover:to-therapy-blue/30 hover:text-therapy-blue shadow-md border border-therapy-purple/10 transition-all focus:outline-none focus:ring-2 focus:ring-therapy-purple focus:ring-offset-2 active:scale-95 text-sm"
                    tabIndex={0}
                    aria-label={`View details for note ${note.title}`}
                    onClick={(e) => { e.stopPropagation(); handleCardClick(note); }}
                    type="button"
                  >
                    <Eye className="w-4 h-4" /> <span className="font-bold">View Details</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <NoteDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        note={selectedNote}
        onEdit={() => {
          setEditDialogOpen(true);
          setNoteToEdit(selectedNote);
          setEditForm({
            title: selectedNote?.title,
            date: selectedNote?.date,
            therapyType: selectedNote?.therapyType,
            tags: selectedNote?.tags ? selectedNote.tags.join(", ") : "",
            content: selectedNote?.content?.insights ? selectedNote.content.insights.join("\n") : "",
          });
          setModalOpen(false);
        }}
        onDelete={() => {
          setDeleteDialogOpen(true);
          setNoteToDelete(selectedNote);
          setModalOpen(false);
        }}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl shadow-2xl border-2 border-red-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">Delete Note?</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700 mb-4">Are you sure you want to delete this valuable piece of therapy transcription?</div>
          <DialogFooter>
            <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
            <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl shadow-2xl border-2 border-therapy-purple/30 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-therapy-purple">Edit Note</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input name="title" value={editForm.title || ""} onChange={handleEditFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input name="date" type="date" value={editForm.date ? editForm.date.slice(0, 10) : ""} onChange={handleEditFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Type</label>
              <Input name="therapyType" value={editForm.therapyType || ""} onChange={handleEditFormChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <Input name="tags" value={editForm.tags || ""} onChange={handleEditFormChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (one insight per line)</label>
              <textarea name="content" value={editForm.content || ""} onChange={handleEditFormChange} rows={5} className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-therapy-purple" />
            </div>
            <DialogFooter>
              <button type="button" onClick={handleEditCancel} className="px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-therapy-purple text-white hover:bg-therapy-blue">Save</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotesGrid; 