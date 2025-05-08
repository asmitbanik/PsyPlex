import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AudioUploader from "@/components/AudioUploader";
import LiveRecorder from "@/components/LiveRecorder";
import { FileText, AudioWaveform, Mic, Brain, Heart, Target, ScrollText } from "lucide-react";
import therapyInsightsData from "@/data/therapyInsightsData.json";

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
  const [sessionNotes, setSessionNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | "live">("live");

  const handleGenerateInsights = () => {
    if (!sessionNotes.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API call to AI service
    setTimeout(() => {
      setIsGenerating(false);
      setInsightsGenerated(true);
      toast({
        title: "Insights Generated",
        description: "AI analysis complete based on your session notes."
      });
    }, 2000);
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setSessionNotes(transcription);
  };

  const selectedTherapyData = therapyInsightsData.therapyTypes.find(
    therapy => therapy.id === selectedTherapy
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-therapy-gray">Therapy Insights</h1>
      <p className="text-gray-600">
        Generate structured insights from your session notes based on different therapeutic approaches.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Analysis</CardTitle>
          <CardDescription>
            Enter session notes or record/upload audio to generate insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Therapeutic Approach
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant={selectedTherapy === "cbt" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-4 px-3 ${
                  selectedTherapy === "cbt" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""
                }`}
                onClick={() => setSelectedTherapy("cbt")}
              >
                <Brain className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium mb-1">SOAP</span>
                <span className="text-xs text-muted-foreground text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Subjective, Objective, Assessment, Plan
                </span>
              </Button>
              
              <Button
                variant={selectedTherapy === "dbt" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-4 px-3 ${
                  selectedTherapy === "dbt" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""
                }`}
                onClick={() => setSelectedTherapy("dbt")}
              >
                <Heart className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium mb-1">BIRP</span>
                <span className="text-xs text-muted-foreground text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Behavior, Intervention, Response, Plan
                </span>
              </Button>
              
              <Button
                variant={selectedTherapy === "psychodynamic" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-4 px-3 ${
                  selectedTherapy === "psychodynamic" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""
                }`}
                onClick={() => setSelectedTherapy("psychodynamic")}
              >
                <Target className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium mb-1">DAP</span>
                <span className="text-xs text-muted-foreground text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Data, Assessment, Plan
                </span>
              </Button>
              
              <Button
                variant={selectedTherapy === "solution-focused" ? "default" : "outline"}
                className={`flex flex-col items-center justify-center h-auto py-4 px-3 ${
                  selectedTherapy === "solution-focused" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""
                }`}
                onClick={() => setSelectedTherapy("solution-focused")}
              >
                <ScrollText className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium mb-1">Scribbled Notes</span>
                <span className="text-xs text-muted-foreground text-center leading-tight block w-full whitespace-normal break-words mt-1">
                  Free-form session notes
                </span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <label className="text-sm font-medium">Input Method</label>
              <div className="flex space-x-2 mt-1 sm:mt-0">
                <Button 
                  variant={inputMethod === "text" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("text")}
                  className={inputMethod === "text" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Text Input
                </Button>
                <Button 
                  variant={inputMethod === "live" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("live")}
                  className={inputMethod === "live" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Live Recording
                </Button>
                <Button 
                  variant={inputMethod === "audio" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setInputMethod("audio")}
                  className={inputMethod === "audio" ? "bg-therapy-purple hover:bg-therapy-purpleDeep" : ""}
                >
                  <AudioWaveform className="mr-2 h-4 w-4" />
                  Audio Upload
                </Button>
              </div>
            </div>

            {inputMethod === "text" ? (
              <Textarea
                id="session-notes"
                placeholder="Enter your session notes here..."
                className="h-40"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            ) : inputMethod === "live" ? (
              <LiveRecorder onTranscriptionComplete={handleTranscriptionComplete} />
            ) : (
              <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
            )}
            
            {(inputMethod === "audio" || inputMethod === "live") && sessionNotes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Transcription:</h3>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{sessionNotes}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button
              className="bg-therapy-purple hover:bg-therapy-purpleDeep"
              onClick={handleGenerateInsights}
              disabled={isGenerating || !sessionNotes.trim()}
            >
              {isGenerating ? "Generating..." : "Generate Insights"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {insightsGenerated && selectedTherapyData && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold text-therapy-gray">
            {selectedTherapyData.name} Insights
          </h2>

          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full md:w-1/2 grid-cols-2">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights">
              {selectedTherapy === "cbt" && (
                <>
                  <InsightCard 
                    title="Cognitive Distortions" 
                    description="Identified thought patterns that may be reinforcing negative emotions"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.cognitiveDistortions.map((distortion, index) => (
                        <li key={index}>{distortion}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Behavioral Patterns" 
                    description="Observed behaviors that may be maintaining the presenting problems"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.behavioralPatterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Core Beliefs" 
                    description="Underlying beliefs that may be contributing to current difficulties"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.coreBeliefs.map((belief, index) => (
                        <li key={index}>{belief}</li>
                      ))}
                    </ul>
                  </InsightCard>
                </>
              )}

              {selectedTherapy === "dbt" && (
                <>
                  <InsightCard 
                    title="Emotional Regulation" 
                    description="Observations related to emotional awareness and regulation"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.emotionalRegulation.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Interpersonal Effectiveness" 
                    description="Skills and challenges in relationships with others"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.interpersonalEffectiveness.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Distress Tolerance" 
                    description="Ability to tolerate and survive crisis situations"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedTherapyData.insights.distressTolerance.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </InsightCard>
                </>
              )}

              {(selectedTherapy === "psychodynamic" || selectedTherapy === "solution-focused") && (
                <InsightCard 
                  title="Key Patterns and Themes" 
                  description="Main observations from this therapy approach"
                >
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedTherapyData.insights.keyPatterns.map((pattern, index) => (
                      <li key={index}>{pattern}</li>
                    ))}
                  </ul>
                </InsightCard>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Recommendations</CardTitle>
                  <CardDescription>
                    Suggested therapeutic interventions based on session insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-therapy-gray">For Next Session</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      {selectedTherapyData.recommendations.nextSession.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-therapy-gray">Homework Suggestions</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      {selectedTherapyData.recommendations.homework.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default TherapyInsights;
