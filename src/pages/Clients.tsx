import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clientsData from "@/data/clientsData.json";
import { User, Eye, Edit, MessageCircle, Filter, SortAsc, Plus, Search, Trash2 } from "lucide-react";
import AddClientForm from "@/components/AddClientForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

const Clients = () => {
  // Use data from JSON file
  const { clients: initialClients } = clientsData;
  const [clients, setClients] = useState(initialClients);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddClient = (data: any) => {
    const newClient = {
      id: (clients.length + 1).toString(),
      name: data.name,
      age: data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : '',
      sessions: 0,
      lastSession: '',
      status: 'New',
      ...data,
    };
    setClients([newClient, ...clients]);
    setShowAddDialog(false);
  };

  const handleEditClient = (data: any) => {
    setClients(clients.map(c => c.id === editClient.id ? { ...c, ...data } : c));
    setShowEditDialog(false);
    setEditClient(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    setDeleteClientId(null);
  };

  // Filtering and sorting logic
  let filteredClients = [...clients];
  if (statusFilter) {
    filteredClients = filteredClients.filter(c => c.status === statusFilter);
  }
  if (sortKey === 'name') {
    filteredClients.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortKey === 'sessions') {
    filteredClients.sort((a, b) => b.sessions - a.sessions);
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
            {...(editClient ? { initialData: editClient } : {})}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="shadow-lg rounded-2xl border border-gray-200 flex flex-col h-full">
                <CardContent className="p-6 flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-therapy-purple/10 text-therapy-purple text-2xl font-bold">
                      {client.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <Link to={`/therapist/clients/${client.id}`} className="text-xl font-bold text-therapy-purple hover:underline">
                        {client.name}
                      </Link>
                      <div className="text-gray-500 text-sm">Age {client.age}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-base">
                    <div><span className="font-semibold text-therapy-gray">Sessions:</span> {client.sessions}</div>
                    <div><span className="font-semibold text-therapy-gray">Last Session:</span> {client.lastSession}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      client.status === "Active" ? "bg-green-100 text-green-800" :
                      client.status === "New" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {client.status}
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
};

export default Clients;
