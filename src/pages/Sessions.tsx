import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Edit, Play, StickyNote, Plus, Search, User, Clock, MessageCircle, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
// Direct import of DB operations for better RLS handling
import * as sessionOperations from '@/services/db-operations/sessions';
import * as clientOperations from '@/services/db-operations/clients';
import { Session, SessionInput } from '@/services/db-operations/sessions';
import { ClientWithProfile } from '@/services/db-operations/clients';

// Extended interface for sessions with client data
interface SessionWithDetails extends Session {
  client?: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile?: {
      first_name: string;
      last_name: string;
    };
  };
  session_time?: string; // For backward compatibility
}

// Custom type for UI filtering
type SessionTab = 'upcoming' | 'today' | 'completed' | 'all';
type SessionTypeFilter = 'all' | 'in-person' | 'virtual';

// Session card component for displaying sessions in a grid
interface SessionCardProps {
  clientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  onEdit: () => void;
  onJoin: () => void;
  onDelete: () => void;
}

const SessionCard = ({ clientName, date, time, type, status, onEdit, onJoin, onDelete }: SessionCardProps) => {
  return (
    <Card className="shadow-lg rounded-2xl border border-gray-200">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-therapy-purple">{clientName}</h3>
            <p className="text-sm text-gray-500">{date} at {time}</p>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
            status === "Completed" ? "bg-green-100 text-green-800" :
            status === "Canceled" ? "bg-red-100 text-red-800" :
            status === "No-show" ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
            {type}
          </span>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          {status !== "Completed" && (
            <>
              <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white" onClick={onJoin}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            </>
          )}
          {status === "Completed" && (
            <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold" onClick={onJoin}>
              <StickyNote className="h-4 w-4" />
              View Notes
            </Button>
          )}
          <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-full flex items-center gap-2 font-semibold text-white" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // UI State
  const [isNewSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState<SessionTypeFilter>("all");
  const [activeTab, setActiveTab] = useState<SessionTab>("upcoming");
  
  // Data State
  const [editSession, setEditSession] = useState<SessionWithDetails | null>(null);
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Session Form State
  const [newSession, setNewSession] = useState({ 
    client: '', 
    date: '', 
    time: '', 
    type: 'In-person' as 'In-person' | 'Virtual' 
  });
  
  // Form validation
  const isScheduleDisabled = !newSession.client || !newSession.date || !newSession.time || !newSession.type;

  // Function to fetch clients (defined outside useEffect to be reusable)
  const fetchClients = async () => {
    if (!user?.id) {
      console.error('Cannot fetch clients: No user ID available');
      toast.error("You must be logged in to view clients");
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching clients for therapist ID:', user.id);
      
      // Import auth functions to check current session
      const { supabase } = await import('../lib/supabase');
      const { data: authData } = await supabase.auth.getSession();
      console.log('Current auth session:', authData?.session ? 'Valid' : 'None', 
                'User ID:', authData?.session?.user?.id);
      
      // Fetch clients with profiles
      const { data: clientsData, error: clientsError } = await clientOperations.getClientsWithProfiles(user.id);
      
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        setError(clientsError.message);
        toast.error("Failed to load clients");
        return;
      }
      
      if (clientsData) {
        console.log(`Successfully loaded ${clientsData.length} clients`);
        setClients(clientsData);
      } else {
        console.log('No clients found');
        setClients([]);
      }
    } catch (err: any) {
      console.error('Exception in fetchClients:', err);
      setError(err.message);
      toast.error("An error occurred while loading clients: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch sessions (defined outside useEffect to be reusable)
  const fetchSessions = async () => {
    if (!user?.id) {
      console.error('Cannot fetch sessions: No user ID available');
      toast.error("You must be logged in to view sessions");
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching sessions for therapist ID:', user.id);
      
      // Import auth functions to check current session
      const { supabase } = await import('../lib/supabase');
      const { data: authData } = await supabase.auth.getSession();
      console.log('Current auth session:', authData?.session ? 'Valid' : 'None', 
                'User ID:', authData?.session?.user?.id);
      
      if (!authData?.session?.user?.id) {
        console.warn('No active auth session found while fetching sessions');
      }
      
      // Fetch sessions from the database
      const { data: sessionsData, error: sessionsError } = await sessionOperations.getSessionsByTherapistId(user.id);
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        setError(sessionsError.message);
        toast.error("Failed to load sessions");
        return;
      }
      
      if (!sessionsData || sessionsData.length === 0) {
        console.log('No sessions found');
        setSessions([]);
        return;
      }
      
      console.log(`Successfully loaded ${sessionsData.length} sessions`);
      
      // Process each session to include client details
      const sessionsWithDetails: SessionWithDetails[] = [];
      
      for (const session of sessionsData) {
        const sessionWithDetails: SessionWithDetails = {
          ...session,
          client: undefined,
          // For backward compatibility
          session_time: session.session_date ? new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };

        // Try to fetch client data for this session
        try {
          if (session.client_id) {
            console.log(`Fetching client data for session ${session.id} with client_id: ${session.client_id}`);
            const { data: clientData, error: clientError } = await clientOperations.getClientById(session.client_id);
            
            if (clientError) {
              console.error(`Error fetching client for session ${session.id}:`, clientError);
            }
            
            console.log('Client data returned:', clientData);
            
            if (clientData) {
              console.log(`Found client: ${clientData.first_name} ${clientData.last_name} for session ${session.id}`);
              // Set client data on the session
              sessionWithDetails.client = {
                id: clientData.id,
                email: clientData.email || '',
                first_name: clientData.first_name || '',
                last_name: clientData.last_name || ''
              };
            } else {
              console.warn(`No client data found for client_id: ${session.client_id}`);
            }
          } else {
            console.warn(`Session ${session.id} has no client_id`);
          }
        } catch (clientError) {
          console.error(`Error fetching client data for session ${session.id}:`, clientError);
          // Continue even if we can't fetch client data for a session
        }

        sessionsWithDetails.push(sessionWithDetails);
      }

      setSessions(sessionsWithDetails);
    } catch (err: any) {
      console.error('Exception in fetchSessions:', err);
      setError(err.message);
      toast.error("An error occurred while loading sessions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions and clients when component loads
  useEffect(() => {
    const refreshAndFetch = async () => {
      try {
        // Import supabase directly to ensure fresh auth context
        const { supabase } = await import('../lib/supabase');
        
        // Force session refresh to get fresh tokens before fetching data
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
        } else {
          console.log('Session refreshed successfully, user ID:', refreshData?.session?.user?.id);
        }
        
        // Fetch clients and sessions with refreshed tokens
        await fetchClients();
        await fetchSessions();
      } catch (err) {
        console.error('Error in session refresh or fetch:', err);
      }
    };
    
    refreshAndFetch();
    
    // Set up a timer to refresh data every 30 seconds
    const refreshTimer = setInterval(() => {
      console.log('Auto-refreshing sessions data...');
      fetchSessions();
    }, 30000);
    
    // Clean up the timer when component unmounts
    return () => clearInterval(refreshTimer);
  }, [user?.id]);

  // Handle creating a new session
  const handleNewSession = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to create sessions");
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate client selection
      if (!newSession.client) {
        toast.error("Please select a client for the session");
        return;
      }
      
      console.log('Selected client ID:', newSession.client);
      
      // Double check the client exists
      const selectedClient = clients.find(c => c.id === newSession.client);
      if (!selectedClient) {
        console.error('Selected client not found in clients list:', newSession.client);
        toast.error("Selected client not found. Please select a valid client.");
        return;
      }
      
      console.log('Found selected client:', selectedClient.first_name, selectedClient.last_name);
      
      // Format the data according to the expected structure for DB operations
      const sessionData: SessionInput = {
        client_id: newSession.client,
        therapist_id: user.id, // This will be enforced server-side by RLS
        session_date: `${newSession.date}T${newSession.time}:00`,
        duration_minutes: 50, // Default session length
        session_type: newSession.type,
        status: 'Scheduled'
      };
      
      console.log('Creating session with data:', sessionData);
      
      // Create the session using the operations layer
      const { data: newSessionData, error } = await sessionOperations.createSession(sessionData);
      
      if (error) {
        console.error('Session creation failed:', error);
        toast.error(`Failed to create session: ${error.message}`);
        return;
      }
      
      if (newSessionData) {
        console.log('Session created successfully:', newSessionData);
        console.log('Session client_id:', newSessionData.client_id);
        console.log('Original selected client_id:', newSession.client);
        
        // Verify both client IDs match
        if (newSessionData.client_id !== newSession.client) {
          console.warn('Client ID mismatch!', {
            original: newSession.client,
            returned: newSessionData.client_id
          });
        }
        
        // Get fresh client data directly
        console.log('Getting latest client data for UI...');
        const { data: clientData } = await clientOperations.getClientById(newSessionData.client_id);
        
        // Use the actual client data if available, otherwise use the cached version
        let clientDetails;
        if (clientData) {
          console.log('Retrieved fresh client data:', clientData);
          clientDetails = {
            id: clientData.id,
            email: clientData.email || '',
            first_name: clientData.first_name || '',
            last_name: clientData.last_name || ''
          };
        } else if (selectedClient) {
          console.log('Using cached client data for UI');
          clientDetails = {
            id: selectedClient.id,
            email: selectedClient.email || '',
            first_name: selectedClient.first_name || '',
            last_name: selectedClient.last_name || ''
          };
        } else {
          console.warn('Could not find client data for UI');
        }
        
        // Create a session with details for UI state
        const sessionWithDetails: SessionWithDetails = {
          ...newSessionData,
          client: clientDetails,
          session_time: new Date(newSessionData.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        console.log('Created session with details for UI:', sessionWithDetails);
        console.log('Client details on session:', sessionWithDetails.client);
        
        // Update UI immediately for responsiveness
        setSessions(prevSessions => [sessionWithDetails, ...prevSessions]);
        toast.success("Session scheduled successfully");
        
        // Reset form and close dialog
        setNewSession({ client: '', date: '', time: '', type: 'In-person' });
        setNewSessionDialogOpen(false);
      }
      
      // Also refresh all sessions to ensure server consistency
      console.log('Refreshing sessions from server...');
      await fetchSessions();
    } catch (err: any) {
      console.error('Error in handleNewSession:', err);
      toast.error(err.message || "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  // Handle updating an existing session
  const handleEditSessionSave = async (updatedSessionData: Partial<SessionInput>) => {
    if (!editSession?.id || !user?.id) {
      toast.error("Session information is incomplete");
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Updating session with ID:', editSession.id);
      console.log('Original session data:', editSession);
      console.log('Update data being sent:', updatedSessionData);
      
      // Make sure we have the client_id 
      if (!updatedSessionData.client_id && editSession.client_id) {
        console.log(`Adding client_id ${editSession.client_id} from original session`);
        updatedSessionData.client_id = editSession.client_id;
      }
      
      // Check if we have a valid session date
      if (updatedSessionData.session_date) {
        try {
          // Validate the date format
          const testDate = new Date(updatedSessionData.session_date);
          if (isNaN(testDate.getTime())) {
            console.error('Invalid date format:', updatedSessionData.session_date);
            toast.error("Invalid date format. Please check the date and time.");
            return;
          }
        } catch (e) {
          console.error('Date parsing error:', e);
          toast.error("Invalid date format. Please check the date and time.");
          return;
        }
      }
      
      // We're intentionally NOT setting therapist_id here, as it will be set by the updateSession function
      // which gets the therapist ID from the authenticated user and properly handles RLS
      
      // Update the session using the operations layer
      const { data: updatedSession, error } = await sessionOperations.updateSession(
        editSession.id, 
        updatedSessionData
      );
      
      if (error) {
        console.error('Session update failed:', error);
        toast.error(`Failed to update session: ${error.message}`);
        return;
      }
      
      if (updatedSession) {
        console.log('Session updated successfully:', updatedSession);
        
        // Get fresh client data for this session
        let clientDetails = editSession.client;
        if (updatedSession.client_id) {
          try {
            const { data: clientData } = await clientOperations.getClientById(updatedSession.client_id);
            if (clientData) {
              console.log('Retrieved fresh client data for updated session:', clientData);
              clientDetails = {
                id: clientData.id,
                email: clientData.email || '',
                first_name: clientData.first_name || '',
                last_name: clientData.last_name || ''
              };
            }
          } catch (err) {
            console.error('Error fetching updated client data:', err);
            // Continue with the existing client data from the editSession
          }
        }
        
        // Create an updated session with details for the UI
        const updatedSessionWithDetails: SessionWithDetails = {
          ...updatedSession,
          client: clientDetails,
          session_time: updatedSession.session_date ? 
            new Date(updatedSession.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
            undefined
        };
        
        console.log('Updated session with details:', updatedSessionWithDetails);
        
        // Update the UI immediately
        setSessions(prevSessions => {
          return prevSessions.map(session => {
            if (session.id === editSession.id) {
              return updatedSessionWithDetails;
            }
            return session;
          });
        });
        
        toast.success("Session updated successfully");
        setEditSession(null);
        
        // Also refresh from server to ensure consistency
        console.log('Refreshing sessions from server after update...');
        fetchSessions();
      }
    } catch (err: any) {
      console.error('Error in session update:', err);
      toast.error(err.message || "Failed to update session");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async () => {
    if (!deleteSessionId || !user?.id) return;

    try {
      setLoading(true);
      
      // Import auth functions to get fresh session
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.refreshSession();
      
      console.log('Deleting session, ID:', deleteSessionId);
      
      // Delete the session using the operations layer
      const { data, error } = await sessionOperations.deleteSession(deleteSessionId);
      
      if (error) {
        console.error('Session deletion failed:', error);
        toast.error(`Failed to delete session: ${error.message}`);
        return;
      }
      
      toast.success("Session deleted successfully");
      
      // Update UI immediately
      setSessions(prevSessions => prevSessions.filter(s => s.id !== deleteSessionId));
      setDeleteSessionId(null);
      
      // Also refresh from server
      fetchSessions();
    } catch (err: any) {
      console.error('Error in session deletion:', err);
      toast.error(err.message || "Failed to delete session");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get client name from session
  const getClientName = (session: SessionWithDetails): string => {
    console.log(`Getting client name for session ${session.id}`, {
      client_id: session.client_id,
      client: session.client
    });
    
    if (session.client) {
      if (session.client.first_name && session.client.last_name) {
        console.log(`Client name from direct properties: ${session.client.first_name} ${session.client.last_name}`);
        return `${session.client.first_name} ${session.client.last_name}`;
      }
      if (session.client.profile?.first_name && session.client.profile?.last_name) {
        console.log(`Client name from profile: ${session.client.profile.first_name} ${session.client.profile.last_name}`);
        return `${session.client.profile.first_name} ${session.client.profile.last_name}`;
      }
      
      // Fallback if we have partially complete data
      if (session.client.first_name) {
        console.log(`Partial client data - first name only: ${session.client.first_name}`);
        return session.client.first_name;
      }
      if (session.client.profile?.first_name) {
        console.log(`Partial client data from profile - first name only: ${session.client.profile.first_name}`);
        return session.client.profile.first_name;
      }
      
      console.log('Client object exists but no name properties:', session.client);
    } else {
      console.log(`No client object for session ${session.id} with client_id ${session.client_id}`);
      
      // Try to find client in clients list as a last resort
      if (session.client_id && clients.length > 0) {
        const clientFromList = clients.find(c => c.id === session.client_id);
        if (clientFromList) {
          console.log(`Found client in clients list: ${clientFromList.first_name} ${clientFromList.last_name}`);
          return `${clientFromList.first_name} ${clientFromList.last_name}`;
        }
      }
    }
    
    console.warn(`Returning "Unknown Client" for session ${session.id}`);
    return "Unknown Client";
  };

  // Helper function to format date from session
  const getFormattedDate = (session: SessionWithDetails): string => {
    if (!session.session_date) return "No date";
    return new Date(session.session_date).toLocaleDateString();
  };

  // Helper function to get time from session
  const getFormattedTime = (session: SessionWithDetails): string => {
    if (session.session_time) return session.session_time;
    if (!session.session_date) return "No time";
    return new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter sessions based on active tab and search
  const getFilteredSessions = (): SessionWithDetails[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return sessions.filter(session => {
      // Parse the session date
      const sessionDate = session.session_date ? new Date(session.session_date) : null;
      if (sessionDate) sessionDate.setHours(0, 0, 0, 0); // Start of session day
      
      // First, filter by tab
      const isUpcoming = sessionDate && sessionDate > today && session.status === "Scheduled";
      const isToday = sessionDate && sessionDate.getTime() === today.getTime();
      const isCompleted = session.status === "Completed";
      
      if (activeTab === "upcoming" && !isUpcoming) return false;
      if (activeTab === "today" && !isToday) return false;
      if (activeTab === "completed" && !isCompleted) return false;
      
      // Then, filter by session type
      if (sessionType !== "all") {
        const normalizedType = session.session_type.toLowerCase();
        if (normalizedType !== sessionType) return false;
      }
      
      // Finally, filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const clientName = getClientName(session).toLowerCase();
        const date = getFormattedDate(session).toLowerCase();
        const sessionType = session.session_type.toLowerCase();
        
        return clientName.includes(query) || date.includes(query) || sessionType.includes(query);
      }
      
      return true;
    });
  };

  // Get filtered sessions
  const filteredSessions = getFilteredSessions();

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
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="client" className="text-base font-semibold text-therapy-purple">Client</Label>
                  <Select value={newSession.client} onValueChange={v => setNewSession({ ...newSession, client: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date" className="text-base font-semibold text-therapy-purple">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={newSession.date} 
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })} 
                    className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time" className="text-base font-semibold text-therapy-purple">Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={newSession.time} 
                    onChange={e => setNewSession({ ...newSession, time: e.target.value })} 
                    className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type" className="text-base font-semibold text-therapy-purple">Type</Label>
                  <Select 
                    value={newSession.type} 
                    onValueChange={v => setNewSession({ ...newSession, type: v as 'In-person' | 'Virtual' })}
                  >
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewSessionDialogOpen(false)} 
                  className="rounded-full px-8 py-3 text-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleNewSession}
                  className="bg-therapy-purple hover:bg-therapy-purpleDeep text-lg px-10 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2" 
                  disabled={isScheduleDisabled}
                >
                  Schedule Session
                </Button>
              </div>
            </div>
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
            <Select value={sessionType} onValueChange={(value) => setSessionType(value as SessionTypeFilter)}>
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
        <Tabs defaultValue="upcoming" className="w-full" onValueChange={(value) => setActiveTab(value as SessionTab)}>
          <TabsList className="mb-4 bg-gray-100 rounded-lg flex flex-wrap">
            <TabsTrigger value="upcoming" className="rounded-l-lg text-base font-semibold">Upcoming</TabsTrigger>
            <TabsTrigger value="today" className="text-base font-semibold">Today</TabsTrigger>
            <TabsTrigger value="completed" className="text-base font-semibold">Completed</TabsTrigger>
            <TabsTrigger value="all" className="rounded-r-lg text-base font-semibold">All Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="pt-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.length > 0 ? filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  clientName={getClientName(session)}
                  date={getFormattedDate(session)}
                  time={getFormattedTime(session)}
                  type={session.session_type}
                  status={session.status}
                  onEdit={() => setEditSession(session)}
                  onJoin={() => navigate(`/therapist/sessions/${session.id}`)}
                  onDelete={() => setDeleteSessionId(session.id)}
                />
              )) : (
                <div className="col-span-full text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-therapy-purple/10 mb-4">
                    <CalendarDays className="h-8 w-8 text-therapy-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-therapy-gray mb-2">No sessions found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or schedule a new session</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="today" className="pt-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.length > 0 ? filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  clientName={getClientName(session)}
                  date={getFormattedDate(session)}
                  time={getFormattedTime(session)}
                  type={session.session_type}
                  status={session.status}
                  onEdit={() => setEditSession(session)}
                  onJoin={() => navigate(`/therapist/sessions/${session.id}`)}
                  onDelete={() => setDeleteSessionId(session.id)}
                />
              )) : (
                <div className="col-span-full text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-therapy-purple/10 mb-4">
                    <CalendarDays className="h-8 w-8 text-therapy-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-therapy-gray mb-2">No sessions for today</h3>
                  <p className="text-gray-500 mb-6">Schedule a new session for today</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="pt-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.length > 0 ? filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  clientName={getClientName(session)}
                  date={getFormattedDate(session)}
                  time={getFormattedTime(session)}
                  type={session.session_type}
                  status={session.status}
                  onEdit={() => setEditSession(session)}
                  onJoin={() => navigate(`/therapist/sessions/${session.id}`)}
                  onDelete={() => setDeleteSessionId(session.id)}
                />
              )) : (
                <div className="col-span-full text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-therapy-purple/10 mb-4">
                    <CalendarDays className="h-8 w-8 text-therapy-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-therapy-gray mb-2">No completed sessions</h3>
                  <p className="text-gray-500 mb-6">Completed sessions will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="pt-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.length > 0 ? filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  clientName={getClientName(session)}
                  date={getFormattedDate(session)}
                  time={getFormattedTime(session)}
                  type={session.session_type}
                  status={session.status}
                  onEdit={() => setEditSession(session)}
                  onJoin={() => navigate(`/therapist/sessions/${session.id}`)}
                  onDelete={() => setDeleteSessionId(session.id)}
                />
              )) : (
                <div className="col-span-full text-center py-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-therapy-purple/10 mb-4">
                    <CalendarDays className="h-8 w-8 text-therapy-purple" />
                  </div>
                  <h3 className="text-xl font-semibold text-therapy-gray mb-2">No sessions found</h3>
                  <p className="text-gray-500 mb-6">Schedule your first session to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Session Dialog */}
      {editSession && (
        <Dialog open={!!editSession} onOpenChange={(open) => !open && setEditSession(null)}>
          <DialogContent className="sm:max-w-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-therapy-purple mb-2 tracking-tight">Edit Session</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mb-6">
                Update the session details below.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <Label className="text-base font-semibold text-therapy-purple">Client</Label>
                  <p className="text-base text-gray-700">{getClientName(editSession)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-date" className="text-base font-semibold text-therapy-purple">Date</Label>
                  <Input 
                    id="edit-date" 
                    type="date" 
                    value={editSession.session_date ? new Date(editSession.session_date).toISOString().split('T')[0] : ''} 
                    onChange={e => {
                      const date = e.target.value;
                      const time = editSession.session_date ? new Date(editSession.session_date).toTimeString().split(' ')[0] : '00:00:00';
                      setEditSession({
                        ...editSession,
                        session_date: `${date}T${time}`
                      });
                    }} 
                    className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-time" className="text-base font-semibold text-therapy-purple">Time</Label>
                  <Input 
                    id="edit-time" 
                    type="time" 
                    value={editSession.session_date ? new Date(editSession.session_date).toTimeString().split(' ')[0].substring(0, 5) : ''} 
                    onChange={e => {
                      const time = e.target.value;
                      const date = editSession.session_date ? new Date(editSession.session_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                      setEditSession({
                        ...editSession,
                        session_date: `${date}T${time}:00`
                      });
                    }} 
                    className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-type" className="text-base font-semibold text-therapy-purple">Type</Label>
                  <Select 
                    value={editSession.session_type} 
                    onValueChange={v => setEditSession({
                      ...editSession,
                      session_type: v as 'In-person' | 'Virtual'
                    })}
                  >
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="edit-status" className="text-base font-semibold text-therapy-purple">Status</Label>
                  <Select 
                    value={editSession.status} 
                    onValueChange={v => setEditSession({
                      ...editSession,
                      status: v as 'Scheduled' | 'Completed' | 'Canceled' | 'No-show'
                    })}
                  >
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                      <SelectItem value="No-show">No-show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditSession(null)} 
                  className="rounded-full px-8 py-3 text-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    // Make sure the session_date is in the right format for the API
                    let formattedDate = editSession.session_date;
                    
                    // Ensure we have a valid date format
                    if (formattedDate) {
                      console.log('Original session_date before formatting:', formattedDate);
                      
                      // Standardize the date format to ensure it works consistently
                      try {
                        // Parse the date and create a standardized ISO string
                        const dateObj = new Date(formattedDate);
                        if (!isNaN(dateObj.getTime())) { // Check if date is valid
                          formattedDate = dateObj.toISOString();
                          console.log('Formatted session_date for update:', formattedDate);
                        } else {
                          console.error('Invalid date format:', formattedDate);
                        }
                      } catch (err) {
                        console.error('Error formatting date:', err);
                      }
                    }
                    
                    const updatedData: Partial<SessionInput> = {
                      session_date: formattedDate,
                      session_type: editSession.session_type,
                      status: editSession.status,
                      // Preserve the client_id to ensure it's not lost in the update
                      client_id: editSession.client_id
                    };
                    
                    console.log('Sending update data to server:', updatedData);
                    handleEditSessionSave(updatedData);
                  }}
                  className="bg-therapy-purple hover:bg-therapy-purpleDeep text-lg px-10 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteSessionId && (
        <Dialog open={!!deleteSessionId} onOpenChange={(open) => !open && setDeleteSessionId(null)}>
          <DialogContent className="sm:max-w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-600 mb-2">Delete Session</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mb-6">
                Are you sure you want to delete this session? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 justify-end mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteSessionId(null)} 
                className="rounded-full px-8 py-3"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleDeleteSession}
                className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Sessions;
