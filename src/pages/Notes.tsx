import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Search, Tag, Calendar, FilePlus2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClinicalNote } from "@/types/notes";
import { format } from "date-fns";
import clientsData from "@/data/clientsData.json";
import ClientNotesSection from "../components/ClientNotesSection";
import NotesGrid from "@/components/NotesGrid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import SaveNoteDialog from "@/components/SaveNoteDialog";

// Helper to transform client sessions into ClinicalNote objects
function extractNotesFromClients(clientsData: any): ClinicalNote[] { // Added type for clarity
  const notes: ClinicalNote[] = [];
  if (!clientsData.clients) return notes;
  clientsData.clients.forEach((client: any) => {
    const details = clientsData.clientDetails?.[client.id];
    if (details) {
      if (details.notes) {
        notes.push({
          id: `client-${details.id}`,
          title: `Summary: ${details.name}`,
          therapyType: details.therapyType || "General",
          date: details.lastSession || details.startDate || "",
          tags: details.primaryConcerns ? details.primaryConcerns.split(", ") : [],
          content: { insights: [details.notes], recommendations: { nextSession: [], homework: [] } }, // Added default recommendations
          clientId: details.id, // Associate with client
        });
      }
      if (details.sessions) {
        details.sessions.forEach((session: any) => {
          notes.push({
            id: `session-${details.id}-${session.id}`,
            title: `${details.name} - ${session.date}`,
            therapyType: details.therapyType || "General",
            date: session.date,
            tags: [session.type, session.status].filter(Boolean) as string[], // Ensure tags are strings and filter out undefined/null
            content: { insights: [session.notes], recommendations: { nextSession: [], homework: [] } }, // Added default recommendations
            clientId: details.id, // Associate with client
          });
        });
      }
    }
  });
  return notes;
}

