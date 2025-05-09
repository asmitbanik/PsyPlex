import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import sessionsData from "@/data/sessionsData.json";
import { CalendarDays, Edit, Play, StickyNote, Filter, Plus, Search } from "lucide-react";

// Mock session data
const { sessions } = sessionsData;

const Sessions = () => {
  const [isNewSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState("all");

  const handleNewSession = () => {
    // Here you would handle the new session creation
    setNewSessionDialogOpen(false);
  };
  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-therapy-gray mb-1">Sessions</h1>
          <p className="text-lg text-gray-600">Manage your therapy sessions</p>
        </div>        <Dialog open={isNewSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-6 py-3 text-base font-semibold shadow-md flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schedule New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Schedule New Session</DialogTitle>
              <DialogDescription>
                Create a new therapy session. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Client</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" type="time" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleNewSession}>Schedule Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls Card */}
      <Card className="shadow-lg rounded-2xl border border-gray-200 mb-2">
        <CardContent className="py-6 px-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative grow">              <Input
                placeholder="Search sessions..."
                className="pl-10 rounded-full h-12 text-base shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
            </div>
            <div className="flex gap-2">
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger className="w-[150px] rounded-full h-12 text-base">
                  <SelectValue placeholder="Session Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            <Button variant="outline" className="rounded-full h-12 px-6 text-base font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg">
          <TabsTrigger value="upcoming" className="rounded-l-lg text-base font-semibold">Upcoming</TabsTrigger>
          <TabsTrigger value="today" className="text-base font-semibold">Today</TabsTrigger>
          <TabsTrigger value="completed" className="text-base font-semibold">Completed</TabsTrigger>
          <TabsTrigger value="all" className="rounded-r-lg text-base font-semibold">All Sessions</TabsTrigger>
        </TabsList>
        {['upcoming', 'today', 'completed', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-2">
            <Card className="shadow-lg rounded-2xl border border-gray-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                    <tbody>                      {sessions
                        .filter(session => 
                          (tab === "all" || 
                           (tab === "upcoming" && session.status === "Upcoming") ||
                           (tab === "today" && session.status === "Today") ||
                           (tab === "completed" && session.status === "Completed")) &&
                          (sessionType === "all" || session.type.toLowerCase() === sessionType) &&
                          (searchQuery === "" || 
                           session.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.time.toLowerCase().includes(searchQuery.toLowerCase()))
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
                                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold">
                                  <StickyNote className="h-4 w-4" />
                                  View Notes
                                </Button>
                              ) : (
                                <>
                                  <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white">
                                    <Play className="h-4 w-4" />
                                    Start
                                  </Button>
                                </>
                              )}
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
    </div>
  );
};

export default Sessions;
