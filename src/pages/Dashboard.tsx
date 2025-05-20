import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CalendarCheck, BrainCircuit, LineChart, Plus, Eye, Play, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Import the database operations
import * as clientOperations from "@/services/db-operations/clients";
import * as sessionOperations from "@/services/db-operations/sessions";
import * as sessionNotesOperations from "@/services/db-operations/sessionNotes";

// Dashboard specific interfaces
interface DashboardClient {
  id: string;
  name: string;
  progress: number;
  lastSession: string;
}

interface DashboardSession {
  id: string;
  clientName: string;
  date: string;
  time: string;
  type: "In-person" | "Virtual";
}

// State for loading and error handling
interface DataLoadingState {
  clientsLoading: boolean;
  clientsError: string | null;
  sessionsLoading: boolean;
  sessionsError: string | null;
  notesLoading: boolean;
  notesError: string | null;
}

// State for dashboard metrics
interface DashboardMetrics {
  totalClients: number;
  totalSessions: number;
  totalNotes: number;
  upcomingSessions: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for clients, sessions and notes
  const [recentClients, setRecentClients] = useState<DashboardClient[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<DashboardSession[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    totalSessions: 0,
    totalNotes: 0,
    upcomingSessions: 0
  });
  
  // Loading and error states
  const [loadingState, setLoadingState] = useState<DataLoadingState>({
    clientsLoading: true,
    clientsError: null,
    sessionsLoading: true,
    sessionsError: null,
    notesLoading: true,
    notesError: null
  });

