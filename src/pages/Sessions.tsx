import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionService } from "@/services/SessionService";
import { ClientService, ClientWithProfile } from "@/services/ClientService";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Edit, Play, StickyNote, Plus, Search, User, Clock, MessageCircle, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Sessions = () => {
  const { user } = useAuth();
  const sessionService = new SessionService();
  const clientService = new ClientService();
  
  const [isNewSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState("all");
  const [editSession, setEditSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- Schedule New Session validation ---
  const [newSession, setNewSession] = useState({ client: '', date: '', time: '', type: '' });
  const isScheduleDisabled = !newSession.client || !newSession.date || !newSession.time || !newSession.type;

  // Fetch sessions and clients when component loads
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch clients first
        const { data: clientsData, error: clientsError } = await clientService.getClientsWithProfiles(user.id);
        
        if (clientsError) {
          setError(clientsError.message);
          toast.error("Failed to load clients");
          return;
        }
        
        setClients(clientsData || []);
        
        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await sessionService.getSessionsByTherapist(user.id);
        
        if (sessionsError) {
          setError(sessionsError.message);
          toast.error("Failed to load sessions");
          return;
        }
        
        setSessions(sessionsData || []);
      } catch (err: any) {
        setError(err.message);
        toast.error("An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleNewSession = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create sessions");
      return;
    }
    
    try {
      // Format the data according to the expected structure in SessionService
      const sessionData = {
        client_id: newSession.client,
        therapist_id: user.id,
        session_date: `${newSession.date}T${newSession.time}:00`,
        duration_minutes: 50, // Default session length
        session_type: newSession.type as "In-person" | "Virtual",
        status: 'Scheduled' as "Scheduled" | "Completed" | "Canceled" | "No-show"
      };
      
      const { data, error } = await sessionService.create(sessionData);
      
      if (error) {
        toast.error("Failed to create session");
        return;
      }
      
      if (data) {
        toast.success("Session scheduled successfully");
        setSessions([data, ...sessions]);
        setNewSessionDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule session");
    }
  };

  const handleEditSessionSave = async (updatedSessionData: any) => {
    if (!editSession?.id) return;
    
    try {
      const { data, error } = await sessionService.update(editSession.id, updatedSessionData);
      
      if (error) {
        toast.error("Failed to update session");
        return;
      }
      
      if (data) {
        toast.success("Session updated successfully");
        setSessions(sessions.map(s => s.id === editSession.id ? data : s));
        setEditSession(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update session");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-2 sm:px-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-therapy-gray mb-1">Sessions</h1>
          <p className="text-base sm:text-lg text-gray-600">Manage your therapy sessions</p>
        </div>
        <Dialog open={isNewSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-6 py-3 text-base font-semibold shadow-md flex items-center gap-2 w-full md:w-auto">
              <Plus className="h-5 w-5" />
              Schedule New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-therapy-purple mb-2 tracking-tight">Schedule New Session</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mb-6">
                Create a new therapy session. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNewSession} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client" className="text-base font-semibold text-therapy-purple">Client</Label>
                  <Select value={newSession.client} onValueChange={v => setNewSession({ ...newSession, client: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map(session => (
                        <SelectItem key={session.clientId} value={session.clientId}>
                          {session.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date" className="text-base font-semibold text-therapy-purple">Date</Label>
                  <Input id="date" type="date" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time" className="text-base font-semibold text-therapy-purple">Time</Label>
                  <Input id="time" type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type" className="text-base font-semibold text-therapy-purple">Type</Label>
                  <Select value={newSession.type} onValueChange={v => setNewSession({ ...newSession, type: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setNewSessionDialogOpen(false)} className="rounded-full px-8 py-3 text-lg">Cancel</Button>
                <Button type="submit" className="bg-therapy-purple hover:bg-therapy-purpleDeep text-lg px-10 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2" disabled={isScheduleDisabled}>
                  Schedule Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls Card */}
      <Card className="shadow-lg rounded-2xl border border-gray-200 mb-2">
        <CardContent className="py-6 px-2 sm:px-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative grow w-full md:w-auto">
            <Input
              placeholder="Search sessions..."
              className="pl-10 rounded-full h-12 text-base shadow-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger className="w-full sm:w-[150px] rounded-full h-12 text-base">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in-person">In-person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-therapy-purple mb-4" />
          <p className="text-lg text-gray-600">Loading sessions...</p>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4 bg-gray-100 rounded-lg flex flex-wrap">
            <TabsTrigger value="upcoming" className="rounded-l-lg text-base font-semibold">Upcoming</TabsTrigger>
            <TabsTrigger value="today" className="text-base font-semibold">Today</TabsTrigger>
            <TabsTrigger value="completed" className="text-base font-semibold">Completed</TabsTrigger>
            <TabsTrigger value="all" className="rounded-r-lg text-base font-semibold">All Sessions</TabsTrigger>
          </TabsList>
          {['upcoming', 'today', 'completed', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-2">
            <Card className="shadow-lg rounded-2xl border border-gray-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 text-base text-therapy-gray font-semibold">Client</th>
                        <th className="text-left p-4 text-base text-therapy-gray font-semibold">Date</th>
                        <th className="text-left p-4 text-base text-therapy-gray font-semibold">Time</th>
                        <th className="text-left p-4 text-base text-therapy-gray font-semibold">Type</th>
                        <th className="text-left p-4 text-base text-therapy-gray font-semibold">Status</th>
                        <th className="text-right p-4 text-base text-therapy-gray font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions
                        .filter(session => 
                          (tab === "all" || 
                           (tab === "upcoming" && session.status === "Upcoming") ||
                           (tab === "today" && session.status === "Today") ||
                           (tab === "completed" && session.status === "Completed")) &&
                          (sessionType === "all" || session.type.toLowerCase() === sessionType) &&
                          (searchQuery === "" || 
                           session.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.time?.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((session) => (
                        <tr key={session.id} className="border-b hover:bg-gray-100 transition-all">
                          <td className="p-4">
                            <Link to={`/therapist/clients/${session.clientId}`} className="font-semibold text-therapy-purple hover:underline">
                              {session.clientName}
                            </Link>
                          </td>
                          <td className="p-4 font-medium text-therapy-gray">{session.date}</td>
                          <td className="p-4 font-medium text-therapy-gray">{session.time}</td>
                          <td className="p-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                              {session.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              session.status === "Completed" ? "bg-green-100 text-green-800" :
                              session.status === "Today" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex flex-row items-center justify-end gap-2 whitespace-nowrap">
                              {session.status === "Completed" ? (
                                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold" onClick={() => navigate(`/therapist/notes/${session.clientId}`)}>
                                  <StickyNote className="h-4 w-4" />
                                  View Notes
                                </Button>
                              ) : (
                                <>
                                  <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold" onClick={() => setEditSession(session)}>
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white" onClick={() => navigate('/therapist/insights')}>
                                    <Play className="h-4 w-4" />
                                    Start
                                  </Button>
                                </>
                              )}
                              <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-full flex items-center gap-2 font-semibold text-white" onClick={() => setDeleteSessionId(session.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {sessions.filter(session => 
                        tab === "all" || 
                        (tab === "upcoming" && session.status === "Upcoming") ||
                        (tab === "today" && session.status === "Today") ||
                        (tab === "completed" && session.status === "Completed")
                      ).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No {tab} sessions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        </Tabs>
      )}

      {/* Edit Session Dialog */}
      {editSession && (
        <Dialog open={!!editSession} onOpenChange={v => { if (!v) setEditSession(null); }}>
          <DialogContent className="sm:max-w-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-therapy-purple mb-2 tracking-tight">Edit Session</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mb-6">
                Change the date, time, type, or status of this session.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={() => handleEditSessionSave(editSession)} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date" className="text-base font-semibold text-therapy-purple">Date</Label>
                  <Input id="date" name="date" type="date" value={editSession.date} onChange={e => setEditSession({ ...editSession, date: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time" className="text-base font-semibold text-therapy-purple">Time</Label>
                  <Input id="time" name="time" type="time" value={editSession.time} onChange={e => setEditSession({ ...editSession, time: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type" className="text-base font-semibold text-therapy-purple">Type</Label>
                  <Select value={editSession.type} onValueChange={v => setEditSession({ ...editSession, type: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Session Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="status" className="text-base font-semibold text-therapy-purple">Status</Label>
                  <Select value={editSession.status} onValueChange={v => setEditSession({ ...editSession, status: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setEditSession(null)} className="rounded-full px-8 py-3 text-lg">Cancel</Button>
                <Button type="submit" className="bg-therapy-purple hover:bg-therapy-purpleDeep text-lg px-10 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="text-xl font-bold text-gray-800 mb-2">Delete Session?</div>
            <div className="text-gray-500 mb-6 text-center">Are you sure you want to delete this session? This action cannot be undone.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button type="button" variant="outline" onClick={() => setDeleteSessionId(null)} className="rounded-full px-6 py-2">Cancel</Button>
              <Button type="button" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all duration-200" onClick={() => { setSessions(sessions.filter(s => s.id !== deleteSessionId)); setDeleteSessionId(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
