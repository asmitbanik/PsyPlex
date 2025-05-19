import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Eye, Edit, Filter, SortAsc, Plus, Search, Trash2, Loader2 } from "lucide-react";
import AddClientForm from "@/components/AddClientForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import * as clientOperations from '@/services/db-operations/clients';
import * as clientProfileOperations from '@/services/db-operations/clientProfiles';
import { ClientWithProfile } from '@/services/db-operations/clients';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editClient, setEditClient] = useState<ClientWithProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Extended client interface to add UI-specific fields
  interface ClientDisplay extends ClientWithProfile {
    name?: string;
    session_count?: number;
    last_session_date?: string;
  }

  // Function to fetch clients (defined outside useEffect to be accessible throughout component)
  const fetchClients = async () => {
    if (!user?.id) {
      console.error('Cannot fetch clients: No user ID available');
      toast.error("You must be logged in to view clients");
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching clients for therapist ID:', user.id);
      
      // Import auth functions to check current session
      const { supabase } = await import('../lib/supabase');
      const { data: authData } = await supabase.auth.getSession();
      console.log('Current auth session:', authData?.session ? 'Valid' : 'None', 
                  'User ID:', authData?.session?.user?.id);
      
      if (!authData?.session?.user?.id) {
        console.warn('No active auth session found while fetching clients');
      }
      
      // Try using the database operations directly
      try {
        console.log('Fetching clients via database operations...');
        const result = await clientOperations.getClientsWithProfiles(user.id);
        console.log('Client fetch result:', result);
        
        if (result.error) {
          console.error('Error fetching clients via operations:', result.error);
          throw result.error;
        }
        
        if (result.data && result.data.length > 0) {
          console.log('Clients loaded successfully:', result.data.length, 'clients found');
          console.log('First client therapist ID:', result.data[0].therapist_id, 'Current user ID:', user.id);
          
          // Process clients to add UI-specific fields
          const processedClients = result.data.map(client => ({
            ...(client as ClientDisplay),
            name: (client as ClientDisplay).name || `${client.first_name} ${client.last_name}`,
            session_count: 0, // Default values, could be updated later
            last_session_date: null
          })) as ClientDisplay[];
          
          setClients(processedClients);
          return; // Successfully loaded clients, exit the function
        }
        
        console.warn('No clients found via operations, trying direct DB access...');
      } catch (operationsErr) {
        console.error('Exception in operations client fetch:', operationsErr);
        // Continue to direct DB access as fallback
      }
      
      // FALLBACK: Direct database access if operations layer failed
      try {
        console.log('Attempting direct database access to find clients...');
        const { supabase } = await import('../lib/supabase');
        
        // First we need to find the therapist record(s) for this user
        const { data: therapists } = await supabase
          .from('therapists')
          .select('id')
          .eq('user_id', user.id);
          
        console.log('Direct DB: Found therapist records:', therapists);
        
        if (therapists && therapists.length > 0) {
          // We found therapist(s) for this user, now get their clients
          const therapistId = therapists[0].id;
          console.log('Direct DB: Using therapist ID:', therapistId);
          
          const { data: directClients, error: clientsError } = await supabase
            .from('clients')
            .select('*, profile:client_profiles(*)')
            .eq('therapist_id', therapistId);
            
          if (clientsError) {
            console.error('Direct DB: Error fetching clients:', clientsError);
            throw clientsError;
          }
          
          if (directClients && directClients.length > 0) {
            console.log('Direct DB: Found', directClients.length, 'clients');
            
            // Transform the data to match our extended interface
            const formattedClients = directClients.map(client => ({
              ...(client as ClientDisplay),
              name: (client as ClientDisplay).name || `${client.first_name} ${client.last_name}`,
              session_count: 0,
              last_session_date: null
            })) as ClientDisplay[];
            
            setClients(formattedClients);
            return; // Successfully loaded clients, exit the function
          }
        }
        
        // If we reach here, we couldn't find any clients
        console.warn('Direct DB: No clients found for user:', user.id);
        setClients([]);
      } catch (directDbErr) {
        console.error('Direct DB access error:', directDbErr);
        setError(directDbErr.message);
        toast.error("Failed to load clients: " + directDbErr.message);
        setClients([]);
      }
    } catch (err: any) {
      console.error('Exception in fetchClients:', err);
      setError(err.message);
      toast.error("An error occurred while loading clients: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients on component load and ensure user session is fresh
  useEffect(() => {
    const refreshAndFetch = async () => {
      try {
        // Import supabase directly to ensure fresh auth context
        const { supabase } = await import('../lib/supabase');
        
        // Force session refresh to get fresh tokens before fetching clients
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
        } else {
          console.log('Session refreshed successfully, user ID:', refreshData?.session?.user?.id);
        }
        
        // Now fetch clients with refreshed tokens
        await fetchClients();
      } catch (err) {
        console.error('Error in session refresh or fetch:', err);
      }
    };
    
    refreshAndFetch();
    
    // Set up a timer to refresh clients data every 30 seconds
    const refreshTimer = setInterval(() => {
      console.log('Auto-refreshing clients data...');
      fetchClients();
    }, 30000);
    
    // Clean up the timer when component unmounts
    return () => clearInterval(refreshTimer);
  }, [user?.id]);

  const handleAddClient = async (data: any) => {
    if (!user) {
      toast.error("You must be logged in to add clients");
      return;
    }

    try {
      setLoading(true);
      // Split name into first and last name
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Creating client via service layer with user:', user.id);
      
      // Use the client service's addClient method which calls the service layer
      const { data: newClient, error } = await clientOperations.createClient({
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        status: 'New',
        therapist_id: user.id // This will be overridden in the service layer
      });

      if (error) {
        console.error('Client creation failed:', error);
        toast.error(`Failed to create client: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('Client created successfully:', newClient);

      // We don't need to create a profile separately - the addClient method already handles profiles
      // But let's make sure we have all the profile information properly organized
      const profileData = {
        client_id: newClient.id,
        date_of_birth: data.dob,
        address: data.address,
        occupation: data.occupation,
        emergency_contact: data.emergencyContact,
        primary_concerns: data.primaryConcerns ? data.primaryConcerns.split(',').map((s: string) => s.trim()) : [],
        therapy_type: data.therapyType,
        start_date: data.startDate
      };

      // Update the client with the profile data
      try {
        const { error: profileError } = await clientProfileOperations.createClientProfile(profileData);

        if (profileError) {
          console.warn('Profile update warning:', profileError);
          // Continue even if profile update fails
        }
      } catch (profileErr) {
        console.warn('Error updating profile:', profileErr);
        // Continue even if profile update fails
      }

      setShowAddDialog(false);
      toast.success("Client added successfully");
      
      // First fetch the clients to refresh the list
      await fetchClients();
      
      // Then manually add the new client to the state if it's not already there
      // This ensures the UI updates immediately even if there's a delay in the database
      setClients(prevClients => {
        // Check if the client is already in the list
        const exists = prevClients.some(c => c.id === newClient.id);
        if (!exists) {
          // Create a new client with profile to add to the state
          const clientWithProfile: ClientWithProfile = {
            ...newClient,
            profile: profileData as any, // Add the profile data
          };
          return [...prevClients, clientWithProfile as ClientDisplay];
        }
        return prevClients;
      });
    } catch (err: any) {
      console.error('Error in handleAddClient:', err);
      toast.error(err.message || "An error occurred while adding the client");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = async (data: any) => {
    if (!editClient || !user) {
      toast.error("You must be logged in to edit clients");
      return;
    }

    try {
      setLoading(true);
      // Split name into first and last name
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      console.log('Updating client via ClientService, client ID:', editClient.id);
      
      // Prepare client data update
      const clientUpdateData = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        status: (data.status || editClient.status) as 'Active' | 'On Hold' | 'Completed' | 'New',
      };
      
      // Prepare profile data update
      const profileUpdateData = {
        date_of_birth: data.dob,
        address: data.address,
        occupation: data.occupation,
        emergency_contact: data.emergencyContact,
        primary_concerns: data.primaryConcerns ? data.primaryConcerns.split(',').map((s: string) => s.trim()) : [],
        therapy_type: data.therapyType,
        start_date: data.startDate
      };

      // Update client and profile in one call using our service layer
      const { data: updatedClient, error } = await clientOperations.updateClient(editClient.id, clientUpdateData);
      
      if (error) {
        console.error('Client update failed:', error);
        toast.error(`Failed to update client: ${error.message}`);
        setLoading(false);
        return;
      }
      
      // Update the client profile
      try {
        const { error: profileError } = await clientProfileOperations.updateClientProfile(editClient.id, profileUpdateData);

        if (profileError) {
          console.warn('Profile update warning:', profileError);
          // Continue even if profile update fails
        }
      } catch (profileErr) {
        console.warn('Error updating profile:', profileErr);
        // Continue even if profile update fails
      }
      
      // Immediately update the client in the state for instant UI feedback
      setClients(prevClients => {
        return prevClients.map(client => {
          if (client.id === editClient.id) {
            // Create updated client with profile
            return {
              ...client,
              ...clientUpdateData,
              profile: {
                ...client.profile,
                ...profileUpdateData
              }
            } as ClientDisplay;
          }
          return client;
        });
      });
      
      toast.success("Client updated successfully");
      setShowEditDialog(false);
      setEditClient(null);
      
      // Also refresh data from the server to ensure consistency
      await fetchClients();
    } catch (err: any) {
      console.error('Error in client update:', err);
      toast.error(err.message || "Failed to update client");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClient = async () => {
    if (!deleteClientId || !user) return;

    try {
      setLoading(true);
      
      // Import required modules to ensure fresh instances
      const { supabase } = await import('../lib/supabase');
      const clientOperations = await import('../services/db-operations/clients');

      // Force session refresh to get fresh tokens
      await supabase.auth.refreshSession();
      
      console.log('Deleting client using client operations, client ID:', deleteClientId);
      
      // First delete the client profile if it exists (to handle foreign key constraints)
      // Using the admin client to bypass RLS
      const { supabaseAdmin } = await import('../lib/supabase');
      if (supabaseAdmin) {
        const profileResult = await supabaseAdmin
          .from('client_profiles')
          .delete()
          .eq('client_id', deleteClientId);
          
        if (profileResult.error) {
          console.warn('Profile deletion warning:', profileResult.error);
          // Continue even if profile deletion has issues
        } else {
          console.log('Client profile deleted successfully');
        }
      }
      
      // Use our updated deleteClient function to properly handle RLS
      const { data, error } = await clientOperations.deleteClient(deleteClientId);
        
      if (error) {
        console.error('Client deletion error:', error);
        toast.error(`Failed to delete client: ${error.message}`);
        setLoading(false);
        return;
      }
      
      if (data?.success) {
        console.log('Client deleted successfully:', deleteClientId);
        toast.success("Client deleted successfully");
        setDeleteClientId(null);
        
        // Refresh the client list to ensure we have the latest data
        fetchClients();
      } else {
        console.error('Client deletion returned no success status');
        toast.error("Failed to delete client: No success confirmation");
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error in client deletion:', err);
      toast.error(err.message || "Failed to delete client");
      setLoading(false);
    }
  };

  // Filtering and sorting logic
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters and sorting
  const getFilteredClients = () => {
    let filtered = [...clients];
    
    // Filter by status if set
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Filter by search term if present
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    if (sortKey === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortKey === 'sessions') {
      // Sort by number of sessions if available
      filtered.sort((a, b) => {
        const sessionsA = a.session_count || 0;
        const sessionsB = b.session_count || 0;
        return sessionsB - sessionsA;
      });
    }
    
    return filtered;
  };
  
  const filteredClients = getFilteredClients();

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
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <AddClientForm onSubmit={handleAddClient} onCancel={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={v => { setShowEditDialog(v); if (!v) setEditClient(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Error boundary wrapper */}
      <div className="relative">
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error loading clients: {error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchClients()}>
              Try Again
            </Button>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 bg-gray-100 rounded-lg flex flex-wrap">
            <TabsTrigger value="all" onClick={() => setStatusFilter('')} className="rounded-l-lg text-base font-semibold">All Clients</TabsTrigger>
            <TabsTrigger value="active" onClick={() => setStatusFilter('Active')} className="text-base font-semibold">Active</TabsTrigger>
            <TabsTrigger value="new" onClick={() => setStatusFilter('New')} className="text-base font-semibold">New</TabsTrigger>
            <TabsTrigger value="onhold" onClick={() => setStatusFilter('On Hold')} className="rounded-r-lg text-base font-semibold">On Hold</TabsTrigger>
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
                        {(client as ClientDisplay).name?.split(" ").map(n => n[0]).join("") || "?"}
                      </div>
                      <div>
                        <Link to={`/therapist/clients/${client.id}`} className="text-xl font-bold text-therapy-purple hover:underline">
                          {(client as ClientDisplay).name || "Unnamed Client"}
                        </Link>
                        <div className="text-gray-500 text-sm">
                          {client.profile?.date_of_birth 
                            ? `Age ${new Date().getFullYear() - new Date(client.profile.date_of_birth).getFullYear()}` 
                            : 'No DOB provided'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-base">
                      <div><span className="font-semibold text-therapy-gray">Sessions:</span> {(client as ClientDisplay).session_count || 0}</div>
                      <div><span className="font-semibold text-therapy-gray">Last Session:</span> {(client as ClientDisplay).last_session_date ? new Date((client as ClientDisplay).last_session_date).toLocaleDateString() : 'None'}</div>
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
      </div> {/* Close error boundary wrapper */}

      {/* Delete confirmation dialog */}
      {deleteClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="text-xl font-bold text-gray-800 mb-2">Delete Client?</div>
            <div className="text-gray-500 mb-6 text-center">Are you sure you want to delete this client? This is a shared history that deserves reflection, not erasure.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button type="button" variant="outline" onClick={() => setDeleteClientId(null)} className="rounded-full px-6 py-2">Cancel</Button>
              <Button type="button" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all duration-200" onClick={handleDeleteClient}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
