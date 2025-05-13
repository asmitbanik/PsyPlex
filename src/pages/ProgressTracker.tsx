import { useState, useEffect, useRef } from "react";
import progressTrackerData from "@/data/progressTrackerData.json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, Circle, User, CalendarCheck, CheckCircle, TrendingUp, ClipboardList, Calendar, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const ProgressTracker = () => {
  const [selectedClientId, setSelectedClientId] = useState(progressTrackerData.clientsList[0].id);
  const selectedClient = progressTrackerData.clientsList.find(c => c.id === selectedClientId);

  // Only declare these once, before metrics
  const treatmentGoals = progressTrackerData.treatmentGoals;
  const therapistNotes = progressTrackerData.therapistNotes;
  const averageGoalProgress = Math.round(treatmentGoals.reduce((sum, g) => sum + g.progress, 0) / treatmentGoals.length);
  const mostImprovedGoal = treatmentGoals.reduce((max, g) => g.progress > max.progress ? g : max, treatmentGoals[0]);

  // --- Real Metrics ---
  const averageMoodChange = 2.5; // Replace with real calculation if session mood/score data is available
  const metrics = [
    {
      label: "Average Goal Progress",
      value: `${averageGoalProgress}%`,
      icon: <TrendingUp className="h-7 w-7 text-therapy-blue" />,
      subtitle: "Across all treatment goals"
    },
    {
      label: "Average Mood/Score Change",
      value: `${averageMoodChange > 0 ? '+' : ''}${averageMoodChange}`,
      icon: <ArrowUpRight className="h-7 w-7 text-therapy-purple" />,
      subtitle: "Per session (last 3 months)"
    },
    {
      label: "Sessions in Last 3 Months",
      value: 8, // Replace with real session count if available
      icon: <CalendarCheck className="h-7 w-7 text-therapy-purple" />,
      subtitle: "Attended by client"
    },
    {
      label: "Notes Added",
      value: therapistNotes.length,
      icon: <Edit2 className="h-7 w-7 text-therapy-green" />,
      subtitle: "Therapist notes for this client"
    }
  ];

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newSession, setNewSession] = useState({ client: selectedClientId, date: '', time: '', type: '' });
  const isScheduleDisabled = !newSession.client || !newSession.date || !newSession.time || !newSession.type;

  // Update newSession client when selectedClientId changes
  useEffect(() => {
    setNewSession(ns => ({ ...ns, client: selectedClientId }));
  }, [selectedClientId]);

  const handleScheduleSession = (e) => {
    e.preventDefault();
    // Add logic to save the session here
    setShowScheduleDialog(false);
    setNewSession({ client: selectedClientId, date: '', time: '', type: '' });
  };

  const navigate = useNavigate();

  const [selectedTimeRange, setSelectedTimeRange] = useState("3m");
  const timeRangeOptions = [
    { label: "Last Week", value: "1w" },
    { label: "Last Month", value: "1m" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "Last Year", value: "1y" },
    { label: "All Time", value: "all" },
  ];

  const [clientFocused, setClientFocused] = useState(false);
  const [timeFocused, setTimeFocused] = useState(false);
  const clientSelectRef = useRef(null);
  const timeSelectRef = useRef(null);

  return (
    <div className="px-2 sm:px-4 py-6 bg-therapy-offwhite min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-therapy-gray">Client Progress Tracker</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1">Monitor and analyze client improvement over time</p>
          </div>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg flex flex-col md:flex-row items-center gap-4 p-4">
              {/* Client Dropdown */}
              <div className="flex-1 relative w-full">
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  onOpenChange={open => setClientFocused(open)}
                >
                  <SelectTrigger
                    ref={clientSelectRef}
                    id="client-select"
                    className={`w-full h-14 rounded-2xl bg-white/70 border border-gray-200 shadow-lg transition-all duration-200 text-lg font-semibold pl-16 pr-8 focus:ring-2 focus:ring-therapy-purple focus:border-therapy-purple/80 hover:shadow-xl hover:border-therapy-purple/60 relative ${clientFocused ? "ring-2 ring-therapy-purple border-therapy-purple/80" : ""}`}
                  >
                    {/* Avatar/Initials */}
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-therapy-purple/20 flex items-center justify-center text-therapy-purple font-extrabold text-base shadow-md border border-white">
                      {selectedClient?.name.split(" ").map(n => n[0]).join("")}
                    </span>
                    <span className="absolute left-16 -top-2 text-xs text-therapy-purple font-medium transition-all duration-200 pointer-events-none z-10 px-1 rounded bg-white">
                      Select Client
                    </span>
                    <SelectValue>
                      <span className="truncate">{selectedClient?.name}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-scale mt-2 shadow-2xl rounded-2xl border border-therapy-purple/10 bg-white/95 backdrop-blur-xl">
                    {progressTrackerData.clientsList.map(client => (
                      <SelectItem key={client.id} value={client.id} className="flex items-center gap-3 px-4 py-3.5 text-lg font-medium rounded-xl hover:bg-therapy-purple/10 focus:bg-therapy-purple/20 transition-all group">
                        <span className="w-7 h-7 rounded-full bg-therapy-purple/20 flex items-center justify-center text-therapy-purple font-bold text-base border border-white shadow-sm mr-2">
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </span>
                        <span className="whitespace-nowrap flex-1">{client.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Time Range Dropdown */}
              <div className="flex-1 relative w-full">
                <Select
                  value={selectedTimeRange}
                  onValueChange={setSelectedTimeRange}
                  onOpenChange={open => setTimeFocused(open)}
                >
                  <SelectTrigger
                    ref={timeSelectRef}
                    id="time-select"
                    className={`w-full h-14 rounded-2xl bg-white/70 border border-gray-200 shadow-lg transition-all duration-200 text-lg font-semibold px-6 focus:ring-2 focus:ring-therapy-blue focus:border-therapy-blue/80 hover:shadow-xl hover:border-therapy-blue/60 relative ${timeFocused ? "ring-2 ring-therapy-blue border-therapy-blue/80" : ""}`}
                  >
                    <span className="absolute left-6 -top-2 text-xs text-therapy-blue font-medium transition-all duration-200 pointer-events-none z-10 px-1 rounded bg-white">
                      Time Range
                    </span>
                    <SelectValue>{timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-scale shadow-2xl rounded-2xl border border-therapy-blue/10 bg-white/90 backdrop-blur-xl">
                    {timeRangeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="px-4 py-3 text-lg font-medium rounded-xl hover:bg-therapy-blue/10 focus:bg-therapy-blue/20 transition-all">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Export Button */}
              <Button className="h-14 px-10 text-lg font-bold rounded-2xl shadow-lg bg-gradient-to-r from-therapy-purple to-therapy-blue hover:shadow-xl transition-all text-white border-0">
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, idx) => (
            <div
              key={m.label}
              className="rounded-3xl border border-gray-100 bg-white shadow-xl flex flex-col items-center justify-center h-56 w-full p-0 transition-all hover:shadow-2xl group overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-3 px-6 pt-8 pb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-therapy-purple/10 shadow-md mb-3">
                  {m.icon}
                </div>
                <div className="text-5xl font-extrabold text-therapy-gray tracking-tight mb-1">{m.value}</div>
                <div className="text-lg font-semibold text-therapy-purple text-center mb-1">{m.label}</div>
                <div className="text-xs text-gray-500 text-center">{m.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 h-[540px]">
          {/* Left: Client Summary */}
          <Card className="h-full min-h-[540px] max-h-[540px] flex flex-col border border-gray-200 shadow-xl rounded-3xl bg-gradient-to-br from-white via-therapy-purple/5 to-therapy-blue/5 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-therapy-purple flex items-center gap-3">
                <User className="h-7 w-7 text-therapy-purple" /> Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pb-8 flex flex-col">
              <div className="flex items-center gap-5 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-therapy-purple/10 text-therapy-purple text-3xl font-extrabold flex items-center justify-center shadow-lg border-2 border-white">
                  {selectedClient?.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-extrabold text-2xl text-therapy-purple leading-tight">{selectedClient?.name}</div>
                  <div className="text-gray-500 text-base font-medium">Client</div>
                </div>
              </div>
              <div className="border-b border-gray-200 my-2" />
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-therapy-blue" />
                  <div>
                    <div className="text-gray-500 text-sm">Average Goal Progress</div>
                    <div className="font-bold text-lg text-therapy-blue">{averageGoalProgress}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-therapy-blue" />
                  <div>
                    <div className="text-gray-500 text-sm">Current Treatment</div>
                    <div className="font-bold text-lg text-therapy-blue">Cognitive Behavioral Therapy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarCheck className="h-5 w-5 text-therapy-gray" />
                  <div>
                    <div className="text-gray-500 text-sm">Next Session</div>
                    <div className="font-bold text-lg text-therapy-gray">May 14, 2025</div>
                  </div>
                </div>
              </div>
              <Button className="mt-8 w-full bg-therapy-purple hover:bg-therapy-purpleDeep text-white text-lg font-bold rounded-full py-4 shadow-lg transition-all flex items-center gap-2 justify-center sticky bottom-0 z-10">
                <Calendar className="h-5 w-5" /> Schedule Session
              </Button>
            </CardContent>
          </Card>

          {/* Center: Treatment Goals */}
          <Card className="h-full min-h-[540px] max-h-[540px] flex flex-col border border-gray-200 shadow-xl rounded-3xl bg-gradient-to-br from-white via-therapy-blue/5 to-therapy-purple/5 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-therapy-blue flex items-center gap-3">
                <ClipboardList className="h-7 w-7 text-therapy-blue" /> Treatment Goals
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-1">Progress toward established therapeutic goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0 pb-8 flex flex-col">
              {treatmentGoals.map((goal, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-semibold text-therapy-gray flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-therapy-green" /> {goal.name}
                    </span>
                    <span className={
                      goal.progress >= 75 ? "text-therapy-green font-bold" :
                      goal.progress >= 50 ? "text-therapy-blue font-bold" :
                      goal.progress >= 25 ? "text-therapy-orange font-bold" : "text-gray-400 font-bold"
                    }>
                      {goal.progress}% Complete
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-xl h-4 flex items-center shadow-inner">
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
          <Card className="h-full min-h-[540px] max-h-[540px] flex flex-col border border-gray-200 shadow-xl rounded-3xl bg-gradient-to-br from-white via-therapy-green/5 to-therapy-purple/5 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-therapy-green flex items-center gap-3">
                <Edit2 className="h-7 w-7 text-therapy-green" /> Therapist Notes
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-1">Key observations and progress notes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0 pb-0">
              <div className="relative">
                {therapistNotes.slice(0, 1).map((note, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg flex flex-col gap-2 mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarCheck className="h-4 w-4 text-therapy-purple" />
                      <span className="text-xs text-therapy-purple font-semibold">{note.date}</span>
                    </div>
                    <div className="text-base text-gray-700 whitespace-pre-line leading-relaxed">{note.content}</div>
                </div>
              ))}
                {therapistNotes.length > 1 && (
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-sm z-10 flex items-end justify-center">
                    <Button variant="outline" className="mb-4 rounded-full flex items-center justify-center gap-2 font-semibold text-base border-2 border-therapy-green shadow-md" onClick={() => navigate(`/therapist/notes/${selectedClientId}`)}>
                      <Edit2 className="h-5 w-5" /> View All Session Notes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showScheduleDialog && (
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="sm:max-w-[540px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold text-therapy-purple mb-2 tracking-tight">Schedule New Session</DialogTitle>
              <DialogDescription className="text-base text-gray-500 mb-6">
                Create a new therapy session. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSession} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="client" className="text-base font-semibold text-therapy-purple">Client</label>
                  <Select value={newSession.client} onValueChange={v => setNewSession({ ...newSession, client: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {progressTrackerData.clientsList.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="date" className="text-base font-semibold text-therapy-purple">Date</label>
                  <input id="date" type="date" value={newSession.date} onChange={e => setNewSession({ ...newSession, date: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="time" className="text-base font-semibold text-therapy-purple">Time</label>
                  <input id="time" type="time" value={newSession.time} onChange={e => setNewSession({ ...newSession, time: e.target.value })} className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-base font-semibold text-therapy-purple">Type</label>
                  <Select value={newSession.type} onValueChange={v => setNewSession({ ...newSession, type: v })}>
                    <SelectTrigger className="border border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-therapy-purple">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)} className="rounded-full px-8 py-3 text-lg">Cancel</Button>
                <Button type="submit" className="bg-therapy-purple hover:bg-therapy-purpleDeep text-lg px-10 py-3 rounded-full shadow-lg font-bold transition-all duration-200 flex items-center gap-2" disabled={isScheduleDisabled}>
                  Schedule Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProgressTracker;
