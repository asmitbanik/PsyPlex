import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Search, Tag, Calendar, FilePlus2, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClinicalNote } from "@/types/notes";
import { format } from "date-fns";
import ClientNotesSection from "../components/ClientNotesSection";
import NotesGrid from "@/components/NotesGrid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import SaveNoteDialog from "@/components/SaveNoteDialog";
import { NotesService, Note } from "@/services/notesService";
import { ClientService, ClientWithProfile } from "@/services/ClientService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Helper to convert Note from NotesService to ClinicalNote for UI display
function convertToUiNote(note: Note): ClinicalNote {
  // Ensure content has the expected structure
  const content = note.content || { insights: [] };
  
  // Make sure recommendations is always defined
  if (!content.recommendations) {
    content.recommendations = {
      nextSession: content.nextSession || [],
      homework: content.homework || []
    };
  }
  
  return {
    id: note.id || '',
    title: note.title,
    therapyType: note.therapyType || 'General',
    date: note.date || note.created_at || new Date().toISOString(),
    tags: note.tags || [],
    content: content,
    clientId: note.clientId
  };
}

// Helper to group notes by client
interface GroupedClient {
  id: string;
  name: string;
  therapyType: string;
  notes: ClinicalNote[];
}

// Group notes by client ID
function groupNotesByClient(notes: ClinicalNote[], clients: ClientWithProfile[]): GroupedClient[] {
  const clientMap = new Map<string, GroupedClient>();
  
  // First, create entries for each client (even those without notes)
  clients.forEach(client => {
    const fullName = client.profile ? 
      `${client.profile.first_name || ''} ${client.profile.last_name || ''}`.trim() : 
      `${client.first_name || ''} ${client.last_name || ''}`.trim();
    
    clientMap.set(client.id, {
      id: client.id,
      name: fullName || 'Client',
      therapyType: client.profile?.therapy_type || 'General',
      notes: []
    });
  });

  // Then add notes to their respective clients
  notes.forEach(note => {
    if (note.clientId && clientMap.has(note.clientId)) {
      const client = clientMap.get(note.clientId)!;
      client.notes.push(note);
    }
  });

  // Convert map to array and remove clients with no notes if needed
  return Array.from(clientMap.values())
    .filter(client => client.notes.length > 0);
}

