import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, CalendarCheck, BrainCircuit, LineChart, FileText, Plus, Eye, Play, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { ClientService, ClientWithProfile } from "@/services/ClientService";
import { SessionService, SessionWithDetails } from "@/services/SessionService";
import { toast } from "sonner";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientService = new ClientService();
  const sessionService = new SessionService();
  
  // Use an identifier to track component mount state
  const [mountId] = useState(Math.random().toString(36).substring(7));

  const [recentClients, setRecentClients] = useState<DashboardClient[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<DashboardSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    clients: 0,
    sessions: 0
  });
  
  // Helper function to generate consistent progress value based on client ID
  const getClientProgress = useCallback((clientId: string) => {
    // Generate a stable progress value based on the client ID
    // This ensures the same client always gets the same progress value
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      hash = ((hash << 5) - hash) + clientId.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Generate a number between 10 and 90 for better visual distribution
    return Math.abs(hash % 81) + 10;
  }, []);
  
  // Define fetchDashboardData as a callback to prevent recreation on renders
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch clients
      const { data: clientsData, error: clientsError } = await clientService.getClientsWithProfiles(user.id);
      
      if (clientsError) {
        setError(clientsError.message);
        toast.error("Failed to load clients");
        return;
      }
      
      // Get recent clients with stable progress values
      const recentClientData = clientsData?.slice(0, 4).map(client => ({
        id: client.id,
        name: (client.profile ? `${client.profile.first_name || ''} ${client.profile.last_name || ''}` : `${client.first_name || ''} ${client.last_name || ''}`).trim() || 'Client',
        progress: getClientProgress(client.id), // Use consistent progress based on client ID
        lastSession: new Date(client.updated_at || client.created_at || Date.now()).toLocaleDateString()
      })) || [];
      
      setRecentClients(recentClientData);
      
      // Fetch upcoming sessions
      const { data: sessionsData, error: sessionsError } = await sessionService.getSessionsByTherapist(user.id);
      
      if (sessionsError) {
        setError(sessionsError.message);
        toast.error("Failed to load sessions");
        return;
      }
      
      // Format upcoming sessions
      const upcomingSessionData = sessionsData
        ?.filter(session => session.status === 'Scheduled')
        .slice(0, 4)
        .map(session => ({
          id: session.id,
          clientName: session.client ? `${session.client.first_name} ${session.client.last_name}` : 'Unknown Client',
          date: new Date(session.session_date).toLocaleDateString(),
          time: new Date(session.session_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          type: session.session_type
        })) || [];
      
      setUpcomingSessions(upcomingSessionData);
      
      // Set counts
      setCounts({
        clients: clientsData?.length || 0,
        sessions: sessionsData?.length || 0
      });
      
    } catch (err: any) {
      setError(err.message);
      toast.error("An error occurred while loading dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, clientService, sessionService]);

  // Fetch dashboard data from Supabase when component mounts
  useEffect(() => {
    console.log(`Dashboard mounted with ID: ${mountId}`);
    // Set loading state immediately
    setLoading(true);
    
    // Use setTimeout to ensure loading state is visible for a minimum time
    // This prevents the loading symbol from flickering
    const loadingTimer = setTimeout(() => {
      fetchDashboardData();
    }, 300); // Short delay to ensure consistent loading experience
    
    // Clean up when component unmounts
    return () => {
      clearTimeout(loadingTimer);
      console.log(`Dashboard unmounting ID: ${mountId}`);
    };
  }, [fetchDashboardData, mountId]);

  // Memoize metrics to prevent re-creation on every render
  const metrics = useCallback(() => [
    {
      title: "Clients",
      icon: <Users className="h-7 w-7" />, 
      value: loading ? "..." : counts.clients.toString(), 
      background: "bg-therapy-blue/10", 
      iconColor: "text-therapy-blue"
    },
    {
      title: "Sessions",
      icon: <CalendarCheck className="h-7 w-7" />, 
      value: loading ? "..." : counts.sessions.toString(), 
      background: "bg-therapy-purple/10", 
      iconColor: "text-therapy-purple"
    },
    {
      title: "Insights",
      icon: <BrainCircuit className="h-7 w-7" />, 
      value: "4", 
      background: "bg-therapy-green/10", 
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
  ], [loading, counts.clients, counts.sessions]);

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

      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 text-therapy-purple animate-spin" />
        </div>
      )}

      {error && !loading && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Use memoized metrics with function call */}
        {metrics().map((metric, index) => (
          <Card key={index} className="shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${metric.background}`}>
                  <div className={metric.iconColor}>{metric.icon}</div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <p className="text-lg font-medium text-gray-500 mt-2">{metric.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clients */}
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-therapy-gray">Recent Clients</CardTitle>
          <CardDescription className="text-base text-gray-500">Your most recently active clients</CardDescription>
        </CardHeader>
        <CardContent>
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
          <CardTitle className="text-2xl font-bold text-therapy-gray">Upcoming Sessions</CardTitle>
          <CardDescription className="text-base text-gray-500">Sessions scheduled in your calendar</CardDescription>
        </CardHeader>
        <CardContent>
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
