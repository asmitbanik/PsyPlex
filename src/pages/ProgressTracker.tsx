import { useState, useEffect, useRef } from "react";
import progressTrackerData from "@/data/progressTrackerData.json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, User, CalendarCheck, CheckCircle, TrendingUp, ClipboardList, Calendar, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProgressTracker = () => {
  const [selectedClientId, setSelectedClientId] = useState(progressTrackerData.clientsList[0].id);
  const currentClientDisplayData = progressTrackerData.clientsList.find(c => c.id === selectedClientId);

  const displayTreatmentGoals = progressTrackerData.treatmentGoals;
  const displayTherapistNotes = progressTrackerData.therapistNotes;

  const averageGoalProgress = displayTreatmentGoals.length > 0 
    ? Math.round(displayTreatmentGoals.reduce((sum, g) => sum + g.progress, 0) / displayTreatmentGoals.length)
    : 0;
  
  const displayCurrentTreatment = "Cognitive Behavioral Therapy";
  const displayNextSessionDate = "May 14, 2025";
  const displayLatestNote = displayTherapistNotes.length > 0 ? displayTherapistNotes[0] : null;

  const averageMoodChange = 2.5; 
  const sessionsAttendedLast3Months = 8; 

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
      value: sessionsAttendedLast3Months, 
      icon: <CalendarCheck className="h-7 w-7 text-therapy-purple" />,
      subtitle: "Attended by client"
    },
    {
      label: "Notes Added",
      value: displayTherapistNotes.length, 
      icon: <Edit2 className="h-7 w-7 text-therapy-green" />,
      subtitle: "Therapist notes for this client" 
    }
  ];

  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newSession, setNewSession] = useState({ client: selectedClientId, date: '', time: '', type: '' });
  const isScheduleDisabled = !newSession.client || !newSession.date || !newSession.time || !newSession.type;

  useEffect(() => {
    setNewSession(ns => ({ ...ns, client: selectedClientId }));
  }, [selectedClientId]);

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Scheduled session:", newSession);
    setShowScheduleDialog(false);
    setNewSession({ client: selectedClientId, date: '', time: '', type: '' });
  };

  const navigate = useNavigate();

  const [selectedTimeRange, setSelectedTimeRange] = useState("3m");
  const timeRangeOptions = [
    { label: "Last Week", value: "1w" },
    { label: "Last Month", value: "1m" },
    { label: "Last 3 Months", value: "3m" },
    { label: "All Time", value: "all" },
  ];

  const [clientFocused, setClientFocused] = useState(false);
  const [timeFocused, setTimeFocused] = useState(false);
  const clientSelectRef = useRef<HTMLButtonElement>(null);
  const timeSelectRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="px-2 sm:px-3 py-3 bg-therapy-offwhite min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-therapy-gray">Client Progress Tracker</h1>
          <p className="text-xs sm:text-sm text-gray-600">Monitor and analyze client improvement over time</p>
        </div>
        
        <div className="w-full mb-4">
          <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-xl rounded-xl shadow-md flex flex-col md:flex-row items-center gap-3 p-3">
              <div className="flex-1 relative w-full">
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  onOpenChange={open => setClientFocused(open)}
                >
                  <SelectTrigger
                    ref={clientSelectRef}
                    id="client-select"
                    className={`w-full h-11 rounded-lg bg-white/70 border border-gray-200 shadow-sm transition-all duration-200 text-md font-medium pl-12 pr-6 focus:ring-2 focus:ring-therapy-purple focus:border-therapy-purple/80 hover:shadow hover:border-therapy-purple/60 relative ${clientFocused ? "ring-2 ring-therapy-purple border-therapy-purple/80" : ""}`}
                  >
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-therapy-purple/20 flex items-center justify-center text-therapy-purple font-bold text-sm shadow-sm border border-white">
                      {currentClientDisplayData?.name.split(" ").map(n => n[0]).join("")}
                    </span>
                    <span className="absolute left-12 -top-2 text-2xs text-therapy-purple font-medium transition-all duration-200 pointer-events-none z-10 px-1 rounded bg-white">
                      Select Client
                    </span>
                    <SelectValue>
                      <span className="truncate">{currentClientDisplayData?.name}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-scale mt-2 shadow-lg rounded-lg border border-therapy-purple/10 bg-white/95 backdrop-blur-xl">
                    {progressTrackerData.clientsList.map(client => (
                      <SelectItem key={client.id} value={client.id} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-therapy-purple/10 focus:bg-therapy-purple/20 transition-all group">
                        <span className="w-5 h-5 rounded-full bg-therapy-purple/20 flex items-center justify-center text-therapy-purple font-bold text-xs border border-white shadow-sm mr-1">
                          {client.name.split(" ").map(n => n[0]).join("")}
                        </span>
                        <span className="whitespace-nowrap flex-1">{client.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 relative w-full">
                <Select
                  value={selectedTimeRange}
                  onValueChange={setSelectedTimeRange}
                  onOpenChange={open => setTimeFocused(open)}
                >
                  <SelectTrigger
                    ref={timeSelectRef}
                    id="time-select"
                    className={`w-full h-11 rounded-lg bg-white/70 border border-gray-200 shadow-sm transition-all duration-200 text-md font-medium px-4 focus:ring-2 focus:ring-therapy-blue focus:border-therapy-blue/80 hover:shadow hover:border-therapy-blue/60 relative ${timeFocused ? "ring-2 ring-therapy-blue border-therapy-blue/80" : ""}`}
                  >
                    <span className="absolute left-4 -top-2 text-2xs text-therapy-blue font-medium transition-all duration-200 pointer-events-none z-10 px-1 rounded bg-white">
                      Time Range
                    </span>
                    <SelectValue>{timeRangeOptions.find(opt => opt.value === selectedTimeRange)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="animate-fade-in-scale shadow-md rounded-lg border border-therapy-blue/10 bg-white/90 backdrop-blur-xl">
                    {timeRangeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="px-3 py-2 text-sm font-medium rounded-md hover:bg-therapy-blue/10 focus:bg-therapy-blue/20 transition-all">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="h-11 px-6 text-md font-medium rounded-lg shadow-sm bg-gradient-to-r from-therapy-purple to-therapy-blue hover:shadow transition-all text-white border-0">
                Export Report
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-gray-100 bg-white shadow-md flex flex-col items-center justify-center h-40 w-full p-0 transition-all hover:shadow-lg group overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-4 pt-4 pb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-therapy-purple/10 shadow-sm mb-1">
                  {m.icon}
                </div>
                <div className="text-3xl font-bold text-therapy-gray tracking-tight">{m.value}</div>
                <div className="text-sm font-medium text-therapy-purple text-center">{m.label}</div>
                <div className="text-2xs text-gray-500 text-center">{m.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
          <Card className="h-[400px] flex flex-col border border-gray-200 shadow-md rounded-xl bg-gradient-to-br from-white via-therapy-purple/5 to-therapy-blue/5 overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-lg font-semibold text-therapy-purple flex items-center gap-2">
                <User className="h-5 w-5" /> Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-4 flex flex-col flex-grow space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-therapy-purple/10 text-therapy-purple text-xl font-bold flex items-center justify-center shadow-sm border border-white">
                  {currentClientDisplayData?.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-bold text-md text-therapy-gray">{currentClientDisplayData?.name}</div>
                  <div className="text-gray-500 text-xs">Client</div>
                </div>
              </div>
              <div className="border-t border-gray-200 !my-3"></div>
              
              <div className="space-y-3 flex-grow">
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-therapy-blue mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Average Goal Progress</p>
                    <p className="font-semibold text-therapy-gray">{averageGoalProgress}%</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClipboardList className="h-4 w-4 text-therapy-blue mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Current Treatment</p>
                    <p className="font-semibold text-therapy-gray">{displayCurrentTreatment}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-therapy-blue mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Next Session</p>
                    <p className="font-semibold text-therapy-gray">{displayNextSessionDate}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowScheduleDialog(true)} 
                className="w-full mt-auto bg-therapy-purple hover:bg-therapy-purple/90 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" /> Schedule Session
              </Button>
            </CardContent>
          </Card>

          <Card className="h-[400px] flex flex-col border border-gray-200 shadow-md rounded-xl bg-gradient-to-br from-white via-therapy-purple/5 to-therapy-blue/5 overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-gray-600" /> Treatment Goals
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 pt-1">
                Progress toward established therapeutic goals
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-4 flex flex-col flex-grow space-y-2 text-sm">
              <div className="flex-grow space-y-3 overflow-y-auto pr-1 simple-scrollbar">
                {displayTreatmentGoals.map((goal, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center mr-2">
                        <CheckCircle className="h-4 w-4 text-gray-700 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-800 flex-1">{goal.name}</span>
                      </div>
                      <span className="text-sm font-medium text-therapy-purple whitespace-nowrap">{goal.progress}% Complete</span>
                    </div>
                    <Progress value={goal.progress} className="h-2 bg-therapy-purple/20 [&>div]:bg-therapy-purple" />
                  </div>
                ))}
                {displayTreatmentGoals.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-10 flex-grow flex items-center justify-center">No treatment goals defined for this client.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="h-[400px] flex flex-col border border-gray-200 shadow-md rounded-xl bg-white overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-gray-600" /> Therapist Notes
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 pt-1">
                Key observations and progress notes
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-4 flex flex-col flex-grow space-y-3 text-sm">
              {displayLatestNote ? (
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-grow flex flex-col min-h-0">
                  <p className="font-semibold text-sm text-gray-800 mb-1">{displayLatestNote.date}</p>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed overflow-y-auto flex-grow pr-1 simple-scrollbar"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                    }}
                  >
                    {displayLatestNote.content}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-10 flex-grow flex items-center justify-center">No notes available for this client.</p>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-auto border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => navigate('/notes')}
              >
                <Edit2 className="h-4 w-4 mr-2" /> View All Session Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {showScheduleDialog && (
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-therapy-purple">Schedule New Session</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Fill in the details to schedule a new session for {currentClientDisplayData?.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleScheduleSession} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-client" className="text-right text-sm text-gray-600">Client</Label>
                  <Input id="session-client" value={currentClientDisplayData?.name || ''} disabled className="col-span-3 h-9 bg-gray-50" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-date" className="text-right text-sm text-gray-600">Date</Label>
                  <Input id="session-date" type="date" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="col-span-3 h-9" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-time" className="text-right text-sm text-gray-600">Time</Label>
                  <Input id="session-time" type="time" value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} className="col-span-3 h-9" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="session-type" className="text-right text-sm text-gray-600">Type</Label>
                  <Input id="session-type" placeholder="e.g., CBT, Check-in" value={newSession.type} onChange={e => setNewSession({...newSession, type: e.target.value})} className="col-span-3 h-9" />
                </div>
                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)} className="h-9">Cancel</Button>
                  <Button type="submit" disabled={isScheduleDisabled} className="h-9 bg-therapy-purple hover:bg-therapy-purple/90 text-white">Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
