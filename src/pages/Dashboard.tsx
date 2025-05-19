import { useNavigate } from "react-router-dom";
import { Users, CalendarCheck, BrainCircuit, LineChart, Plus, Eye, Play, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

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

// Mock data for dashboard
const MOCK_CLIENTS: DashboardClient[] = [
  { id: '1', name: 'John Doe', progress: 75, lastSession: '05/15/2025' },
  { id: '2', name: 'Jane Smith', progress: 45, lastSession: '05/17/2025' },
  { id: '3', name: 'Robert Johnson', progress: 90, lastSession: '05/10/2025' },
  { id: '4', name: 'Emily Wilson', progress: 60, lastSession: '05/12/2025' }
];

const MOCK_SESSIONS: DashboardSession[] = [
  { id: '1', clientName: 'John Doe', date: '05/20/2025', time: '10:00 AM', type: 'Virtual' },
  { id: '2', clientName: 'Jane Smith', date: '05/21/2025', time: '2:30 PM', type: 'In-person' },
  { id: '3', clientName: 'Robert Johnson', date: '05/22/2025', time: '1:15 PM', type: 'Virtual' },
  { id: '4', clientName: 'Emily Wilson', date: '05/23/2025', time: '11:00 AM', type: 'In-person' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Using static mock data instead of fetching from Supabase
  const recentClients = MOCK_CLIENTS;
  const upcomingSessions = MOCK_SESSIONS;
  const counts = {
    clients: 16,
    sessions: 24
  };

  // Static metrics data
  const metrics = [
    {
      title: "Clients",
      icon: <Users className="h-7 w-7" />, 
      value: counts.clients.toString(), 
      background: "bg-therapy-blue/10", 
      iconColor: "text-therapy-blue"
    },
    {
      title: "Sessions",
      icon: <CalendarCheck className="h-7 w-7" />, 
      value: counts.sessions.toString(), 
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

      {/* Loading state and error handling removed */}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Static metrics data */}
        {metrics.map((metric, index) => (
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
