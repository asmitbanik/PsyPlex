import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AudioUploader from "@/components/AudioUploader";
import LiveRecorder from "@/components/LiveRecorder";
import { FileText, AudioWaveform, Mic, Brain, Heart, Target, ScrollText } from "lucide-react";
import therapyInsightsData from "@/data/therapyInsightsData.json";
import SaveNoteDialog from "@/components/SaveNoteDialog";
import { NotesService } from "@/services/notesService";
const notesService = new NotesService();
import clientsData from "@/data/clientsData.json";
import { generateClinicalReport } from "@/services/transcriptionService";
import type { TherapyFormat } from "@/utils/promptGenerator";

interface InsightCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const InsightCard = ({ title, description, children }: InsightCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg text-therapy-gray">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

const TherapyInsights = () => {
  const [selectedTherapy, setSelectedTherapy] = useState("cbt");
  const [selectedFormat, setSelectedFormat] = useState<'SOAP' | 'BIRP' | 'DAP' | 'Scribbled Notes'>('SOAP');
  const [sessionNotes, setSessionNotes] = useState("");
  const [clinicalReport, setClinicalReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | "live">("live");
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const reportSectionRef = useRef<HTMLDivElement>(null); // Added ref for the report section

  // Prepare clients data for the dialog
  const clientListForDialog = clientsData.clients.map(client => ({ id: client.id, name: client.name }));

  const formatInsightsForSave = (insightsData: any): string[] => {
    const insightsArray: string[] = [];
    if (!insightsData || typeof insightsData !== 'object') return insightsArray;

    if (insightsData.keyPatterns && Array.isArray(insightsData.keyPatterns)) {
      insightsData.keyPatterns.forEach((item: string) => {
        insightsArray.push(`Key Pattern: ${item}`);
      });
      if (insightsArray.length > 0) return insightsArray; // If keyPatterns found, assume it's the primary structure
    }

    const knownComplexKeys: Record<string, string> = {
      cognitiveDistortions: "Cognitive Distortion",
      behavioralPatterns: "Behavioral Pattern",
      coreBeliefs: "Core Belief",
      emotionalRegulation: "Emotional Regulation",
      interpersonalEffectiveness: "Interpersonal Effectiveness",
      distressTolerance: "Distress Tolerance"
    };

    let specificKeysFound = false;
    for (const key in knownComplexKeys) {
      if (insightsData[key] && Array.isArray(insightsData[key]) && insightsData[key].length > 0) {
        (insightsData[key] as string[]).forEach((item: string) => {
          insightsArray.push(`${knownComplexKeys[key]}: ${item}`);
        });
        specificKeysFound = true;
      }
    }
    
    if (!specificKeysFound && insightsArray.length === 0) { 
       for (const key in insightsData) {
          if (Object.prototype.hasOwnProperty.call(insightsData, key) && Array.isArray(insightsData[key])) {
              const titleKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              (insightsData[key] as any[]).forEach((item: any) => { 
                  insightsArray.push(`${titleKey}: ${String(item)}`);
              });
          }
       }
    }
    return insightsArray;
  };

  const processTextInput = async (text: string) => {
    try {
      setIsGenerating(true);

      // Save text input to database
      const sessionId = crypto.randomUUID();
      const savedNote = notesService.saveNote({
        id: sessionId,
        title: `Therapy Session - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        therapyType: selectedFormat,
        content: {
          insights: {},
          recommendations: {
            nextSession: [],
            homework: []
          }
        },
        tags: ['text-input', selectedFormat.toLowerCase()]
      });

      // Generate clinical report using Gemini
      const report = await generateClinicalReport(text, selectedFormat);
      
      // Parse the JSON report
      const parsedReport = JSON.parse(report);
      setClinicalReport(parsedReport);

      // Update the saved note with structured insights
      if (savedNote) {
        notesService.updateNote(savedNote.id, {
          content: {
            insights: parsedReport,
            recommendations: {
              nextSession: parsedReport.Plan || parsedReport.followUp || [],
              homework: []
            }
          }
        });
      }

      setInsightsGenerated(true);
      toast({
        title: "Analysis Complete",
        description: "Clinical report has been generated from your notes",
      });

    } catch (error) {
      console.error('Error processing text input:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to generate clinical report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!sessionNotes.trim()) {
      toast({
        title: "No Content",
        description: "Please enter session notes or record/upload audio first",
        variant: "destructive"
      });
      return;
    }
    
    if (inputMethod === "text") {
      await processTextInput(sessionNotes);
    } else if (clinicalReport) {
      // If we already have a clinical report from audio processing, just show it
      setInsightsGenerated(true);
    }
  };

  useEffect(() => {
    if (insightsGenerated && reportSectionRef.current) {
      // Add a slight delay to ensure the DOM is fully rendered
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    }
  }, [insightsGenerated]); // Dependency array ensures this runs when insightsGenerated changes

  const handleFormatChange = (format: 'SOAP' | 'BIRP' | 'DAP' | 'Scribbled Notes') => {
    setSelectedFormat(format);
    if (sessionNotes) {
      processTranscription(sessionNotes, format);
    }
  };

  const processTranscription = async (text: string, format: TherapyFormat) => {
    try {
      setIsGenerating(true);
      
      // Store transcription in the database
      const sessionId = crypto.randomUUID();
      const savedNote = notesService.saveNote({
        clientId: '', // This will be set when saving the final note
        title: `Therapy Session - ${new Date().toLocaleDateString()}`,
        // Removed the date property as it is not part of the ClinicalNote type
        therapyType: format,
        content: {
          insights: {},
          recommendations: {
            nextSession: [],
            homework: []
          }
        },
        tags: ['transcription', format.toLowerCase()]
      });

      // Generate clinical report using Gemini
      const report = await generateClinicalReport(text, format);
      
      // Parse the JSON report
      const parsedReport = JSON.parse(report);
      setClinicalReport(parsedReport);

      // Create structured note
      const structuredNote: {
        format: TherapyFormat;
        content: any;
        transcription: string;
        timestamp: string;
        sessionId: string;
      } = {
        format,
        content: parsedReport,
        transcription: text,
        timestamp: new Date().toISOString(),
        sessionId
      };

      // Update the saved note with the structured note
      if (savedNote) {
        notesService.updateNote(savedNote.id, {
          content: {
            insights: structuredNote,
            recommendations: {
              nextSession: parsedReport.Plan || parsedReport.followUp || [],
              homework: []
            }
          }
        });
      }

      setInsightsGenerated(true);

    } catch (error) {
      console.error('Error processing transcription:', error);
      toast({
        title: "Error processing transcription",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setSessionNotes(text);
    processTranscription(text, selectedFormat);
  };

  const handleReportGenerated = (report: string) => {
    setClinicalReport(report);
    // Automatically set insights as generated since we have a clinical report
    setInsightsGenerated(true);
  };

  const handleSaveNote = (noteData: { title: string; tags: string[]; content: string; therapyType: string; clientId?: string }) => {
    const selectedTherapyData = therapyInsightsData.therapyTypes.find(
      therapy => therapy.id === selectedTherapy
    );

    if (!selectedTherapyData) {
      toast({ title: "Error", description: "Selected therapy approach not found.", variant: "destructive" });
      return;
    }
    if (!noteData.clientId) {
      toast({ title: "Error", description: "Please select a client.", variant: "destructive" });
      return;
    }

    try {
      const formattedGeneratedInsights = formatInsightsForSave(selectedTherapyData.insights);
      const recommendationsForSave = selectedTherapyData.recommendations || { nextSession: [], homework: [] };

      const finalContentObject = {
        insights: [
          `Session Input (Transcription/Notes): ${sessionNotes}`,
          `User's Note Summary: ${noteData.content}`, // Content from SaveNoteDialog
          ...formattedGeneratedInsights // Formatted insights from JSON based on selected therapy
        ],
        recommendations: recommendationsForSave,
      };

      notesService.saveNote({
        title: noteData.title,
        therapyType: noteData.therapyType || selectedTherapyData.name, // Use dialog's type or fallback
        content: finalContentObject, // Pass the structured object directly
        tags: noteData.tags,
        clientId: noteData.clientId,
        // Removed status as it is not part of the ClinicalNote type
      });

      toast({
        title: "Note Saved",
        description: "Clinical note has been saved successfully."
      });
      setSaveDialogOpen(false); // Close dialog on successful save
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({
        title: "Error",
        description: "Failed to save the note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const selectedTherapyData = therapyInsightsData.therapyTypes.find(
    therapy => therapy.id === selectedTherapy
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold text-therapy-gray mb-2">Therapy Insights</h1>
      <p className="text-base sm:text-lg text-gray-600 mb-8">
        Generate structured insights from your session notes based on different therapeutic approaches.
      </p>
      <Card className="mb-8 shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray">Session Analysis</CardTitle>
          <CardDescription className="text-base text-gray-500">
            Enter session notes or record/upload audio to generate insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-base font-semibold text-therapy-gray mb-2 block">Therapeutic Approach</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant={selectedTherapy === "cbt" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-6 px-3 rounded-xl shadow-md transition-all border-2 ${
                  selectedTherapy === "cbt" ? "bg-therapy-purple/90 border-therapy-purple text-white" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedTherapy("cbt")}
              >
                <Brain className="h-7 w-7 mb-2" />
                <span className="text-base font-bold mb-1">SOAP</span>
                <span className="text-xs text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Subjective, Objective, Assessment, Plan
                </span>
              </Button>
              <Button
                variant={selectedTherapy === "dbt" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-6 px-3 rounded-xl shadow-md transition-all border-2 ${
                  selectedTherapy === "dbt" ? "bg-therapy-blue/90 border-therapy-blue text-white" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedTherapy("dbt")}
              >
                <Heart className="h-7 w-7 mb-2" />
                <span className="text-base font-bold mb-1">BIRP</span>
                <span className="text-xs text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Behavior, Intervention, Response, Plan
                </span>
              </Button>
              <Button
                variant={selectedTherapy === "psychodynamic" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-6 px-3 rounded-xl shadow-md transition-all border-2 ${
                  selectedTherapy === "psychodynamic" ? "bg-therapy-green/90 border-therapy-green text-white" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedTherapy("psychodynamic")}
              >
                <Target className="h-7 w-7 mb-2" />
                <span className="text-base font-bold mb-1">DAP</span>
                <span className="text-xs text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Data, Assessment, Plan
                </span>
              </Button>
              <Button
                variant={selectedTherapy === "solution-focused" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-6 px-3 rounded-xl shadow-md transition-all border-2 ${
                  selectedTherapy === "solution-focused" ? "bg-therapy-orange/90 border-therapy-orange text-white" : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedTherapy("solution-focused")}
              >
                <ScrollText className="h-7 w-7 mb-2" />
                <span className="text-base font-bold mb-1">Scribbled Notes</span>
                <span className="text-xs text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Free-form session notes
                </span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
              <label className="text-base font-semibold text-therapy-gray">Input Method</label>
              <div className="flex flex-col sm:flex-row gap-2 mt-1 sm:mt-0 w-full sm:w-auto">
                <Button 
                  variant={inputMethod === "text" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("text")}
                  className={`rounded-full w-full sm:w-auto ${inputMethod === "text" ? "bg-therapy-purple hover:bg-therapy-purpleDeep text-white" : ""}`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Text Input
                </Button>
                <Button 
                  variant={inputMethod === "live" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("live")}
                  className={`rounded-full w-full sm:w-auto ${inputMethod === "live" ? "bg-therapy-purple hover:bg-therapy-purpleDeep text-white" : ""}`}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Live Recording
                </Button>
                <Button 
                  variant={inputMethod === "audio" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("audio")}
                  className={`rounded-full w-full sm:w-auto ${inputMethod === "audio" ? "bg-therapy-purple hover:bg-therapy-purpleDeep text-white" : ""}`}
                >
                  <AudioWaveform className="mr-2 h-4 w-4" />
                  Audio Upload
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-inner">
              {inputMethod === "text" ? (
                <div className="space-y-4">
                  <Textarea
                    id="session-notes"
                    placeholder="Enter your session notes here..."
                    className="h-40 rounded-lg shadow-sm"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                  />
                  {sessionNotes && clinicalReport && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Clinical Report:</h3>
                      <div className="p-3 bg-muted rounded-md border-l-4 border-therapy-purple">
                        <div className="prose prose-sm max-w-none">
                          {Object.entries(clinicalReport).map(([section, items]) => (
                            <div key={section} className="mb-4">
                              <h4 className="font-medium text-therapy-purple mb-2">
                                {section.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {Array.isArray(items) && items.map((item, index) => (
                                  <li key={index} className="text-sm">{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : inputMethod === "live" ? (
                <LiveRecorder 
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onReportGenerated={handleReportGenerated} 
                />
              ) : (
                <AudioUploader 
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onReportGenerated={handleReportGenerated}
                />
              )}
              {(inputMethod === "audio" || inputMethod === "live") && sessionNotes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Transcription:</h3>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{sessionNotes}</p>
                  </div>
                </div>
              )}
              
              {clinicalReport && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Clinical Report:</h3>
                  <div className="p-3 bg-muted rounded-md border-l-4 border-therapy-purple">
                    <div className="prose prose-sm max-w-none">
                      {clinicalReport.split('\n').map((line, i) => (
                        line.trim() ? (
                          <p key={i} className="text-sm mb-2">{line}</p>
                        ) : (
                          <br key={i} />
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              className="bg-therapy-purple hover:bg-therapy-purpleDeep rounded-full px-8 py-3 text-lg font-semibold shadow-md w-full sm:w-auto"
              onClick={handleGenerateInsights}
              disabled={isGenerating || !sessionNotes.trim()}
            >
              {isGenerating ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {insightsGenerated && selectedTherapyData && (
        <Card ref={reportSectionRef} className="shadow-lg rounded-2xl border border-gray-200 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-therapy-gray">
              {selectedTherapyData.name} Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full md:w-1/2 grid-cols-2 bg-gray-100 rounded-lg mb-4">
                <TabsTrigger value="insights" className="rounded-l-lg text-base font-semibold">Key Insights</TabsTrigger>
                <TabsTrigger value="recommendations" className="rounded-r-lg text-base font-semibold">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="insights">
                <div className="space-y-4 pt-2">
                  {selectedTherapy === "cbt" && selectedTherapyData.insights && (
                    <>
                      <InsightCard 
                        title="Cognitive Distortions" 
                        description="Identified thought patterns that may be reinforcing negative emotions"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.cognitiveDistortions?.map((distortion: string, index: number) => (
                            <li key={index}>{distortion}</li>
                          ))}
                        </ul>
                      </InsightCard>
                      <InsightCard 
                        title="Behavioral Patterns" 
                        description="Observed behaviors that may be maintaining the presenting problems"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.behavioralPatterns?.map((pattern: string, index: number) => (
                            <li key={index}>{pattern}</li>
                          ))}
                        </ul>
                      </InsightCard>
                      <InsightCard 
                        title="Core Beliefs" 
                        description="Underlying beliefs that may be contributing to current difficulties"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.coreBeliefs?.map((belief: string, index: number) => (
                            <li key={index}>{belief}</li>
                          ))}
                        </ul>
                      </InsightCard>
                    </>
                  )}
                  {selectedTherapy === "dbt" && selectedTherapyData.insights && (
                    <>
                      <InsightCard 
                        title="Emotional Regulation" 
                        description="Observations related to emotional awareness and regulation"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.emotionalRegulation?.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </InsightCard>
                      <InsightCard 
                        title="Interpersonal Effectiveness" 
                        description="Skills and challenges in relationships with others"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.interpersonalEffectiveness?.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </InsightCard>
                      <InsightCard 
                        title="Distress Tolerance" 
                        description="Ability to tolerate and survive crisis situations"
                      >
                        <ul className="list-disc pl-5 space-y-2">
                          {selectedTherapyData.insights.distressTolerance?.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </InsightCard>
                    </>
                  )}
                  {(selectedTherapy === "psychodynamic" || selectedTherapy === "solution-focused") && selectedTherapyData.insights && (
                    <InsightCard 
                      title="Key Patterns and Themes" 
                      description="Main observations from this therapy approach"
                    >
                      <ul className="list-disc pl-5 space-y-2">
                        {selectedTherapyData.insights.keyPatterns?.map((pattern: string, index: number) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </InsightCard>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="recommendations">
                <Card className="mt-2 rounded-xl border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-therapy-gray">Treatment Recommendations</CardTitle>
                    <CardDescription className="text-base text-gray-500">
                      Suggested therapeutic interventions based on session insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-therapy-gray">For Next Session</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {selectedTherapyData.recommendations?.nextSession.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setSaveDialogOpen(true)}
                        className="bg-therapy-purple hover:bg-therapy-purpleDeep"
                      >
                        <ScrollText className="h-4 w-4 mr-2" />
                        Save as Clinical Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <SaveNoteDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveNote}
        clients={clientListForDialog} // Pass the client list here
        initialData={{ // Pass initial data for the note, including the current session notes
          content: sessionNotes,
          therapyType: selectedTherapyData?.name,
        }}
      />
    </div>
  );
};

export default TherapyInsights;
