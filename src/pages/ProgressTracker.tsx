
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileDown, 
  Calendar, 
  ChevronDown, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  CalendarDays, 
  Activity,
  CheckCircle,
  CircleMinus
} from "lucide-react";
import ProgressMetricCard from "@/components/ProgressMetricCard";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import progressTrackerData from "@/data/progressTrackerData.json";
import { 
  generateProgressChartData, 
  calculateProgressMetrics, 
  generateTrendIndicator, 
  formatSessionDate 
} from "@/utils/chartDataGenerator";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "@/hooks/use-toast";

const ProgressTracker = () => {
  // Use data from JSON file
  const { clientsList, attendanceData, skillsData, treatmentGoals, therapistNotes, sessionHistory } = progressTrackerData;
  
  const [selectedClient, setSelectedClient] = useState(clientsList[0].id);
  const [chartData] = useState(generateProgressChartData);
  const [selectedMeasure, setSelectedMeasure] = useState("anxiety");
  const [chartView, setChartView] = useState("line");
  const [timeRange, setTimeRange] = useState("3months");

  // Find the selected client
  const client = clientsList.find(c => c.id === selectedClient);

  // Calculate progress metrics
  const { currentValue, displayPercentage, isImprovement } = calculateProgressMetrics(chartData, selectedMeasure);
  
  // Generate trend indicator
  const trendIndicator = generateTrendIndicator(displayPercentage, isImprovement);

  const handleExportReport = () => {
    toast({
      title: "Report exported",
      description: `Progress report for ${client?.name} has been exported successfully.`,
    });
  };

  const timeRangeOptions = {
    "1month": "Last Month",
    "3months": "Last 3 Months",
    "6months": "Last 6 Months",
    "12months": "Last Year",
    "all": "All Time"
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-therapy-gray">Client Progress Tracker</h1>
          <p className="text-muted-foreground">Track therapeutic outcomes and measure clinical progress</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {timeRangeOptions[timeRange as keyof typeof timeRangeOptions]}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="end">
              <div className="grid gap-1">
                {Object.entries(timeRangeOptions).map(([key, value]) => (
                  <Button 
                    key={key}
                    variant={timeRange === key ? "secondary" : "ghost"} 
                    className="justify-start font-normal"
                    onClick={() => setTimeRange(key)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            className="bg-therapy-purple hover:bg-therapy-purpleDeep flex items-center gap-1"
            onClick={handleExportReport}
          >
            <FileDown className="h-4 w-4" /> Export Report
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
          trendIndicator={trendIndicator}
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
          trendIndicator="improving"
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
          trendIndicator="significant-improvement"
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
          icon={<CheckCircle className="h-4 w-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-therapy-offwhite">
              <CardTitle className="text-lg">Select Client</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="border-0 bg-therapy-offwhite">
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
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-therapy-offwhite pb-2">
                <CardTitle className="text-lg">Client Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                  <p className="font-medium">8 of 12</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">92%</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Excellent
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Treatment</p>
                  <p className="font-medium">Cognitive Behavioral Therapy</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Session</p>
                  <p className="font-medium">May 14, 2025</p>
                </div>
              </CardContent>
              <CardFooter className="bg-therapy-offwhite">
                <Button variant="outline" className="w-full border border-therapy-purple text-therapy-purple hover:bg-therapy-purpleLight" size="sm">
                  <CalendarDays className="h-4 w-4 mr-2" /> Schedule Session
                </Button>
              </CardFooter>
            </Card>
          )}

          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-therapy-offwhite pb-2">
              <CardTitle className="text-lg">Attendance</CardTitle>
              <CardDescription>Session attendance overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-therapy-offwhite pb-2">
              <CardTitle className="text-lg">Progress Summary</CardTitle>
              <CardDescription>Changes since first session</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center">
                      <span className={`text-2xl font-bold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                        {isImprovement ? '+' : '-'}{displayPercentage}%
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {isImprovement ? 'Improvement' : 'Regression'}
                      </span>
                    </div>
                  </div>
                  <Select value={selectedMeasure} onValueChange={setSelectedMeasure}>
                    <SelectTrigger className="w-36 border-0 bg-therapy-offwhite">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                      <SelectItem value="depression">Depression</SelectItem>
                      <SelectItem value="wellbeing">Wellbeing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className={`p-1.5 rounded-full ${
                    trendIndicator === "significant-improvement" ? "bg-green-100" :
                    trendIndicator === "improving" ? "bg-green-50" :
                    trendIndicator === "stable" ? "bg-gray-100" :
                    trendIndicator === "declining" ? "bg-amber-100" :
                    "bg-red-100"
                  }`}>
                    {trendIndicator === "significant-improvement" && <ArrowUp className="h-4 w-4 text-green-600" />}
                    {trendIndicator === "improving" && <ArrowUp className="h-4 w-4 text-green-500" />}
                    {trendIndicator === "stable" && <Activity className="h-4 w-4 text-gray-500" />}
                    {trendIndicator === "declining" && <ArrowDown className="h-4 w-4 text-amber-600" />}
                    {trendIndicator === "significant-decline" && <ArrowDown className="h-4 w-4 text-red-600" />}
                  </div>
                  <span className="text-sm font-medium">
                    {
                      trendIndicator === "significant-improvement" ? "Significant improvement" :
                      trendIndicator === "improving" ? "Steady improvement" :
                      trendIndicator === "stable" ? "Stable" :
                      trendIndicator === "declining" ? "Slight decline" :
                      "Significant decline"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-therapy-offwhite pb-2">
              <CardTitle className="text-lg">Session History</CardTitle>
              <CardDescription>Recent therapy sessions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {sessionHistory.map((session) => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{formatSessionDate(session.date)}</p>
                      <p className="text-xs text-muted-foreground">{session.focusArea}</p>
                    </div>
                    <div>
                      {session.attendance === "attended" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Attended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <CircleMinus className="h-3 w-3 mr-1" /> Canceled
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full shadow-md border-0">
            <CardHeader className="bg-therapy-offwhite">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Progress Chart</CardTitle>
                  <CardDescription>
                    Tracking changes across sessions for {client?.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className={chartView === "line" ? "bg-therapy-purple text-white" : ""}
                    onClick={() => setChartView("line")}
                  >
                    <Activity className="h-4 w-4 mr-1" /> Line
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={chartView === "bar" ? "bg-therapy-purple text-white" : ""}
                    onClick={() => setChartView("bar")}
                  >
                    <BarChartIcon className="h-4 w-4 mr-1" /> Bar
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={chartView === "radar" ? "bg-therapy-purple text-white" : ""}
                    onClick={() => setChartView("radar")}
                  >
                    <PieChartIcon className="h-4 w-4 mr-1" /> Radar
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={chartView === "all" ? "bg-therapy-purple text-white" : ""}
                    onClick={() => setChartView("all")}
                  >
                    <Activity className="h-4 w-4 mr-1" /> All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="bg-therapy-offwhite border-0">
                  <div className="h-3 w-3 rounded-full bg-therapy-purple mr-1"></div> Anxiety
                </Badge>
                <Badge variant="outline" className="bg-therapy-offwhite border-0">
                  <div className="h-3 w-3 rounded-full bg-therapy-purpleDeep mr-1"></div> Depression
                </Badge>
                <Badge variant="outline" className="bg-therapy-offwhite border-0">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div> Wellbeing
                </Badge>
              </div>
              
              {chartView === "line" && (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="session" tick={{ fill: '#666' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#666' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #eee'
                        }} 
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={selectedMeasure}
                        stroke={
                          selectedMeasure === "anxiety" ? "#e11d48" :
                          selectedMeasure === "depression" ? "#7E69AB" :
                          "#22c55e"
                        }
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2, fill: "white" }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="session" tick={{ fill: '#666' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#666' }} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #eee'
                        }} 
                      />
                      <Legend />
                      <Bar 
                        dataKey={selectedMeasure} 
                        fill={
                          selectedMeasure === "anxiety" ? "#e11d48" :
                          selectedMeasure === "depression" ? "#7E69AB" :
                          "#22c55e"
                        }
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {chartView === "radar" && (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={skillsData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#666' }} />
                      <Radar 
                        name="Client Skills" 
                        dataKey="A" 
                        stroke="#7E69AB" 
                        fill="#9b87f5" 
                        fillOpacity={0.6} 
                      />
                      <Legend />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #eee'
                        }} 
                      />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="session" tick={{ fill: '#666' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#666' }} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #eee'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="anxiety" 
                        stroke="#e11d48" 
                        strokeWidth={3} 
                        dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="depression" 
                        stroke="#7E69AB" 
                        strokeWidth={3} 
                        dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="wellbeing" 
                        stroke="#22c55e" 
                        strokeWidth={3} 
                        dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4 bg-therapy-offwhite">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-2" /> Download Chart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md border-0">
          <CardHeader className="bg-therapy-offwhite">
            <CardTitle>Treatment Goals</CardTitle>
            <CardDescription>
              Progress toward established therapeutic goals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {treatmentGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.name}</span>
                    <span className={`font-medium ${
                      goal.progress >= 60 ? "text-green-600" : 
                      goal.progress >= 40 ? "text-amber-600" : "text-gray-600"
                    }`}>
                      {goal.progress}% Complete
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full mr-4">
                      <Progress 
                        value={goal.progress} 
                        className="h-2.5 bg-gray-100" 
                        indicatorClassName={
                          goal.progress >= 60 ? "bg-green-500" : 
                          goal.progress >= 40 ? "bg-amber-500" : 
                          "bg-therapy-purple"
                        } 
                      />
                    </div>
                    <div className="shrink-0">
                      <Badge className={
                        goal.progress >= 75 ? "bg-green-50 text-green-700 border-green-200" : 
                        goal.progress >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" : 
                        goal.progress >= 25 ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }>
                        {
                          goal.progress >= 75 ? "On Track" : 
                          goal.progress >= 50 ? "Making Progress" : 
                          goal.progress >= 25 ? "Just Started" :
                          "Not Started"
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="mt-2 w-full border border-therapy-purple text-therapy-purple hover:bg-therapy-purpleLight">
                Manage Goals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader className="bg-therapy-offwhite">
            <CardTitle>Therapist Notes</CardTitle>
            <CardDescription>
              Key observations and progress notes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {therapistNotes.map((note, index) => (
                <div key={index} className="p-4 border rounded-md bg-therapy-offwhite hover:bg-therapy-purpleLight transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-therapy-purpleDeep">{note.date}</p>
                    <Badge variant="outline" className="bg-white">Session Note</Badge>
                  </div>
                  <p className="mt-2 text-sm">{note.content}</p>
                </div>
              ))}
              <Button variant="outline" className="mt-2 w-full border border-therapy-purple text-therapy-purple hover:bg-therapy-purpleLight">
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