const Notes = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagSearchInputRef = useRef<HTMLInputElement>(null);
  const [isSaveNoteDialogOpen, setIsSaveNoteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Services
  const notesService = new NotesService();
  const clientService = new ClientService();

  // State for real data
  const [allNotes, setAllNotes] = useState<ClinicalNote[]>([]);
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [clientsWithNotes, setClientsWithNotes] = useState<GroupedClient[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      
      try {
        // Fetch clients
        const { data: clientsData, error: clientsError } = await clientService.getClientsWithProfiles(user.id);
        
        if (clientsError) {
          setError(clientsError.message);
          toast.error("Failed to load clients");
          return;
        }
        
        setClients(clientsData || []);
        
        // Fetch notes
        const { data: notesData, error: notesError } = await notesService.getNotesByTherapist(user.id);
        
        if (notesError) {
          setError(notesError.message);
          toast.error("Failed to load notes");
          return;
        }
        
        // Convert to UI format
        const uiNotes = (notesData || []).map(note => convertToUiNote(note));
        setAllNotes(uiNotes);
        
        // Group by client
        const grouped = groupNotesByClient(uiNotes, clientsData || []);
        setClientsWithNotes(grouped);
      } catch (err: any) {
        setError(err.message);
        toast.error("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Extract all unique tags for filtering
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allNotes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allNotes]);

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!tagSearch) return allTags;
    return allTags.filter(tag => 
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [allTags, tagSearch]);

  // Filter notes based on search text and active tags
  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      // Filter by search text
      const matchesSearch = searchText.trim() === "" || 
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (note.content?.insights || []).some(insight => 
          typeof insight === 'string' && insight.toLowerCase().includes(searchText.toLowerCase())
        );
      
      // Filter by active tags
      const matchesTags = activeTags.length === 0 || 
        activeTags.some(tag => (note.tags || []).includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [allNotes, searchText, activeTags]);

  // Build simple client list for the SaveNoteDialog
  const simpleClientList = useMemo(() => {
    return clients.map(client => ({
      id: client.id,
      name: client.profile 
        ? `${client.profile.first_name || ''} ${client.profile.last_name || ''}`.trim() 
        : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client',
      therapyType: client.profile?.therapy_type || 'General'
    }));
  }, [clients]);

  // Handle saving a new note to Supabase
  const handleSaveNewNote = async (noteData: { title: string; tags: string[]; content: string; therapyType: string; clientId?: string }) => {
    if (!user?.id) {
      toast.error("You must be logged in to create notes");
      return;
    }
    
    if (!noteData.title || !noteData.content) {
      toast.error("Title and content are required");
      return;
    }

    if (!noteData.clientId) {
      toast.error("You must select a client");
      return;
    }

    try {
      console.log("Saving note with client ID:", noteData.clientId);
      
      // Format for the database - split content into paragraphs to be handled as insights
      const insights = noteData.content.split('\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);
      
      const newNote: Note = {
        title: noteData.title,
        therapyType: noteData.therapyType || 'General',
        content: {
          insights: insights.length > 0 ? insights : [noteData.content],
          recommendations: {
            nextSession: [],
            homework: []
          }
        },
        tags: noteData.tags || [],
        clientId: noteData.clientId,
        therapistId: user.id
      };
      
      // For debugging
      console.log("Saving note with data:", JSON.stringify(newNote, null, 2));
      
      const { data, error } = await notesService.saveNote(newNote, user.id);
      
      if (error) {
        toast.error("Failed to save note: " + (error.message || "Unknown error"));
        console.error("Error saving note:", error);
        return;
      }
      
      // Close dialog
      setIsSaveNoteDialogOpen(false);
      
      // Add to the UI
      if (data) {
        const uiNote = convertToUiNote(data);
        setAllNotes(prev => [uiNote, ...prev]);
        
        // Update clients with notes
        if (data.clientId) {
          setClientsWithNotes(prev => {
            const newGrouped = [...prev];
            const clientGroup = newGrouped.find(c => c.id === data.clientId);
            
            if (clientGroup) {
              // Add to existing client group
              clientGroup.notes.push(uiNote);
            } else {
              // Create new client group if needed
              const client = clients.find(c => c.id === data.clientId);
              if (client) {
                const fullName = client.profile 
                  ? `${client.profile.first_name || ''} ${client.profile.last_name || ''}`.trim() 
                  : `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client';
                
                newGrouped.push({
                  id: client.id,
                  name: fullName,
                  therapyType: client.profile?.therapy_type || 'General',
                  notes: [uiNote]
                });
              }
            }
            return newGrouped;
          });
        }
        
        toast.success("Note saved successfully");
      }
    } catch (err: any) {
      toast.error("An error occurred while saving the note");
      console.error("Error saving note:", err);
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = async (noteId: string) => {
    if (!user?.id || !noteId) return;
    
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        const { data, error } = await notesService.deleteNote(noteId);
        
        if (error) {
          toast.error("Failed to delete note");
          return;
        }
        
        // Remove from UI
        setAllNotes(prev => prev.filter(note => note.id !== noteId));
        
        // Update client groups
        setClientsWithNotes(prev => {
          const newGrouped = prev.map(group => ({
            ...group,
            notes: group.notes.filter(note => note.id !== noteId)
          })).filter(group => group.notes.length > 0);
          
          return newGrouped;
        });
        
        toast.success("Note deleted successfully");
      } catch (err: any) {
        toast.error("An error occurred while deleting the note");
        console.error("Error deleting note:", err);
      }
    }
  };

  useEffect(() => {
    if (filterDialogOpen && tagSearchInputRef.current) {
      tagSearchInputRef.current.focus();
    }
  }, [filterDialogOpen]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-therapy-purple" />
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="text-red-500 text-lg">Error: {error}</div>
        <Button onClick={() => window.location.reload()} className="bg-therapy-purple hover:bg-therapy-purpleDeep">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-therapy-gray">Therapy Notes</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-[220px] sm:w-[300px] bg-white/80 border border-gray-200 focus:border-therapy-purple"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border border-gray-200 hover:bg-therapy-purple/10"
            onClick={() => setFilterDialogOpen(true)}
          >
            <Tag className="h-4 w-4" />
            <span className="sr-only">Filter by tag</span>
          </Button>
          <Button
            onClick={() => setIsSaveNoteDialogOpen(true)}
            className="bg-therapy-purple hover:bg-therapy-purple/90 text-white"
          >
            <FilePlus2 className="h-4 w-4 mr-2" />
            <span>New Note</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger
              value="all"
              className={`${activeTab === 'all' ? 'bg-therapy-purple text-white' : 'hover:bg-gray-100 hover:text-therapy-purple'} py-3 text-sm font-semibold transition-all duration-100 rounded-lg`}
              onClick={() => setActiveTab("all")}
            >
              <ScrollText className="mr-2 h-4 w-4" />
              All Notes {allNotes.length > 0 && `(${allNotes.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="by-client"
              className={`${activeTab === 'by-client' ? 'bg-therapy-purple text-white' : 'hover:bg-gray-100 hover:text-therapy-purple'} py-3 text-sm font-semibold transition-all duration-100 rounded-lg`}
              onClick={() => setActiveTab("by-client")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              By Client {clientsWithNotes.length > 0 && `(${clientsWithNotes.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          {filteredNotes.length > 0 ? (
            <NotesGrid 
              notes={filteredNotes} 
              onDeleteNote={handleDeleteNote}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No notes found</p>
              <Button 
                onClick={() => setIsSaveNoteDialogOpen(true)}
                className="bg-therapy-purple hover:bg-therapy-purpleDeep"
              >
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create a note
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-client" className="mt-0">
          {clientsWithNotes.length > 0 ? (
            <ClientNotesSection 
              clients={clientsWithNotes} 
              onDeleteNote={handleDeleteNote}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No client notes found</p>
              <Button 
                onClick={() => setIsSaveNoteDialogOpen(true)}
                className="bg-therapy-purple hover:bg-therapy-purpleDeep"
              >
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create a note
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Filter by Tags</DialogTitle>
            <Button
              variant="outline"
              className="absolute top-3 right-3 h-7 w-7 p-0 hover:bg-gray-100"
              onClick={() => setFilterDialogOpen(false)}
            >
              <X className="h-4 w-4" />
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