  // Function to format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Function to format time
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid time';
    }
  };

  // Fetch clients data
  const fetchClients = async () => {
    if (!user?.id) return;
    
    setLoadingState(prev => ({ ...prev, clientsLoading: true, clientsError: null }));
    
    try {
      // Fetch clients with profiles
      const { data: clientsData, error } = await clientOperations.getClientsWithProfiles(user.id);
      
      if (error) {
        console.error('Error fetching clients:', error);
        setLoadingState(prev => ({ ...prev, clientsLoading: false, clientsError: error.message }));
        return;
      }
      
      if (!clientsData || clientsData.length === 0) {
        console.log('No clients found');
        setRecentClients([]);
        setMetrics(prev => ({ ...prev, totalClients: 0 }));
        setLoadingState(prev => ({ ...prev, clientsLoading: false }));
        return;
      }
      
      // Update metrics
      setMetrics(prev => ({ ...prev, totalClients: clientsData.length }));
      
      // Get the 4 most recently updated clients
      const sortedClients = [...clientsData].sort((a, b) => 
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      ).slice(0, 4);
      
      // Convert to dashboard format
      const dashboardClients: DashboardClient[] = sortedClients.map(client => {
        const firstName = client.first_name || client.profile?.first_name || '';
        const lastName = client.last_name || client.profile?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Client';
        
        // Randomly assign progress for now (in real app would calculate from therapy progress)
        const progress = Math.floor(Math.random() * 100);
        
        return {
          id: client.id,
          name: fullName,
          progress,
          lastSession: client.updated_at ? formatDate(client.updated_at) : 'No sessions yet'
        };
      });
      
      setRecentClients(dashboardClients);
      setLoadingState(prev => ({ ...prev, clientsLoading: false }));
      
    } catch (err: any) {
      console.error('Exception in fetchClients:', err);
      setLoadingState(prev => ({ ...prev, clientsLoading: false, clientsError: err.message }));
    }
  };

  // Fetch sessions data
  const fetchSessions = async () => {
    if (!user?.id) return;
    
    setLoadingState(prev => ({ ...prev, sessionsLoading: true, sessionsError: null }));
    
    try {
      // Get all sessions for this therapist
      const { data: sessionsData, error } = await sessionOperations.getSessionsByTherapistId(user.id);
      
      if (error) {
        console.error('Error fetching sessions:', error);
        setLoadingState(prev => ({ ...prev, sessionsLoading: false, sessionsError: error.message }));
        return;
      }
      
      if (!sessionsData || sessionsData.length === 0) {
        console.log('No sessions found');
        setUpcomingSessions([]);
        setMetrics(prev => ({ ...prev, totalSessions: 0, upcomingSessions: 0 }));
        setLoadingState(prev => ({ ...prev, sessionsLoading: false }));
        return;
      }
      
      // Update metrics
      setMetrics(prev => ({ ...prev, totalSessions: sessionsData.length }));
      
      // Convert to map of client IDs for easy lookup
      const clientIds = new Set(sessionsData.map(session => session.client_id));
      
      // Fetch client data for all sessions
      const clientsMap = new Map();
      
      for (const clientId of clientIds) {
        if (!clientId) continue;
        
        try {
          const { data: clientData } = await clientOperations.getClientById(clientId);
          
          if (clientData) {
            const firstName = clientData.first_name || '';
            const lastName = clientData.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Client';
            
            clientsMap.set(clientId, fullName);
          }
        } catch (err) {
          console.error(`Error fetching client ${clientId}:`, err);
          clientsMap.set(clientId, 'Unknown Client');
        }
      }
      
      // Get upcoming sessions (today + future, ordered by date)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingSessionsData = sessionsData
        .filter(session => {
          if (!session.session_date) return false;
          const sessionDate = new Date(session.session_date);
          return sessionDate >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(a.session_date || 0);
          const dateB = new Date(b.session_date || 0);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 4); // Take only the first 4
      
      // Update metrics with upcoming sessions count
      setMetrics(prev => ({ ...prev, upcomingSessions: upcomingSessionsData.length }));
      
      // Convert to dashboard format
      const dashboardSessions: DashboardSession[] = upcomingSessionsData.map(session => ({
        id: session.id,
        clientName: clientsMap.get(session.client_id) || 'Unknown Client',
        date: formatDate(session.session_date || ''),
        time: formatTime(session.session_date || ''),
        type: session.session_type as 'In-person' | 'Virtual'
      }));
      
      setUpcomingSessions(dashboardSessions);
      setLoadingState(prev => ({ ...prev, sessionsLoading: false }));
      
    } catch (err: any) {
      console.error('Exception in fetchSessions:', err);
      setLoadingState(prev => ({ ...prev, sessionsLoading: false, sessionsError: err.message }));
    }
  };

  // Fetch notes data (just for counts)
  const fetchNotes = async () => {
    if (!user?.id) return;
    
    setLoadingState(prev => ({ ...prev, notesLoading: true, notesError: null }));
    
    try {
      // Get the therapist ID for this user
      const { data: therapists } = await clientOperations.getClientsByTherapistId(user.id);
      
      if (!therapists || therapists.length === 0) {
        setMetrics(prev => ({ ...prev, totalNotes: 0 }));
        setLoadingState(prev => ({ ...prev, notesLoading: false }));
        return;
      }
      
      // Attempt to count notes for all clients
      let totalNotes = 0;
      
      // Use the therapist's clients to get notes
      for (const client of therapists) {
        try {
          const { data: notes } = await sessionNotesOperations.getSessionNotesByClientId(client.id);
          if (notes) {
            totalNotes += notes.length;
          }
        } catch (err) {
          console.error(`Error fetching notes for client ${client.id}:`, err);
          // Continue with other clients even if one fails
        }
      }
      
      setMetrics(prev => ({ ...prev, totalNotes }));
      setLoadingState(prev => ({ ...prev, notesLoading: false }));
      
    } catch (err: any) {
      console.error('Exception in fetchNotes:', err);
      setLoadingState(prev => ({ ...prev, notesLoading: false, notesError: err.message }));
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchClients();
    fetchSessions();
    fetchNotes();
    toast.success("Dashboard refreshed");
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchClients();
      fetchSessions();
      fetchNotes();
    }
  }, [user?.id]);
  // Metrics display data
  const metricsDisplay = [
    {
      title: "Clients",
      icon: Users,
      value: metrics.totalClients.toString(),
      description: "registered clients",
    },
    {
      title: "Sessions",
      icon: CalendarCheck,
      value: metrics.totalSessions.toString(),
      description: "total sessions",
    },
    {
      title: "Insights",
      icon: BrainCircuit,
      value: "4",
      description: "available insights",
      iconColor: "text-therapy-green"
    },
    {
      title: "Progress",
      icon: <LineChart className="h-7 w-7" />, 
      // Fixed stable value for Progress metric
      value: "86%", 
      background: "bg-therapy-yellow/10", 
      iconColor: "text-therapy-yellow"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-therapy-gray">Therapist Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Welcome back, {user?.user_metadata?.full_name || "Therapist"}</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white"
            onClick={() => navigate('/therapist/sessions?new=true')}
          >
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>
      </div>

      {/* Global loading state */}
      {(loadingState.clientsLoading && loadingState.sessionsLoading && loadingState.notesLoading) && (
        <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <Loader2 className="h-10 w-10 animate-spin text-therapy-purple mb-4" />
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      )}
      
      {/* Global error state */}
      {(loadingState.clientsError || loadingState.sessionsError || loadingState.notesError) && (
        <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg shadow-sm border border-red-200">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-lg text-red-600 font-medium">Some information could not be loaded</p>
          <p className="text-gray-500 mt-1">Please refresh the dashboard or try again later</p>
          <Button 
            onClick={handleRefresh} 
            className="mt-4 bg-therapy-purple hover:bg-therapy-purpleDeep text-white"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Dashboard
          </Button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metrics Cards */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-therapy-blue/10`}>
                <div className="text-therapy-blue"><Users className="h-7 w-7" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalClients}</p>
            </div>
            <p className="text-lg font-medium text-gray-500 mt-2">Clients</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-therapy-purple/10`}>
                <div className="text-therapy-purple"><CalendarCheck className="h-7 w-7" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalSessions}</p>
            </div>
            <p className="text-lg font-medium text-gray-500 mt-2">Sessions</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-therapy-green/10`}>
                <div className="text-therapy-green"><BrainCircuit className="h-7 w-7" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalNotes}</p>
            </div>
            <p className="text-lg font-medium text-gray-500 mt-2">Notes</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg bg-therapy-yellow/10`}>
                <div className="text-therapy-yellow"><LineChart className="h-7 w-7" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.upcomingSessions}</p>
            </div>
            <p className="text-lg font-medium text-gray-500 mt-2">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients */}
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-therapy-gray">Recent Clients</CardTitle>
              <CardDescription className="text-base text-gray-500">Your most recently active clients</CardDescription>
            </div>
            {!loadingState.clientsLoading && !loadingState.clientsError && (
              <Button 
                variant="ghost" 
                onClick={handleRefresh}
                size="sm"
                className="text-therapy-purple hover:text-therapy-purpleDeep"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {loadingState.clientsLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-therapy-purple mb-3" />
              <p className="text-gray-500">Loading client data...</p>
            </div>
          )}
          
          {/* Error state */}
          {loadingState.clientsError && (
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <p className="text-red-500 font-medium">Information not available</p>
              <p className="text-sm text-gray-500 mt-1">We couldn't load your clients at this time</p>
              <Button 
                onClick={handleRefresh} 
                className="mt-4 bg-therapy-purple hover:bg-therapy-purpleDeep text-white"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          )}
          
          {/* Empty state */}
          {!loadingState.clientsLoading && !loadingState.clientsError && recentClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <Users className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No clients found</p>
              <p className="text-sm text-gray-400 mt-1">Start by adding your first client</p>
              <Button 
                onClick={() => navigate('/therapist/clients?new=true')} 
                className="mt-4 bg-therapy-purple hover:bg-therapy-purpleDeep text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Client
              </Button>
            </div>
          )}
          
          {/* Client list */}
          {!loadingState.clientsLoading && !loadingState.clientsError && recentClients.length > 0 && (
            <div className="space-y-4">
              {recentClients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 shadow-sm">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-therapy-purple/10 rounded-full flex items-center justify-center text-xl font-bold text-therapy-purple">
                      {client.name.split(' ').map(n => n[0] || '').join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-therapy-purple text-lg">{client.name}</h4>
                      <p className="text-sm text-gray-500">Last session: {client.lastSession}</p>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-semibold text-therapy-green">{client.progress}%</span>
                    </div>
                    <Progress value={client.progress} className="h-2 bg-gray-200" indicatorClassName="bg-therapy-green" />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/therapist/clients/${client.id}`)}
                    className="rounded-full flex items-center gap-2 font-semibold cursor-pointer"
                    key={`client-view-${client.id}`}
                  >
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/therapist/clients')} 
            className="w-full rounded-full flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Eye className="h-4 w-4" /> View All Clients
          </Button>
        </CardFooter>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-therapy-gray">Upcoming Sessions</CardTitle>
              <CardDescription className="text-base text-gray-500">Sessions scheduled in your calendar</CardDescription>
            </div>
            {!loadingState.sessionsLoading && !loadingState.sessionsError && (
              <Button 
                variant="ghost" 
                onClick={handleRefresh}
                size="sm"
                className="text-therapy-purple hover:text-therapy-purpleDeep"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {loadingState.sessionsLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-therapy-purple mb-3" />
              <p className="text-gray-500">Loading session data...</p>
            </div>
          )}
          
          {/* Error state */}
          {loadingState.sessionsError && (
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <p className="text-red-500 font-medium">Information not available</p>
              <p className="text-sm text-gray-500 mt-1">We couldn't load your sessions at this time</p>
              <Button 
                onClick={handleRefresh} 
                className="mt-4 bg-therapy-purple hover:bg-therapy-purpleDeep text-white"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          )}
          
          {/* Empty state */}
          {!loadingState.sessionsLoading && !loadingState.sessionsError && upcomingSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <CalendarCheck className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No upcoming sessions</p>
              <p className="text-sm text-gray-400 mt-1">Schedule your first session</p>
              <Button 
                onClick={() => navigate('/therapist/sessions?new=true')} 
                className="mt-4 bg-therapy-purple hover:bg-therapy-purpleDeep text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Session
              </Button>
            </div>
          )}
          
          {/* Sessions list */}
          {!loadingState.sessionsLoading && !loadingState.sessionsError && upcomingSessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-therapy-blue/10 text-therapy-blue text-xl font-bold flex items-center justify-center">
                      {session.clientName.split(' ').map(n => n[0] || '').join('')}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="font-semibold text-gray-900">{session.clientName}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CalendarCheck className="h-3 w-3" />
                        <span>{session.date} at {session.time} • {session.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/therapist/sessions?edit=${session.id}`)} 
                      className="rounded-full flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" /> Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/therapist/sessions?start=${session.id}`)} 
                      className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white cursor-pointer"
                    >
                      <Play className="h-4 w-4" /> Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/therapist/sessions')} 
            className="w-full rounded-full flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Eye className="h-4 w-4" /> View All Sessions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
