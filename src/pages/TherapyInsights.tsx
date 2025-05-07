
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import AudioUploader from "@/components/AudioUploader";
import { FileText, AudioWaveform } from "lucide-react";

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
  const [inputMethod, setInputMethod] = useState<"text" | "audio">("text");

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
            Enter session notes or upload audio to generate insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="therapy-type" className="text-sm font-medium">
              Therapeutic Approach
            </label>
            <Select value={selectedTherapy} onValueChange={setSelectedTherapy}>
              <SelectTrigger id="therapy-type" className="w-full md:w-1/2">
                <SelectValue placeholder="Select therapy type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbt">Cognitive Behavioral Therapy (CBT)</SelectItem>
                <SelectItem value="dbt">Dialectical Behavior Therapy (DBT)</SelectItem>
                <SelectItem value="psychodynamic">Psychodynamic Therapy</SelectItem>
                <SelectItem value="emdr">EMDR</SelectItem>
                <SelectItem value="solution-focused">Solution-Focused Brief Therapy</SelectItem>
              </SelectContent>
            </Select>
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
            ) : (
              <AudioUploader onTranscriptionComplete={handleTranscriptionComplete} />
            )}
            
            {inputMethod === "audio" && sessionNotes && (
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

      {insightsGenerated && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold text-therapy-gray">
            {selectedTherapy === "cbt" && "Cognitive Behavioral Therapy Insights"}
            {selectedTherapy === "dbt" && "Dialectical Behavior Therapy Insights"}
            {selectedTherapy === "psychodynamic" && "Psychodynamic Therapy Insights"}
            {selectedTherapy === "emdr" && "EMDR Therapy Insights"}
            {selectedTherapy === "solution-focused" && "Solution-Focused Brief Therapy Insights"}
          </h2>

          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full md:w-1/2 grid-cols-2">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            <TabsContent value="insights" className="space-y-4 pt-4">
              {selectedTherapy === "cbt" && (
                <>
                  <InsightCard 
                    title="Cognitive Distortions" 
                    description="Identified thought patterns that may be reinforcing negative emotions"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>All-or-nothing thinking: Client expressed feeling like "a complete failure" after a minor setback at work.</li>
                      <li>Catastrophizing: Client anticipates worst-case scenarios for upcoming social interactions.</li>
                      <li>Mental filtering: Client focuses exclusively on negative feedback while discounting positive feedback.</li>
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Behavioral Patterns" 
                    description="Observed behaviors that may be maintaining the presenting problems"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Avoidance of social situations that trigger anxiety</li>
                      <li>Procrastination on work tasks when feeling overwhelmed</li>
                      <li>Reduced engagement in previously enjoyed activities</li>
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Core Beliefs" 
                    description="Underlying beliefs that may be contributing to current difficulties"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>"I must be perfect to be accepted by others."</li>
                      <li>"I am responsible for other people's happiness."</li>
                      <li>"If I make a mistake, it means I'm incompetent."</li>
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
                      <li>Client shows difficulty identifying emotions before they escalate</li>
                      <li>Limited use of self-soothing strategies when distressed</li>
                      <li>Strong emotional reactions to perceived rejection</li>
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Interpersonal Effectiveness" 
                    description="Skills and challenges in relationships with others"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Difficulty asserting needs in close relationships</li>
                      <li>Tendency to either avoid conflict or engage in aggressive communication</li>
                      <li>Challenge maintaining self-respect during interpersonal conflicts</li>
                    </ul>
                  </InsightCard>
                  
                  <InsightCard 
                    title="Distress Tolerance" 
                    description="Ability to tolerate and survive crisis situations"
                  >
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Limited repertoire of crisis survival strategies</li>
                      <li>Difficulty accepting painful situations that cannot be immediately changed</li>
                      <li>Tendency to engage in impulsive behaviors when distressed</li>
                    </ul>
                  </InsightCard>
                </>
              )}

              {/* Similar structures for other therapy types */}
              {(selectedTherapy === "psychodynamic" || selectedTherapy === "emdr" || selectedTherapy === "solution-focused") && (
                <InsightCard 
                  title="Key Patterns and Themes" 
                  description="Main observations from this therapy approach"
                >
                  <p className="text-gray-600 italic">
                    Note: Detailed insights for this therapy approach would be displayed here based on the analysis of the session notes.
                  </p>
                </InsightCard>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4 pt-4">
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
                      {selectedTherapy === "cbt" && (
                        <>
                          <li>Introduce thought record to track cognitive distortions</li>
                          <li>Explore evidence for and against the belief "I must be perfect"</li>
                          <li>Assign behavioral experiment to test predictions about social interactions</li>
                        </>
                      )}
                      {selectedTherapy === "dbt" && (
                        <>
                          <li>Practice emotion identification using diary card</li>
                          <li>Introduce DEAR MAN skills for assertive communication</li>
                          <li>Develop personalized distress tolerance plan</li>
                        </>
                      )}
                      {selectedTherapy !== "cbt" && selectedTherapy !== "dbt" && (
                        <li>Specific recommendations based on the therapeutic approach would be displayed here</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-therapy-gray">Homework Suggestions</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      {selectedTherapy === "cbt" && (
                        <>
                          <li>Daily thought record focusing on situations that trigger anxiety</li>
                          <li>Gradual exposure to avoided social situations (hierarchy provided)</li>
                          <li>Schedule one enjoyable activity each day</li>
                        </>
                      )}
                      {selectedTherapy === "dbt" && (
                        <>
                          <li>Practice mindfulness exercise for 5 minutes twice daily</li>
                          <li>Complete emotion regulation worksheet for intense emotional experiences</li>
                          <li>Use interpersonal effectiveness skills in one challenging conversation</li>
                        </>
                      )}
                      {selectedTherapy !== "cbt" && selectedTherapy !== "dbt" && (
                        <li>Specific homework suggestions based on the therapeutic approach would be displayed here</li>
                      )}
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
