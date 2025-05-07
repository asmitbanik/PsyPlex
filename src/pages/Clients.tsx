import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clientsData from "@/data/clientsData.json";

const Clients = () => {
  // Use data from JSON file
  const { clients } = clientsData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray">Clients</h1>
          <p className="text-gray-600">Manage and view your client information</p>
        </div>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">
          + Add New Client
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative grow">
          <Input
            placeholder="Search clients..."
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="onhold">On Hold</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Age</th>
                      <th className="text-left p-4">Sessions</th>
                      <th className="text-left p-4">Last Session</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Link to={`/therapist/clients/${client.id}`} className="font-medium text-therapy-purple hover:underline">
                            {client.name}
                          </Link>
                        </td>
                        <td className="p-4">{client.age}</td>
                        <td className="p-4">{client.sessions}</td>
                        <td className="p-4">{client.lastSession}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === "Active" ? "bg-green-100 text-green-800" :
                            client.status === "New" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/therapist/clients/${client.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default Clients;
