
import { Link } from "react-router-dom";
import { Users, CalendarCheck, BrainCircuit, LineChart, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  // Mock data
  const recentClients = [
    { id: '1', name: 'Sarah Johnson', lastSession: '2 days ago', progress: 75 },
    { id: '2', name: 'Michael Chen', lastSession: '1 week ago', progress: 60 },
    { id: '3', name: 'Emily Rodriguez', lastSession: 'Yesterday', progress: 85 },
  ];

  const upcomingSessions = [
    { id: '1', clientName: 'Sarah Johnson', date: 'Today', time: '2:00 PM', type: 'In-person' },
    { id: '2', clientName: 'James Wilson', date: 'Tomorrow', time: '10:00 AM', type: 'Virtual' },
    { id: '3', clientName: 'Emma Davis', date: 'May 10, 2025', time: '3:30 PM', type: 'In-person' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-therapy-gray">Dashboard</h1>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">
          + New Session
        </Button>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Clients", icon: <Users className="h-6 w-6" />, value: "24", link: "/therapist/clients" },
          { title: "Sessions", icon: <CalendarCheck className="h-6 w-6" />, value: "128", link: "/therapist/sessions" },
          { title: "Therapy Insights", icon: <BrainCircuit className="h-6 w-6" />, value: "View", link: "/therapist/insights" },
          { title: "Progress Reports", icon: <LineChart className="h-6 w-6" />, value: "Create", link: "/therapist/progress" }
        ].map((item, index) => (
          <Link to={item.link} key={index}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-therapy-purpleLight rounded-full flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="text-2xl font-semibold text-therapy-gray">{item.value}</div>
                </div>
                <h3 className="mt-4 font-medium text-gray-600">{item.title}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Clients</CardTitle>
          <CardDescription>View progress of your recently active clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClients.map(client => (
              <div key={client.id} className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div>
                  <h4 className="font-medium text-therapy-gray">{client.name}</h4>
                  <p className="text-sm text-gray-500">Last session: {client.lastSession}</p>
                </div>
                <div className="space-y-1 flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{client.progress}%</span>
                  </div>
                  <Progress value={client.progress} className="h-2" />
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/therapist/clients/${client.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/therapist/clients">View All Clients</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Sessions scheduled in your calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-therapy-blue flex items-center justify-center text-therapy-purple">
                    {session.clientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium text-therapy-gray">{session.clientName}</h4>
                    <p className="text-sm text-gray-500">
                      {session.date} at {session.time} • {session.type}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep">
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/therapist/sessions">View All Sessions</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
