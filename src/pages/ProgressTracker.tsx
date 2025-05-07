import { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  PieChart as RechartsPortalPieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileDown, Calendar, ChevronDown, Download, ArrowUp, ArrowDown, Badge, PieChart as PieChartIcon, CalendarDays } from "lucide-react";
import ProgressMetricCard from "@/components/ProgressMetricCard";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import progressTrackerData from "@/data/progressTrackerData.json";
import { generateProgressChartData, calculateProgressMetrics } from "@/utils/chartDataGenerator";

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

const ProgressTracker = () => {
  // Use data from JSON file
  const { clientsList, attendanceData, skillsData, treatmentGoals, therapistNotes } = progressTrackerData;
  
  const [selectedClient, setSelectedClient] = useState(clientsList[0].id);
  const [chartData] = useState(generateProgressChartData);
  const [selectedMeasure, setSelectedMeasure] = useState("anxiety");
  const [chartView, setChartView] = useState("line");

  // Find the selected client
  const client = clientsList.find(c => c.id === selectedClient);

  // Calculate progress metrics
  const { currentValue, displayPercentage, isImprovement } = calculateProgressMetrics(chartData, selectedMeasure);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray">Client Progress Tracker</h1>
          <p className="text-gray-600">Monitor and analyze client improvement over time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last 3 Months
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="grid gap-2">
                <Button variant="ghost" className="justify-start font-normal">Last Month</Button>
                <Button variant="ghost" className="justify-start font-normal">Last 3 Months</Button>
                <Button variant="ghost" className="justify-start font-normal">Last 6 Months</Button>
                <Button variant="ghost" className="justify-start font-normal">Last Year</Button>
                <Button variant="ghost" className="justify-start font-normal">All Time</Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep">
            <FileDown className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressMetricCard
          title="Anxiety Levels"
          value={`${currentValue}`}
          subtitle="Scale: 0-100 (lower is better)"
          change={{
            value: displayPercentage,
            positive: selectedMeasure === "anxiety" ? isImprovement : !isImprovement
          }}
          progressValue={100 - currentValue}
          progressColor="bg-green-500"
          icon={<ArrowDown className="h-4 w-4 text-green-500" />}
        />
        
        <ProgressMetricCard
          title="Depression Score"
          value={chartData[chartData.length - 1].depression}
          subtitle="Scale: 0-100 (lower is better)"
          change={{
            value: 18,
            positive: true
          }}
          progressValue={100 - chartData[chartData.length - 1].depression}
          progressColor="bg-blue-500"
          icon={<ArrowDown className="h-4 w-4 text-blue-500" />}
        />
        
        <ProgressMetricCard
          title="Wellbeing Index"
          value={chartData[chartData.length - 1].wellbeing}
          subtitle="Scale: 0-100 (higher is better)"
          change={{
            value: 32,
            positive: true
          }}
          progressValue={chartData[chartData.length - 1].wellbeing}
          progressColor="bg-therapy-purple"
          icon={<ArrowUp className="h-4 w-4 text-therapy-purple" />}
        />
        
        <ProgressMetricCard
          title="Session Attendance"
          value="92%"
          subtitle="11 of 12 sessions attended"
          progressValue={92}
          progressColor="bg-amber-500"
          icon={<Badge className="h-4 w-4 text-amber-500" />}
        />
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
                <div>
                  <p className="text-sm text-gray-500">Next Session</p>
                  <p className="font-medium">May 14, 2025</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" size="sm">
                  <CalendarDays className="h-4 w-4 mr-2" /> Schedule Session
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance</CardTitle>
              <CardDescription>Session attendance overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPortalPieChart>
                    <Tooltip />
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => {
                        const colors = ["#7E69AB", "#94A3B8", "#E11D48"];
                        return (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        );
                      })}
                    </Pie>
                    <Legend />
                  </RechartsPortalPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

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
              <div className="flex justify-between">
                <div>
                  <CardTitle>Progress Chart</CardTitle>
                  <CardDescription>
                    Tracking changes across sessions for {client?.name}
                  </CardDescription>
                </div>
                <Select value={chartView} onValueChange={setChartView}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="radar">Skills Radar</SelectItem>
                    <SelectItem value="all">All Measures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {chartView === "line" && (
                <div className="h-[400px]">
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
                </div>
              )}
              
              {chartView === "bar" && (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={selectedMeasure} 
                        fill={
                          selectedMeasure === "anxiety" ? "#e11d48" :
                          selectedMeasure === "depression" ? "#7E69AB" :
                          "#22c55e"
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {chartView === "radar" && (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={skillsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <Radar name="Client Skills" dataKey="A" stroke="#7E69AB" fill="#9b87f5" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {chartView === "all" && (
                <div className="h-[400px]">
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
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Download Chart
              </Button>
            </CardFooter>
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
              {treatmentGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className={`font-medium ${
                      goal.progress >= 60 ? "text-green-600" : 
                      goal.progress >= 40 ? "text-amber-600" : "text-amber-600"
                    }`}>
                      {goal.progress}% Complete
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" indicatorClassName="bg-therapy-purple" />
                </div>
              ))}
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
              {therapistNotes.map((note, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <p className="text-sm text-gray-500">{note.date}</p>
                  <p className="mt-1">{note.content}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 w-full">
                View All Session Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressTracker;