// Helper to group notes by client
interface GroupedClient {
  id: string;
  name: string;
  therapyType?: string;
  notes: ClinicalNote[];
}
function groupNotesByClient(clientsData: any): GroupedClient[] {
  const grouped: GroupedClient[] = [];
  if (!clientsData.clients) return grouped;
  clientsData.clients.forEach((client: any) => {
    const details = clientsData.clientDetails?.[client.id];
    if (details) {
      const clientNotes: ClinicalNote[] = [];
      if (details.notes) {
        clientNotes.push({
          id: `client-${details.id}`,
          title: `Summary: ${details.name}`,
          therapyType: details.therapyType || "General",
          date: details.lastSession || details.startDate || "",
          tags: details.primaryConcerns ? details.primaryConcerns.split(", ") : [],
          content: { insights: [details.notes], recommendations: { nextSession: [], homework: [] } },
          clientId: details.id,
        });
      }
      if (details.sessions) {
        details.sessions.forEach((session: any) => {
          clientNotes.push({
            id: `session-${details.id}-${session.id}`,
            title: `${details.name} - ${session.date}`,
            therapyType: details.therapyType || "General",
            date: session.date,
            tags: [session.type, session.status].filter(Boolean) as string[],
            content: { insights: [session.notes], recommendations: { nextSession: [], homework: [] } },
            clientId: details.id,
          });
        });
      }
      if (clientNotes.length > 0) { // Only add client if they have notes
        grouped.push({
          id: details.id,
          name: details.name,
          therapyType: details.therapyType,
          notes: clientNotes,
        });
      }
    }
  });
  return grouped;
}

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // const [activeTab, setActiveTab] = useState("all"); // This state seems unused, consider removing.
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchInputRef = useRef<HTMLInputElement>(null);

  const [isSaveNoteDialogOpen, setIsSaveNoteDialogOpen] = useState(false);
  const [manualNotes, setManualNotes] = useState<ClinicalNote[]>([]);

  const clientNotesData = useMemo(() => extractNotesFromClients(clientsData), []);
  const groupedClientsData = useMemo(() => groupNotesByClient(clientsData), []);

  // Prepare a simple list of clients for the SaveNoteDialog
  const simpleClientList = useMemo(() => {
    if (!clientsData.clients) return [];
    return clientsData.clients.map((client: any) => ({ id: client.id, name: client.name }));
  }, []);

  const combinedAllNotesForTags = useMemo(() => {
    return [...clientNotesData, ...manualNotes];
  }, [clientNotesData, manualNotes]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    combinedAllNotesForTags.forEach(note => {
      if (note.tags) note.tags.forEach((tag: string) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [combinedAllNotesForTags]);

  const filterNotesByTags = useCallback((notesToFilter: ClinicalNote[]) => {
    if (!activeTags.length) return notesToFilter;
    return notesToFilter.filter(note => note.tags && activeTags.every(tag => note.tags.includes(tag)));
  }, [activeTags]);

  useEffect(() => {
    if (filterDialogOpen && tagSearchInputRef.current) {
      tagSearchInputRef.current.focus();
    }
  }, [filterDialogOpen]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return allTags;
    return allTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()));
  }, [allTags, tagSearch]);

  const handleSaveNewNote = (noteData: { title: string; tags: string[]; content: string; therapyType: string; clientId?: string }) => {
    const newNote: ClinicalNote = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: noteData.title,
      date: format(new Date(), "yyyy-MM-dd"),
      therapyType: noteData.therapyType || "General Note",
      tags: noteData.tags,
      content: {
        insights: [noteData.content],
        recommendations: { nextSession: [], homework: [] },
      },
      clientId: noteData.clientId === "NO_CLIENT_SELECTED_VALUE" ? undefined : noteData.clientId, // Handle 'no client' option
    };
    setManualNotes(prevNotes => [newNote, ...prevNotes]);
    setIsSaveNoteDialogOpen(false);
  };

  const applySearchFilter = useCallback((notesToFilter: ClinicalNote[], currentSearchQuery: string) => {
    if (!currentSearchQuery) return notesToFilter;
    const lowerSearchQuery = currentSearchQuery.toLowerCase();
    return notesToFilter.filter(note =>
      note.title.toLowerCase().includes(lowerSearchQuery) ||
      (note.content.insights && typeof note.content.insights[0] === 'string' && note.content.insights[0].toLowerCase().includes(lowerSearchQuery)) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerSearchQuery))
    );
  }, []);

  const filteredManualNotes = useMemo(() => {
    let notes = filterNotesByTags(manualNotes);
    notes = applySearchFilter(notes, searchQuery);
    return notes;
  }, [manualNotes, filterNotesByTags, applySearchFilter, searchQuery]);

  const clientSectionsToRenderData = useMemo(() => {
    return groupedClientsData.map(client => {
      let notesForClient = filterNotesByTags(client.notes);
      notesForClient = applySearchFilter(notesForClient, searchQuery);
      return { ...client, notes: notesForClient };
    });
  }, [groupedClientsData, filterNotesByTags, applySearchFilter, searchQuery]);

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
          <Button
            className="bg-therapy-blue hover:bg-therapy-blue/90 text-white font-semibold shadow-sm"
            onClick={() => setIsSaveNoteDialogOpen(true)}
          >
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
        {filteredManualNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-therapy-gray">My Notes</CardTitle>
              <CardDescription>Notes you have added manually. These are not associated with a specific client unless specified.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotesGrid notes={filteredManualNotes} />
            </CardContent>
          </Card>
        )}

        {clientSectionsToRenderData.map((clientData) => {
          // Only render the section if there are notes to display OR if there are no filters/search and the client originally had notes.
          const originalClient = groupedClientsData.find(c => c.id === clientData.id);
          const hasOriginalNotes = originalClient && originalClient.notes.length > 0;

          if (clientData.notes.length > 0) {
            return (
              <ClientNotesSection
                key={clientData.id}
                client={clientData}
                searchQuery={searchQuery}
              />
            );
          } else if (hasOriginalNotes && !searchQuery && activeTags.length === 0) {
            // If client had notes, but they are all filtered out by search/tags, still show the client section header
            // Or, decide to hide it entirely if preferred.
            // For now, we are hiding it if notes array is empty after filtering.
            return null; // Or a placeholder like <p>{clientData.name} has notes, but they are filtered out.</p>
          }
          return null;
        })}

        {filteredManualNotes.length === 0 && clientSectionsToRenderData.every(c => c.notes.length === 0) && (
           <div className="text-center py-10">
              <ScrollText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new note or adjusting your filters.</p>
            </div>
        )}
      </div>

      {/* Filter by Tags Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-md w-[360px] rounded-lg shadow-xl border-none bg-white p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
          <DialogHeader className="px-6 pt-5 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-800">Filter by Tags</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setFilterDialogOpen(false)} className="rounded-full h-7 w-7">
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </DialogHeader>
          <div className="px-6 pb-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={tagSearchInputRef}
                type="text"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full pl-10 pr-3 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-therapy-purple/50 focus:border-therapy-purple/80 text-sm bg-gray-50"
                aria-label="Search tags"
              />
            </div>
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                className="text-xs font-medium text-therapy-purple hover:underline focus:outline-none"
                onClick={() => setActiveTags(filteredTags.map(tag => tag))}
                disabled={filteredTags.length === 0}
                type="button"
              >
                Select All
              </button>
              <button
                className="text-xs font-medium text-gray-500 hover:underline focus:outline-none"
                onClick={() => setActiveTags([])}
                disabled={activeTags.length === 0}
                type="button"
              >
                Clear All
              </button>
            </div>
            <ScrollArea className="h-[200px] mb-4 pr-3">
              <div className="flex flex-col gap-1">
                {filteredTags.length === 0 ? (
                  <span className="text-sm text-gray-400 px-2 py-4 text-center">No tags found.</span>
                ) : (
                  filteredTags.map(tag => {
                    const checked = activeTags.includes(tag);
                    return (
                      <label
                        key={tag}
                        className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all select-none text-sm font-medium
                          ${checked ? 'bg-therapy-purple/10 text-therapy-purple' : 'text-gray-700 hover:bg-gray-100'}
                        `}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setActiveTags(checked ? activeTags.filter(t => t !== tag) : [...activeTags, tag]); }}
                      >
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={checked}
                          onCheckedChange={() => setActiveTags(checked ? activeTags.filter(t => t !== tag) : [...activeTags, tag])}
                          className={`data-[state=checked]:bg-therapy-purple data-[state=checked]:border-therapy-purple border-gray-400 focus-visible:ring-therapy-purple/50`}
                        />
                        <span className="leading-tight">{tag}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="px-6 pb-5 pt-0 border-t-0 bg-transparent sm:justify-center">
            <Button
              onClick={() => setFilterDialogOpen(false)}
              className="bg-therapy-purple text-white hover:bg-therapy-purple/90 w-full h-11 py-2 text-sm font-semibold shadow-md rounded-lg transition-all duration-150 focus-visible:ring-therapy-purple/50"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Note Dialog */}
      <SaveNoteDialog
        isOpen={isSaveNoteDialogOpen}
        onClose={() => setIsSaveNoteDialogOpen(false)}
        onSave={handleSaveNewNote}
        clients={simpleClientList} // Pass the client list
        // initialData can be used here for editing existing notes in the future
      />
    </div>
  );
};

export default Notes;
