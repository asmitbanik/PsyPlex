import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import clientsData from "@/data/clientsData.json";
import { User, Eye, Edit, MessageCircle, Filter, SortAsc, Plus, Search } from "lucide-react";

const Clients = () => {
  // Use data from JSON file
  const { clients } = clientsData;

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-therapy-gray mb-1">Clients</h1>
          <p className="text-lg text-gray-600">Manage and view your client information</p>
        </div>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-6 py-3 text-base font-semibold shadow-md flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Client
        </Button>
      </div>

      {/* Controls Card */}
      <Card className="shadow-lg rounded-2xl border border-gray-200 mb-2">
        <CardContent className="py-6 px-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative grow">
            <Input
              placeholder="Search clients..."
              className="pl-10 rounded-full h-12 text-base shadow-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full h-12 px-6 text-base font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </Button>
            <Button variant="outline" className="rounded-full h-12 px-6 text-base font-semibold flex items-center gap-2">
              <SortAsc className="h-5 w-5" />
              Sort
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg">
          <TabsTrigger value="all" className="rounded-l-lg text-base font-semibold">All Clients</TabsTrigger>
          <TabsTrigger value="active" className="text-base font-semibold">Active</TabsTrigger>
          <TabsTrigger value="new" className="text-base font-semibold">New</TabsTrigger>
          <TabsTrigger value="onhold" className="rounded-r-lg text-base font-semibold">On Hold</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
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
                  <div className="flex flex-row gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold" asChild>
                      <Link to={`/therapist/clients/${client.id}`}><Eye className="h-4 w-4" /> View</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2 font-semibold">
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full flex items-center gap-2 font-semibold text-white">
                      <MessageCircle className="h-4 w-4" /> Message
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
    </div>
  );
};

export default Clients;
