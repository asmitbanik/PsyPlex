import { Link } from "react-router-dom";
import { Users, CalendarCheck, BrainCircuit, LineChart, FileText, Plus, Eye, Play, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import dashboardData from "@/data/dashboardData.json";

const Dashboard = () => {
  // Use data from JSON file
  const { recentClients, upcomingSessions } = dashboardData;

  const metrics = [
    {
      title: "Clients",
      icon: <Users className="h-7 w-7" />, value: "24", link: "/therapist/clients", bg: "bg-therapy-purple/10", iconBg: "bg-therapy-purple text-therapy-purpleLight"
    },
    {
      title: "Sessions",
      icon: <CalendarCheck className="h-7 w-7" />, value: "128", link: "/therapist/sessions", bg: "bg-therapy-blue/10", iconBg: "bg-therapy-blue text-blue-100"
    },
    {
      title: "Therapy Insights",
      icon: <BrainCircuit className="h-7 w-7" />, value: "View", link: "/therapist/insights", bg: "bg-therapy-green/10", iconBg: "bg-therapy-green text-green-100"
    },
    {
      title: "Progress Reports",
      icon: <LineChart className="h-7 w-7" />, value: "Create", link: "/therapist/progress", bg: "bg-therapy-orange/10", iconBg: "bg-therapy-orange text-orange-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-0 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-4xl font-bold text-therapy-gray">Dashboard</h1>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-6 py-3 text-base font-semibold shadow-md flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Session
        </Button>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, index) => (
          <Link to={item.link} key={index} className="group">
            <Card
              className={`transition-all duration-200 rounded-2xl border-0 flex flex-col items-center justify-center h-48 w-full p-0
                ${index === 0 ? 'bg-therapy-purple/10 shadow-lg' : 'bg-white shadow-sm'}
                group-hover:scale-[1.04] group-hover:shadow-xl
              `}
            >
              <CardContent className="flex flex-col items-center justify-center h-full w-full p-0">
                <div className={`flex flex-col items-center justify-center w-full h-full gap-2`}>
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-2
                    ${index === 0 ? 'bg-therapy-purple text-white shadow-md' :
                      index === 1 ? 'bg-therapy-blue/10 text-therapy-blue' :
                      index === 2 ? 'bg-therapy-green/10 text-therapy-green' :
                      'bg-therapy-orange/10 text-therapy-orange'}
                  `}>
                    {item.icon}
                  </div>
                  <div className={`text-4xl font-extrabold ${index === 0 ? 'text-therapy-gray' : 'text-therapy-gray'}`}>{item.value}</div>
                  <div className={`text-lg font-semibold ${index === 0 ? 'text-therapy-gray' : 'text-therapy-gray'}`}>{item.title}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Clients */}
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-therapy-gray">Recent Clients</CardTitle>
          <CardDescription className="text-base text-gray-500">View progress of your recently active clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentClients.map(client => (
              <div key={client.id} className="flex items-center justify-between space-x-4 p-4 rounded-xl border bg-gray-50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-therapy-purple/10 text-therapy-purple text-xl font-bold flex items-center justify-center">
                    {client.name.split(' ').map(n => n[0]).join('')}
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
                <Button variant="outline" size="sm" asChild className="rounded-full flex items-center gap-2 font-semibold">
                  <Link to={`/therapist/clients/${client.id}`}><Eye className="h-4 w-4" /> View</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button variant="outline" asChild className="w-full rounded-full flex items-center gap-2 font-semibold">
            <Link to="/therapist/clients"><Eye className="h-4 w-4" /> View All Clients</Link>
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
                    {session.clientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-therapy-blue text-lg">{session.clientName}</h4>
                    <p className="text-sm text-gray-500">
                      {session.date} at {session.time} • {session.type}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold">
                    <RefreshCw className="h-4 w-4" /> Reschedule
                  </Button>
                  <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white">
                    <Play className="h-4 w-4" /> Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <Button variant="outline" asChild className="w-full rounded-full flex items-center gap-2 font-semibold">
            <Link to="/therapist/sessions"><Eye className="h-4 w-4" /> View All Sessions</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
