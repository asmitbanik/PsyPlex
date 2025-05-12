import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Search, Tag, Calendar, FilePlus2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClinicalNote } from "@/types/notes";
import { format } from "date-fns";

const NotesGrid = ({ notes }: { notes: ClinicalNote[] }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl border border-gray-100 bg-white/90">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-therapy-gray truncate">
                {note.title}
              </CardTitle>
              <span className="text-xs bg-therapy-purple/10 text-therapy-purple px-2 py-1 rounded-full font-medium">
                {note.therapyType}
              </span>
            </div>
            <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {format(new Date(note.date), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-therapy-blue/10 text-therapy-blue px-2 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const notes: ClinicalNote[] = []; // This will be populated from your data storage

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.insights.toString().toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && note.therapyType.toLowerCase() === activeTab;
  });

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
          <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep text-white font-semibold shadow-sm">
            <Tag className="h-4 w-4 mr-2" />
            Filter Tags
          </Button>
          <Button className="bg-therapy-blue hover:bg-therapy-blue/90 text-white font-semibold shadow-sm">
            <FilePlus2 className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-muted mb-8 rounded-lg p-1 flex gap-2">
          <TabsTrigger value="all" className="text-base rounded-md px-4 py-2 data-[state=active]:bg-therapy-purple data-[state=active]:text-white">All Notes</TabsTrigger>
          <TabsTrigger value="cbt" className="text-base rounded-md px-4 py-2 data-[state=active]:bg-therapy-purple data-[state=active]:text-white">CBT</TabsTrigger>
          <TabsTrigger value="dbt" className="text-base rounded-md px-4 py-2 data-[state=active]:bg-therapy-purple data-[state=active]:text-white">DBT</TabsTrigger>
          <TabsTrigger value="psychodynamic" className="text-base rounded-md px-4 py-2 data-[state=active]:bg-therapy-purple data-[state=active]:text-white">Psychodynamic</TabsTrigger>
          <TabsTrigger value="emdr" className="text-base rounded-md px-4 py-2 data-[state=active]:bg-therapy-purple data-[state=active]:text-white">EMDR</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <NotesGrid notes={filteredNotes} />
        </TabsContent>
        {["cbt", "dbt", "psychodynamic", "emdr"].map((therapy) => (
          <TabsContent key={therapy} value={therapy} className="mt-0">
            <NotesGrid
              notes={filteredNotes.filter(
                (note) => note.therapyType.toLowerCase() === therapy
              )}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Notes;
