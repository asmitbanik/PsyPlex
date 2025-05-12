import { useState } from "react";
import progressTrackerData from "@/data/progressTrackerData.json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, Circle, User, CalendarCheck, CheckCircle, TrendingUp, ClipboardList, Calendar, Edit2 } from "lucide-react";

const ProgressTracker = () => {
  const [selectedClientId, setSelectedClientId] = useState(progressTrackerData.clientsList[0].id);
  const selectedClient = progressTrackerData.clientsList.find(c => c.id === selectedClientId);

  // Mocked metrics for the summary cards
  const metrics = [
    {
      label: "Anxiety Levels",
      value: 40,
      trend: 26,
      trendColor: "text-therapy-green",
      icon: <ArrowDownRight className="h-6 w-6" />,
      barColor: "bg-therapy-green",
      barBg: "bg-therapy-green/20",
      subtitle: "Scale: 0-100 (lower is better)",
      accent: "bg-therapy-green/10 text-therapy-green"
    },
    {
      label: "Depression Score",
      value: 35,
      trend: 18,
      trendColor: "text-therapy-green",
      icon: <ArrowDownRight className="h-6 w-6" />,
      barColor: "bg-therapy-blue",
      barBg: "bg-therapy-blue/20",
      subtitle: "Scale: 0-100 (lower is better)",
      accent: "bg-therapy-blue/10 text-therapy-blue"
    },
    {
      label: "Wellbeing Index",
      value: 80,
      trend: 32,
      trendColor: "text-therapy-purple",
      icon: <ArrowUpRight className="h-6 w-6" />,
      barColor: "bg-therapy-purple",
      barBg: "bg-therapy-purple/20",
      subtitle: "Scale: 0-100 (higher is better)",
      accent: "bg-therapy-purple/10 text-therapy-purple"
    },
    {
      label: "Session Attendance",
      value: 92,
      trend: null,
      trendColor: "text-therapy-orange",
      icon: <Circle className="h-6 w-6" />,
      barColor: "bg-therapy-orange",
      barBg: "bg-therapy-orange/20",
      subtitle: "11 of 12 sessions attended",
      accent: "bg-therapy-orange/10 text-therapy-orange"
    }
  ];

  const treatmentGoals = progressTrackerData.treatmentGoals;
  const therapistNotes = progressTrackerData.therapistNotes;

  return (
    <div className="px-2 sm:px-4 py-6 bg-therapy-offwhite min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-therapy-gray">Client Progress Tracker</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1">Monitor and analyze client improvement over time</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700 mb-1 md:mb-0 md:mr-2">Select Client</span>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {progressTrackerData.clientsList.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-10 px-4 text-sm font-medium border-gray-300 w-full md:w-auto">Last 3 Months</Button>
            <Button className="bg-therapy-purple hover:bg-therapy-purpleDeep h-10 px-6 text-sm font-medium text-white w-full md:w-auto">Export Report</Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, idx) => (
            <div key={m.label} className={`rounded-2xl shadow-lg flex flex-col items-center justify-center h-44 w-full p-0 bg-white hover:shadow-xl transition-all border-0`}>
              <div className={`flex flex-col items-center justify-center w-full h-full gap-2 p-4`}>
                <div className={`flex items-center justify-center w-14 h-14 rounded-full mb-2 ${m.accent} shadow-md`}>{m.icon}</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-therapy-gray">{m.value}{m.label === "Session Attendance" ? "%" : ""}</span>
                  {m.trend !== null && (
                    <span className={`text-base ${m.trendColor} font-semibold flex items-center gap-1`}>
                      ↑ {m.trend}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-1">{m.subtitle}</div>
                <div className={`h-3 ${m.barBg} rounded-full overflow-hidden w-full mt-1`}>
                  <div className={`h-full ${m.barColor} transition-all duration-700`} style={{ width: `${m.value}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* Left: Client Summary */}
          <Card className="h-fit border border-gray-200 shadow-lg rounded-2xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray flex items-center gap-2"><User className="h-6 w-6 text-therapy-purple" /> Client Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-therapy-purple/10 text-therapy-purple text-xl font-bold flex items-center justify-center">
                  {selectedClient?.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-bold text-lg text-therapy-purple">{selectedClient?.name}</div>
                  <div className="text-gray-500 text-sm">Client</div>
                </div>
              </div>
              <div><span className="text-gray-500">Sessions Completed</span><br /><span className="font-semibold text-therapy-gray">8 of 12</span></div>
              <div><span className="text-gray-500">Attendance Rate</span><br /><span className="font-semibold text-therapy-green">92%</span></div>
              <div><span className="text-gray-500">Current Treatment</span><br /><span className="font-semibold text-therapy-blue">Cognitive Behavioral Therapy</span></div>
              <div><span className="text-gray-500">Next Session</span><br /><span className="font-semibold text-therapy-gray">May 14, 2025</span></div>
              <Button className="mt-6 w-full bg-therapy-purple hover:bg-therapy-purpleDeep text-white text-base font-semibold rounded-full py-3 shadow-md transition-all flex items-center gap-2 justify-center">
                <Calendar className="h-5 w-5" /> Schedule Session
              </Button>
            </CardContent>
          </Card>

          {/* Center: Treatment Goals */}
          <Card className="h-fit border border-gray-200 shadow-lg rounded-2xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray flex items-center gap-2"><ClipboardList className="h-6 w-6 text-therapy-blue" /> Treatment Goals</CardTitle>
              <CardDescription className="text-base text-gray-500">Progress toward established therapeutic goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pb-6">
              {treatmentGoals.map((goal, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-medium text-therapy-gray">{goal.name}</span>
                    <span className={
                      goal.progress >= 75 ? "text-therapy-green font-semibold" :
                      goal.progress >= 50 ? "text-therapy-blue font-semibold" :
                      goal.progress >= 25 ? "text-therapy-orange font-semibold" : "text-gray-400 font-semibold"
                    }>
                      {goal.progress}% Complete
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg h-4 flex items-center">
                    <Progress value={goal.progress} className="h-3 bg-transparent animate-pulse" indicatorClassName={
                      goal.progress >= 75 ? "bg-therapy-green" :
                      goal.progress >= 50 ? "bg-therapy-blue" :
                      goal.progress >= 25 ? "bg-therapy-orange" : "bg-gray-400"
                    } />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right: Therapist Notes */}
          <Card className="h-fit border border-gray-200 shadow-lg rounded-2xl bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray flex items-center gap-2"><Edit2 className="h-6 w-6 text-therapy-green" /> Therapist Notes</CardTitle>
              <CardDescription className="text-base text-gray-500">Key observations and progress notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              {therapistNotes.map((note, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
                  <div className="text-xs text-gray-500 mb-1 font-semibold">Session {note.date}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{note.content}</div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2 rounded-full flex items-center justify-center gap-2 font-semibold">
                <Edit2 className="h-4 w-4" /> View All Session Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
