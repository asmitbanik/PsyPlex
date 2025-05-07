
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CalendarCheck } from "lucide-react";

// Mock client data
const clientsData = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    dob: "April 15, 1991",
    address: "123 Main St, Anytown, CA 94321",
    occupation: "Marketing Manager",
    emergencyContact: "John Johnson (Husband) - +1 (555) 987-6543",
    startDate: "January 10, 2025",
    therapyType: "Cognitive Behavioral Therapy",
    primaryConcerns: "Anxiety, Work-related stress",
    notes: "Sarah has been making good progress with anxiety management techniques. She reports feeling more in control during stressful work situations.",
    sessions: [
      { id: "s1", date: "May 4, 2025", time: "2:00 PM", type: "In-person", status: "Completed", notes: "Discussed workplace anxiety triggers and practiced mindfulness exercises." },
      { id: "s2", date: "April 20, 2025", time: "2:00 PM", type: "In-person", status: "Completed", notes: "Reviewed thought records and identified cognitive distortions." },
      { id: "s3", date: "April 6, 2025", time: "2:30 PM", type: "Virtual", status: "Completed", notes: "Introduced exposure hierarchy for social anxiety." }
    ]
  },
  "2": {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    phone: "+1 (555) 234-5678",
    dob: "June 22, 1997",
    address: "456 Oak Ave, Somewhere, CA 94123",
    occupation: "Software Engineer",
    emergencyContact: "Lisa Chen (Sister) - +1 (555) 876-5432",
    startDate: "February 15, 2025",
    therapyType: "Dialectical Behavior Therapy",
    primaryConcerns: "Depression, Relationship issues",
    notes: "Michael is working on emotional regulation skills and has shown improvement in interpersonal relationships.",
    sessions: [
      { id: "s1", date: "April 28, 2025", time: "10:00 AM", type: "Virtual", status: "Completed", notes: "Practiced interpersonal effectiveness skills for workplace conflicts." },
      { id: "s2", date: "April 14, 2025", time: "10:00 AM", type: "In-person", status: "Completed", notes: "Reviewed emotion regulation diary and identified triggers." },
      { id: "s3", date: "March 31, 2025", time: "10:00 AM", type: "Virtual", status: "Completed", notes: "Discussed mindfulness practices and their application to daily life." }
    ]
  }
};

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const client = clientId ? clientsData[clientId] : undefined;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500 mb-4">Client not found</p>
        <Button asChild>
          <Link to="/therapist/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/therapist/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-therapy-gray">{client.name}</h1>
          <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
            Active
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Client</Button>
          <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">+ New Session</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{client.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p>{client.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p>{client.occupation}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{client.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p>{client.emergencyContact}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Therapy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{client.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Therapy Type</p>
                    <p>{client.therapyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sessions Completed</p>
                    <p>{client.sessions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Session</p>
                    <p>May 18, 2025 at 2:00 PM</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Primary Concerns</p>
                  <p>{client.primaryConcerns}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.sessions.slice(0, 1).map((session) => (
                  <div key={session.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{session.date} - {session.time} ({session.type})</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        {session.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{session.notes}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/therapist/clients/${client.id}/sessions`}>
                    View All Sessions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Reduce anxiety in social situations</span>
                    <span className="text-green-600 font-medium">75% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="bg-therapy-purple h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Develop healthy coping strategies</span>
                    <span className="text-green-600 font-medium">60% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="bg-therapy-purple h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="pt-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.sessions.map((session) => (
                      <tr key={session.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{session.date}</td>
                        <td className="p-4">{session.time}</td>
                        <td className="p-4">{session.type}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === "Completed" ? "bg-green-100 text-green-800" :
                            session.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4">May 18, 2025</td>
                      <td className="p-4">2:00 PM</td>
                      <td className="p-4">In-person</td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                          Upcoming
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress" className="pt-6">
          <p className="text-center py-8 text-gray-500">
            The client progress view would be displayed here, similar to the Progress Tracker page but specific to {client.name}.
          </p>
        </TabsContent>
        
        <TabsContent value="notes" className="pt-6">
          <p className="text-center py-8 text-gray-500">
            Client notes and documents would be displayed here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetails;
