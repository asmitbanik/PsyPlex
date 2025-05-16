
import { useState } from "react";
import { UploadCloud, X, FileAudio, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { processAudioSession } from "@/services/transcriptionService";

interface AudioUploaderProps {
  onTranscriptionComplete: (text: string) => void;
  onReportGenerated?: (report: string) => void;
}

const AudioUploader = ({ onTranscriptionComplete, onReportGenerated }: AudioUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>("idle"); // idle, transcription, analysis, complete

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.includes('audio')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (mp3, wav, m4a, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };
  const handleTranscription = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setProgress(0);
    setStage("transcription");
    
    try {
      // Process the audio file using our transcriptionService
      await processAudioSession(
        file, 
        (currentStage, currentProgress) => {
          setStage(currentStage);
          setProgress(currentProgress);
        }
      ).then(({ transcription, report }) => {
        // Update with transcription result
        onTranscriptionComplete(transcription);
        
        // Pass the report if handler is provided
        if (onReportGenerated) {
          onReportGenerated(report);
        }
        
        toast({
          title: "Processing complete",
          description: "Audio has been transcribed and analyzed",
        });
        
        setIsLoading(false);
        setStage("complete");
      });
    } catch (error) {
      console.error("Error in transcription process:", error);
      setIsLoading(false);
      setStage("idle");
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was an error processing your audio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Card className="border-dashed border-2 bg-muted/50">
        <div className="p-4 flex flex-col items-center justify-center">
          {!file && (
            <label htmlFor="audio-upload" className="w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center py-6">
                <UploadCloud className="h-12 w-12 text-therapy-purple mb-2" />
                <p className="text-sm font-medium mb-1">Upload session audio</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Drag and drop or click to upload (MP3, WAV, M4A)
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-therapy-purple text-white hover:bg-therapy-purpleDeep"
                >
                  Select Audio File
                </Button>
              </div>
              <input 
                id="audio-upload" 
                type="file" 
                accept="audio/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          )}

          {file && (
            <div className="w-full">
              <div className="flex items-center justify-between p-2 bg-muted rounded-md mb-4">
                <div className="flex items-center">
                  <FileAudio className="h-6 w-6 text-therapy-purple mr-2" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleRemoveFile} 
                  className="p-1 hover:bg-gray-200 rounded-full"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                <div className="w-full">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-therapy-purple transition-all duration-300 ease-in-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center">                    <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {stage === "transcription" && "Transcribing audio..."}
                      {stage === "analysis" && "Generating clinical report..."}
                      {stage === "complete" && "Processing complete!"}
                    </span>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleTranscription} 
                  className="w-full bg-therapy-purple text-white hover:bg-therapy-purpleDeep"
                >
                  Transcribe Audio
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AudioUploader;
