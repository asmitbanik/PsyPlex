
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";

// Mock data for the progress chart
const generateMockData = () => {
  const sessions = [1, 2, 3, 4, 5, 6, 7, 8];
  return sessions.map(session => ({
    session: `Session ${session}`,
    anxiety: Math.floor(Math.random() * 30) + 50 - session * 3, // Decreasing trend
    depression: Math.floor(Math.random() * 25) + 45 - session * 2, // Decreasing trend
    wellbeing: Math.floor(Math.random() * 20) + 40 + session * 4, // Increasing trend
  }));
};

const clientsList = [
  { id: "1", name: "Sarah Johnson" },
  { id: "2", name: "Michael Chen" },
  { id: "3", name: "Emily Rodriguez" },
  { id: "4", name: "James Wilson" },
  { id: "5", name: "Emma Davis" },
];

const ProgressTracker = () => {
  const [selectedClient, setSelectedClient] = useState(clientsList[0].id);
  const [chartData] = useState(generateMockData);
  const [selectedMeasure, setSelectedMeasure] = useState("anxiety");

  // Find the selected client
  const client = clientsList.find(c => c.id === selectedClient);

  // Calculate progress metrics
  const initialValue = chartData[0][selectedMeasure];
  const currentValue = chartData[chartData.length - 1][selectedMeasure];
  const changePercentage = Math.round(((initialValue - currentValue) / initialValue) * 100);
  
  // For wellbeing, we want to show improvement as a positive percentage
  const displayPercentage = selectedMeasure === "wellbeing" ? 
    Math.abs(Math.round(((currentValue - initialValue) / initialValue) * 100)) :
    Math.abs(changePercentage);
  
  const isImprovement = (selectedMeasure === "wellbeing" && currentValue > initialValue) || 
                        (selectedMeasure !== "wellbeing" && currentValue < initialValue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray">Client Progress Tracker</h1>
          <p className="text-gray-600">Monitor and analyze client improvement over time</p>
        </div>
        <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">
          <FileDown className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsList.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sessions Completed</p>
                  <p className="font-medium">8 of 12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                  <p className="font-medium">92%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Treatment</p>
                  <p className="font-medium">Cognitive Behavioral Therapy</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Summary</CardTitle>
              <CardDescription>Changes since first session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                      {isImprovement ? '+' : '-'}{displayPercentage}%
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {isImprovement ? 'Improvement' : 'Regression'}
                    </span>
                  </div>
                </div>
                <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anxiety">Anxiety</SelectItem>
                    <SelectItem value="depression">Depression</SelectItem>
                    <SelectItem value="wellbeing">Wellbeing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Progress Chart</CardTitle>
              <CardDescription>
                Tracking changes across sessions for {client?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="line">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="line">Line Chart</TabsTrigger>
                    <TabsTrigger value="all">All Measures</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="line" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={selectedMeasure}
                        stroke={
                          selectedMeasure === "anxiety" ? "#e11d48" :
                          selectedMeasure === "depression" ? "#7E69AB" :
                          "#22c55e"
                        }
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="all" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="anxiety" stroke="#e11d48" strokeWidth={2} />
                      <Line type="monotone" dataKey="depression" stroke="#7E69AB" strokeWidth={2} />
                      <Line type="monotone" dataKey="wellbeing" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Treatment Goals</CardTitle>
            <CardDescription>
              Progress toward established therapeutic goals
            </CardDescription>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Improve work-life balance</span>
                  <span className="text-green-600 font-medium">40% Complete</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="bg-therapy-purple h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Therapist Notes</CardTitle>
            <CardDescription>
              Key observations and progress notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <p className="text-sm text-gray-500">Session 8 - May 1, 2025</p>
                <p className="mt-1">
                  Client continues to make good progress with anxiety management techniques. 
                  Reported using deep breathing exercises effectively during a stressful work presentation. 
                  Still experiencing some avoidance behaviors in certain social settings.
                </p>
              </div>
              <div className="p-3 border rounded-md">
                <p className="text-sm text-gray-500">Session 6 - April 17, 2025</p>
                <p className="mt-1">
                  Significant breakthrough today in identifying core beliefs related to perfectionism. 
                  Client showed good insight into how these beliefs affect work performance and relationships. 
                  Homework compliance has improved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressTracker;
