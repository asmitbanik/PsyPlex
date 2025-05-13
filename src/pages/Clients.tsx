import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Eye, Edit, Filter, SortAsc, Plus, Search, Trash2, Loader2 } from "lucide-react";
import AddClientForm from "@/components/AddClientForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { ClientService, ClientWithProfile } from "@/services/ClientService";
import { toast } from "sonner";

export default function Clients() {
  const { user } = useAuth();
  const clientService = new ClientService();
  const [clients, setClients] = useState<ClientWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editClient, setEditClient] = useState<ClientWithProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch clients on component load
  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await clientService.getClientsWithProfiles(user.id);
        
        if (error) {
          setError(error.message);
          toast.error("Failed to load clients");
          return;
        }
        
        if (data) {
          setClients(data);
        }
      } catch (err: any) {
        setError(err.message);
        toast.error("An error occurred while loading clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user?.id]);

  const handleAddClient = async (data: any) => {
    if (!user?.id) {
      toast.error("You must be logged in to add clients");
      return;
    }

    try {
      // Split name into first and last name
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        status: 'New' as 'Active' | 'On Hold' | 'Completed' | 'New',
        therapist_id: user.id
      };

      const profileData = {
        date_of_birth: data.dob,
        address: data.address,
        occupation: data.occupation,
        emergency_contact: data.emergencyContact,
        primary_concerns: data.primaryConcerns ? data.primaryConcerns.split(',').map((s: string) => s.trim()) : [],
        therapy_type: data.therapyType,
        start_date: data.startDate
      };

      const { data: newClient, error } = await clientService.createClientWithProfile(clientData, profileData);
      
      if (error) {
        toast.error("Failed to create client");
        return;
      }

      if (newClient) {
        toast.success("Client added successfully");
        // Update local state with the new client
        setClients([newClient, ...clients]);
        setShowAddDialog(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add client");
    }
  };

  const handleEditClient = async (data: any) => {
    if (!editClient?.id) return;

    try {
      // Split name into first and last name
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update client data
      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        status: data.status as 'Active' | 'On Hold' | 'Completed' | 'New' || editClient.status,
        updated_at: new Date().toISOString(),
      };

      // Update profile data
      const profileData = {
        date_of_birth: data.dob,
        address: data.address,
        occupation: data.occupation,
        emergency_contact: data.emergencyContact,
        primary_concerns: data.primaryConcerns ? data.primaryConcerns.split(',').map((s: string) => s.trim()) : [],
        therapy_type: data.therapyType,
        start_date: data.startDate,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedClient, error } = await clientService.updateClientWithProfile(
        editClient.id, 
        clientData, 
        profileData,
        editClient.profile?.id
      );
      
      if (error) {
        toast.error("Failed to update client");
        return;
      }

      if (updatedClient) {
        toast.success("Client updated successfully");
        // Update local state
        setClients(clients.map(c => c.id === editClient.id ? updatedClient : c));
        setShowEditDialog(false);
        setEditClient(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await clientService.delete(id);
      
      if (error) {
        toast.error("Failed to delete client");
        return;
      }
      
      toast.success("Client deleted successfully");
      setClients(clients.filter(c => c.id !== id));
      setDeleteClientId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client");
    }
  };

  // Filtering and sorting logic
  let filteredClients = [...clients];
  if (statusFilter) {
    filteredClients = filteredClients.filter(c => c.status === statusFilter);
  }
  if (sortKey === 'name') {
    filteredClients.sort((a, b) => {
      if (!a.name && !b.name) return 0;
      if (!a.name) return 1;
      if (!b.name) return -1;
      return a.name.localeCompare(b.name);
    });
  } else if (sortKey === 'sessions') {
    // Sort by number of sessions if available
    filteredClients.sort((a, b) => {
      const sessionsA = a.session_count || 0;
      const sessionsB = b.session_count || 0;
      return sessionsB - sessionsA;
    });
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-2 sm:px-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-therapy-gray mb-1">Clients</h1>
          <p className="text-base sm:text-lg text-gray-600">Manage and view your client information</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-6 py-3 text-base font-semibold shadow-md flex items-center gap-2 w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Add New Client
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <AddClientForm onSubmit={handleAddClient} onCancel={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={v => { setShowEditDialog(v); if (!v) setEditClient(null); }}>
        <DialogContent>
          <AddClientForm
            onSubmit={handleEditClient}
            onCancel={() => { setShowEditDialog(false); setEditClient(null); }}
            initialData={editClient}
          />
        </DialogContent>
      </Dialog>

      {/* Controls Card */}
      <Card className="shadow-lg rounded-2xl border border-gray-200 mb-2">
        <CardContent className="py-6 px-2 sm:px-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative grow w-full md:w-auto">
            <Input
              placeholder="Search clients..."
              className="pl-10 rounded-full h-12 text-base shadow-sm w-full"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
                <SortAsc className="h-5 w-5" />
              </span>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value)}
                className="rounded-full h-12 pl-12 pr-6 text-base font-semibold border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-therapy-purple w-full sm:w-auto min-w-[120px] appearance-none"
              >
                <option value="">Sort</option>
                <option value="name">Name</option>
                <option value="sessions">Sessions</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg flex flex-wrap">
          <TabsTrigger value="all" className="rounded-l-lg text-base font-semibold">All Clients</TabsTrigger>
          <TabsTrigger value="active" className="text-base font-semibold">Active</TabsTrigger>
          <TabsTrigger value="new" className="text-base font-semibold">New</TabsTrigger>
          <TabsTrigger value="onhold" className="rounded-r-lg text-base font-semibold">On Hold</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-therapy-purple" />
              <p className="ml-2 text-therapy-purple">Loading clients...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Failed to load clients</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-therapy-purple/10 mb-4">
                <User className="h-8 w-8 text-therapy-purple" />
              </div>
              <h3 className="text-xl font-semibold text-therapy-gray mb-2">No clients yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first client</p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-therapy-purple hover:bg-therapy-purpleDeep"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <Card key={client.id} className="shadow-lg rounded-2xl border border-gray-200 flex flex-col h-full">
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-therapy-purple/10 text-therapy-purple text-2xl font-bold">
                        {client.name?.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <div>
                        <Link to={`/therapist/clients/${client.id}`} className="text-xl font-bold text-therapy-purple hover:underline">
                          {client.name || "Unnamed Client"}
                        </Link>
                        <div className="text-gray-500 text-sm">
                          {client.profile?.date_of_birth 
                            ? `Age ${new Date().getFullYear() - new Date(client.profile.date_of_birth).getFullYear()}` 
                            : 'No DOB provided'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-base">
                      <div><span className="font-semibold text-therapy-gray">Sessions:</span> {client.session_count || 0}</div>
                      <div><span className="font-semibold text-therapy-gray">Last Session:</span> {client.last_session_date || 'No sessions yet'}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        client.status === "Active" ? "bg-green-100 text-green-800" :
                        client.status === "New" ? "bg-blue-100 text-blue-800" :
                        client.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {client.status || "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full">
                      <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold w-full sm:w-auto min-w-[90px] justify-center py-2 px-4 text-base" asChild>
                        <Link to={`/therapist/clients/${client.id}`}><Eye className="h-4 w-4" /> View</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white w-full sm:w-auto min-w-[90px] justify-center py-2 px-4 text-base"
                        onClick={() => { setEditClient(client); setShowEditDialog(true); }}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 rounded-full flex items-center gap-2 font-semibold text-white w-full sm:w-auto min-w-[90px] justify-center py-2 px-4 text-base shadow-md"
                        onClick={() => setDeleteClientId(client.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <p className="text-center py-8 text-gray-500">
            Filter view for active clients would appear here
          </p>
        </TabsContent>
        
        <TabsContent value="new">
          <p className="text-center py-8 text-gray-500">
            Filter view for new clients would appear here
          </p>
        </TabsContent>
        
        <TabsContent value="onhold">
          <p className="text-center py-8 text-gray-500">
            Filter view for on-hold clients would appear here
          </p>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      {deleteClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="text-xl font-bold text-gray-800 mb-2">Delete Client?</div>
            <div className="text-gray-500 mb-6 text-center">Are you sure you want to delete this client? This is a shared history that deserves reflection, not erasure.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button type="button" variant="outline" onClick={() => setDeleteClientId(null)} className="rounded-full px-6 py-2">Cancel</Button>
              <Button type="button" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all duration-200" onClick={() => handleDeleteClient(deleteClientId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
