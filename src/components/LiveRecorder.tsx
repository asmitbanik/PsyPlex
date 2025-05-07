import { useState, useRef, useEffect } from "react";
import { Mic, Square, LoaderCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { SpeechToTextClassifier } from "@/utils/speechProcessor";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have an auth hook

interface LiveRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onInitialProfileCapture?: () => void;
}

interface TranscriptionSegment {
  speaker: "Therapist" | "Client";
  text: string;
  timestamp: number;
}

const LiveRecorder = ({ 
  onTranscriptionComplete,
  onInitialProfileCapture 
}: LiveRecorderProps) => {
  const { user } = useAuth(); // Get the current user
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCapturingProfile, setIsCapturingProfile] = useState(false);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptionSegment[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<"Therapist" | "Client" | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const classifierRef = useRef<SpeechToTextClassifier | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (classifierRef.current) {
          const speaker = await classifierRef.current.classifyCurrentSpeaker();
          const speakerLabel = speaker === "UserA" ? "Therapist" : "Client";
          setCurrentSpeaker(speakerLabel);
          
          if (event.results[current].isFinal) {
            setTranscriptSegments(prev => [
              ...prev,
              {
                speaker: speakerLabel,
                text: transcript,
                timestamp: Date.now() - startTimeRef.current
              }
            ]);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Speech recognition error",
          description: "There was an error with speech recognition. Please try again.",
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Initialize speech classifier with user ID
      classifierRef.current = new SpeechToTextClassifier(stream, user?.id);
      
      // Try to load existing profile
      await classifierRef.current.initialize();
      
      if (!classifierRef.current.userAProfile) {
        setIsCapturingProfile(true);
        toast({
          title: "Voice Profile Setup",
          description: "Please speak for 5 seconds to create your voice profile.",
        });
        
        // Capture user profile
        await classifierRef.current.captureUserAProfile();
        setHasProfile(true);
        setIsCapturingProfile(false);
        
        if (onInitialProfileCapture) {
          onInitialProfileCapture();
        }
        
        toast({
          title: "Voice Profile Created",
          description: "Your voice profile has been saved successfully.",
        });
      } else {
        setHasProfile(true);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTranscriptSegments([]);
      startTimeRef.current = Date.now();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Format the transcript segments into a readable text
      const formattedTranscript = transcriptSegments
        .map(segment => `${segment.speaker}: ${segment.text}`)
        .join("\n");
      
      onTranscriptionComplete(formattedTranscript);
      toast({
        title: "Recording processed",
        description: "Audio has been successfully transcribed",
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-dashed border-2 bg-muted/50">
      <div className="p-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center py-6">
          <Mic className="h-12 w-12 text-therapy-purple mb-2" />
          <p className="text-sm font-medium mb-1">Record session audio</p>
          <p className="text-xs text-muted-foreground mb-4">
            {hasProfile 
              ? "Click to start recording your session"
              : "First time setup: We'll create your voice profile"}
          </p>
          
          {isCapturingProfile && (
            <div className="text-sm text-therapy-purple mb-4">
              Capturing voice profile... Please speak for 5 seconds
            </div>
          )}
          
          {isRecording && (
            <div className="text-sm text-therapy-purple mb-4">
              Recording: {formatTime(recordingTime)}
            </div>
          )}
          
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
              <span className="text-sm">Processing recording...</span>
            </div>
          ) : (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-therapy-purple hover:bg-therapy-purpleDeep"
              } text-white`}
              disabled={isCapturingProfile}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  {hasProfile ? "Start Recording" : "Create Voice Profile"}
                </>
              )}
            </Button>
          )}

          {transcriptSegments.length > 0 && (
            <div className="mt-4 w-full space-y-2">
              {transcriptSegments.map((segment, index) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  <div className="flex items-center mb-1">
                    <User className={`h-4 w-4 mr-2 ${
                      segment.speaker === "Therapist" 
                        ? "text-therapy-purple" 
                        : "text-therapy-gray"
                    }`} />
                    <span className={`text-sm font-medium ${
                      segment.speaker === "Therapist" 
                        ? "text-therapy-purple" 
                        : "text-therapy-gray"
                    }`}>
                      {segment.speaker}
                    </span>
                  </div>
                  <p className="text-sm pl-6">{segment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LiveRecorder; 