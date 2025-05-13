import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Search, Tag, Calendar, FilePlus2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClinicalNote } from "@/types/notes";
import { format } from "date-fns";
import clientsData from "@/data/clientsData.json";
import ClientNotesSection from "../components/ClientNotesSection";
import NotesGrid from "@/components/NotesGrid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Helper to transform client sessions into ClinicalNote objects
function extractNotesFromClients(clientsData) {
  const notes = [];
  if (!clientsData.clients) return notes;
  clientsData.clients.forEach((client) => {
    const details = clientsData.clientDetails?.[client.id];
    if (details) {
      // Add client summary note
      if (details.notes) {
        notes.push({
          id: `client-${details.id}`,
          title: `Summary: ${details.name}`,
          therapyType: details.therapyType || "General",
          date: details.lastSession || details.startDate || "",
          tags: details.primaryConcerns ? details.primaryConcerns.split(", ") : [],
          content: { insights: [details.notes] },
        });
      }
      // Add session notes
      if (details.sessions) {
        details.sessions.forEach((session) => {
          notes.push({
            id: `session-${details.id}-${session.id}`,
            title: `${details.name} - ${session.date}`,
            therapyType: details.therapyType || "General",
            date: session.date,
            tags: [session.type, session.status],
            content: { insights: [session.notes] },
          });
        });
      }
    }
  });
  return notes;
}

// Helper to group notes by client
function groupNotesByClient(clientsData) {
  const grouped = [];
  if (!clientsData.clients) return grouped;
  clientsData.clients.forEach((client) => {
    const details = clientsData.clientDetails?.[client.id];
    if (details) {
      const clientNotes = [];
      if (details.notes) {
        clientNotes.push({
          id: `client-${details.id}`,
          title: `Summary: ${details.name}`,
          therapyType: details.therapyType || "General",
          date: details.lastSession || details.startDate || "",
          tags: details.primaryConcerns ? details.primaryConcerns.split(", ") : [],
          content: { insights: [details.notes] },
        });
      }
      if (details.sessions) {
        details.sessions.forEach((session) => {
          clientNotes.push({
            id: `session-${details.id}-${session.id}`,
            title: `${details.name} - ${session.date}`,
            therapyType: details.therapyType || "General",
            date: session.date,
            tags: [session.type, session.status],
            content: { insights: [session.notes] },
          });
        });
      }
      grouped.push({
        id: details.id,
        name: details.name,
        therapyType: details.therapyType,
        notes: clientNotes,
      });
    }
  });
  return grouped;
}

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchInputRef = useRef<HTMLInputElement>(null);
  const groupedClients = groupNotesByClient(clientsData);

  // Collect all unique tags from all notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    groupedClients.forEach(client => {
      client.notes.forEach(note => {
        if (note.tags) note.tags.forEach((tag: string) => tagsSet.add(tag));
      });
    });
    return Array.from(tagsSet).sort();
  }, [groupedClients]);

  // Filter notes by active tags
  function filterNotesByTags(notes: any[]) {
    if (!activeTags.length) return notes;
    return notes.filter(note => note.tags && activeTags.every(tag => note.tags.includes(tag)));
  }

  useEffect(() => {
    if (filterDialogOpen && tagSearchInputRef.current) {
      tagSearchInputRef.current.focus();
    }
  }, [filterDialogOpen]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return allTags;
    return allTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()));
  }, [allTags, tagSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray mb-1 tracking-tight">Clinical Notes</h1>
          <p className="text-gray-500 text-base">Access and manage your therapy session notes and clinical reports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[220px] sm:w-[300px] bg-white/80 border border-gray-200 focus:border-therapy-purple"
            />
          </div>
          <Button
            className="bg-therapy-purple hover:bg-therapy-purpleDeep text-white font-semibold shadow-sm"
            onClick={() => setFilterDialogOpen(true)}
          >
            <Tag className="h-4 w-4 mr-2" />
            Filter Tags
          </Button>
          <Button className="bg-therapy-blue hover:bg-therapy-blue/90 text-white font-semibold shadow-sm">
            <FilePlus2 className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeTags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-therapy-blue/10 text-therapy-blue px-2 py-1 rounded-full font-medium border border-therapy-blue/20">
              {tag}
              <button
                className="ml-1 text-therapy-purple hover:text-red-500 focus:outline-none"
                onClick={() => setActiveTags(activeTags.filter(t => t !== tag))}
                aria-label={`Remove filter ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            className="text-xs text-gray-500 underline ml-2"
            onClick={() => setActiveTags([])}
          >
            Clear All
          </button>
        </div>
      )}
      <div className="space-y-8">
        {groupedClients.map((client) => (
          <ClientNotesSection
            key={client.id}
            client={{ ...client, notes: filterNotesByTags(client.notes) }}
            searchQuery={searchQuery}
          />
        ))}
      </div>
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-xs rounded-xl shadow-xl border border-therapy-purple/20 bg-white px-3 py-2">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-base font-bold text-therapy-purple mb-1">Filter by Tags</DialogTitle>
          </DialogHeader>
          <input
            ref={tagSearchInputRef}
            type="text"
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-therapy-purple text-xs"
            aria-label="Search tags"
          />
          <div className="border-b border-gray-100 mb-2" />
          <div className="flex items-center justify-between mb-1">
            <button
              className="text-xs font-semibold text-therapy-purple hover:underline focus:outline-none px-1 py-0.5"
              onClick={() => setActiveTags(filteredTags)}
              disabled={filteredTags.length === 0}
              type="button"
            >
              Select All
            </button>
            <button
              className="text-xs font-semibold text-gray-500 hover:underline focus:outline-none px-1 py-0.5"
              onClick={() => setActiveTags([])}
              disabled={activeTags.length === 0}
              type="button"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-col gap-1 mb-2 min-h-[24px] max-h-44 overflow-y-auto pr-1">
            {filteredTags.length === 0 ? (
              <span className="text-xs text-gray-400 px-2">No tags found.</span>
            ) : (
              filteredTags.map(tag => {
                const checked = activeTags.includes(tag);
                return (
                  <label
                    key={tag}
                    className={`flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer transition-all select-none text-therapy-purple text-xs font-semibold
                      ${checked ? 'bg-therapy-purple/20 scale-[1.03] shadow-sm' : 'hover:bg-therapy-blue/10 hover:scale-[1.01]'}
                    `}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveTags(checked ? activeTags.filter(t => t !== tag) : [...activeTags, tag]); }}
                    style={{ minHeight: 28 }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setActiveTags(checked ? activeTags.filter(t => t !== tag) : [...activeTags, tag])}
                      className="accent-therapy-purple w-4 h-4 rounded-full focus:ring-therapy-purple transition-all shadow-sm border border-gray-200"
                      style={{ minWidth: 16, minHeight: 16 }}
                    />
                    <span className="font-semibold text-therapy-purple text-xs leading-tight">{tag}</span>
                  </label>
                );
              })
            )}
          </div>
          <div className="sticky bottom-2 left-0 w-full bg-white pt-2 pb-1 z-10">
            <Button
              onClick={() => setFilterDialogOpen(false)}
              className="bg-therapy-purple text-white hover:bg-therapy-blue w-full py-2 text-sm font-bold shadow-md rounded-full transition-all"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
