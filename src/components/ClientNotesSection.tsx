import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import NotesGrid from "@/components/NotesGrid";

interface ClientNotesSectionProps {
  client: {
    id: string;
    name: string;
    therapyType: string;
    notes: any[];
  };
  searchQuery: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const ClientNotesSection = ({ client, searchQuery }: ClientNotesSectionProps) => {
  const [open, setOpen] = useState(true);
  const filteredNotes = client.notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.insights.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sessionCount = client.notes.length - 1; // minus summary
  const lastSession = client.notes.length > 1 ? client.notes[1].date : null;

  return (
    <Card className="p-0 border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-therapy-purple/20 to-therapy-blue/10 rounded-t-xl focus:outline-none group transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? `Collapse notes for ${client.name}` : `Expand notes for ${client.name}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-therapy-purple/80 flex items-center justify-center text-white text-lg font-bold shadow-md">
            {getInitials(client.name)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-bold text-therapy-purple group-hover:text-therapy-blue transition-colors leading-tight">{client.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs bg-therapy-blue/20 text-therapy-blue px-2 py-0.5 rounded font-semibold uppercase tracking-wide">{client.therapyType}</span>
              <span className="text-xs text-gray-500">{sessionCount} sessions</span>
              {lastSession && <span className="text-xs text-gray-400">Last: {lastSession}</span>}
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-therapy-purple" /> : <ChevronDown className="w-5 h-5 text-therapy-purple" />}
      </button>
      <div
        className={`transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} bg-white`}
        style={{ overflow: open ? 'visible' : 'hidden' }}
      >
        <div className="p-4 pt-0">
          {filteredNotes.length > 0 ? (
            <NotesGrid notes={filteredNotes} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="w-10 h-10 mb-3 text-therapy-blue/40" />
              <p className="text-base font-semibold mb-1 text-therapy-blue">No notes found for this client</p>
              <p className="text-sm text-gray-400">Start by adding a new note for {client.name}.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClientNotesSection; 