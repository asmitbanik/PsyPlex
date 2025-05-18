import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CalendarCheck, Loader2 } from "lucide-react";
import { ClientService, ClientWithProfile } from "@/services/ClientService";
import { SessionService } from "@/services/SessionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ClientDetails = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const clientService = new ClientService();
  const sessionService = new SessionService();
  
  const [client, setClient] = useState<ClientWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const { data, error } = await clientService.getClientById(clientId);
        
        if (error) {
          setError(error.message);
          toast.error("Failed to load client details");
          return;
        }
        
        if (data) {
          setClient(data);
        } else {
          setError("Client not found");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error("An error occurred while loading client details");
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-therapy-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button asChild>
          <Link to="/therapist/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-therapy-purple mb-4" />
        <p className="text-lg text-gray-500">Loading client details...</p>
      </div>
    );
  }
  
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500 mb-4">
          {error || "Client not found"}
        </p>
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
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              client.status === "Active" ? "bg-green-100 text-green-800" :
              client.status === "New" ? "bg-blue-100 text-blue-800" :
              client.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {client.status || "Unknown"}
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
                    <p>{client.profile?.date_of_birth || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p>{client.profile?.occupation || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{client.profile?.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p>{client.profile?.emergency_contact || 'Not provided'}</p>
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
                    <p>{client.profile?.start_date || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Therapy Type</p>
                    <p>{client.profile?.therapy_type || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sessions Completed</p>
                    <p>{client.session_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Session</p>
                    <p>May 18, 2025 at 2:00 PM</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Primary Concerns</p>
                  <p>{client.profile?.primary_concerns?.join(', ') || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Session Notes</CardTitle>
              <CardDescription>
                {client.session_count ? "Most recent session notes" : "No sessions recorded yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.session_count > 0 ? (
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Last session: {client.last_session_date || 'No date available'}</p>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-600">Session notes will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No sessions recorded yet</p>
                  </div>
                )}
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
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Sessions History</CardTitle>
                <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep">
                  Schedule Session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {client.session_count > 0 ? (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Duration</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-4">{client.last_session_date || 'Unknown'}</td>
                        <td className="p-4">60 min</td>
                        <td className="p-4">Video</td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                            Completed
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-4">{new Date().toLocaleDateString()}</td>
                        <td className="p-4">45 min</td>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sessions recorded for this client yet.
                </div>
              )}
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
