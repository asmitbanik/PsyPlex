import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CalendarCheck } from "lucide-react";
import clientsData from "@/data/clientsData.json";

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const client = clientId ? clientsData.clientDetails[clientId] : undefined;

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
    <div className="space-y-6 px-2 sm:px-4 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/therapist/clients">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-therapy-gray">{client.name}</h1>
            <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
              Active
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">Edit Client</Button>
          <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep w-full sm:w-auto">+ New Session</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap mb-4">
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
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[700px]">
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
