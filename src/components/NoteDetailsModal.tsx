import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Calendar, Tag, X } from "lucide-react";
import { format } from "date-fns";

interface NoteDetailsModalProps {
  open: boolean;
  onClose: () => void;
  note: any | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const NoteDetailsModal = ({ open, onClose, note, onEdit, onDelete }: NoteDetailsModalProps) => {
  if (!note) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl shadow-2xl border-2 border-therapy-purple/30 bg-white">
        <DialogHeader className="flex flex-row items-center justify-between gap-2">
          <DialogTitle className="text-2xl font-bold text-therapy-purple flex-1">{note.title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(note.date), 'MMM d, yyyy')}
          <span className="ml-3 px-2 py-0.5 rounded bg-therapy-blue/20 text-therapy-blue text-xs font-semibold uppercase tracking-wide">{note.therapyType}</span>
        </div>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-therapy-purple/10 text-therapy-purple px-2 py-1 rounded-full font-medium">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}
        <DialogDescription className="text-base text-gray-700 whitespace-pre-line leading-relaxed mb-4">
          {note.content && note.content.insights && Array.isArray(note.content.insights)
            ? note.content.insights.map((line: string, idx: number) => (
                <div key={idx} className="mb-2">{line}</div>
              ))
            : null}
        </DialogDescription>
        <div className="flex justify-end gap-2 mt-4">
          {onEdit && (
            <button
              className="px-4 py-2 rounded bg-therapy-purple text-white hover:bg-therapy-blue transition-colors font-semibold"
              onClick={onEdit}
              type="button"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDetailsModal; 