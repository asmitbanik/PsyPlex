import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import sessionsData from "@/data/sessionsData.json";

// Mock session data
const { sessions } = sessionsData;

const Sessions = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray">Sessions</h1>
          <p className="text-gray-600">Manage your therapy sessions</p>
        </div>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">
          + Schedule New Session
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative grow">
          <Input
            placeholder="Search sessions..."
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Session Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in-person">In-person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Filter</Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
        </TabsList>
        
        {["upcoming", "today", "completed", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Client</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Time</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions
                        .filter(session => 
                          tab === "all" || 
                          (tab === "upcoming" && session.status === "Upcoming") ||
                          (tab === "today" && session.status === "Today") ||
                          (tab === "completed" && session.status === "Completed")
                        )
                        .map((session) => (
                        <tr key={session.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <Link to={`/therapist/clients/${session.clientId}`} className="font-medium text-therapy-purple hover:underline">
                              {session.clientName}
                            </Link>
                          </td>
                          <td className="p-4">{session.date}</td>
                          <td className="p-4">{session.time}</td>
                          <td className="p-4">{session.type}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === "Completed" ? "bg-green-100 text-green-800" :
                              session.status === "Today" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {session.status === "Completed" ? (
                              <Button variant="outline" size="sm">View Notes</Button>
                            ) : (
                              <>
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep">
                                  Start
                                </Button>
                              </>
                            )}
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
    </div>
  );
};

export default Sessions;
