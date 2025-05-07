
import { useState } from "react";
import { UploadCloud, X, FileAudio, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface AudioUploaderProps {
  onTranscriptionComplete: (text: string) => void;
}

const AudioUploader = ({ onTranscriptionComplete }: AudioUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

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
    
    // Simulate transcription with a progress bar
    // In a real implementation, you would connect to Whisper API or other transcription service
    const intervalId = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(intervalId);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the interval and set progress to 100%
      clearInterval(intervalId);
      setProgress(100);
      
      // Simulate successful transcription
      const mockTranscription = 
        "Client reports feeling anxious and overwhelmed with work deadlines. " +
        "They mentioned having trouble sleeping and concentrating. " +
        "We discussed potential cognitive distortions related to performance expectations and " +
        "the client identified several instances of catastrophizing. " +
        "Client showed good insight into how these thought patterns affect their emotional state. " +
        "Homework assigned: daily thought record and progressive muscle relaxation practice.";
      
      setTimeout(() => {
        setIsLoading(false);
        onTranscriptionComplete(mockTranscription);
        toast({
          title: "Transcription complete",
          description: "Audio has been successfully transcribed",
        });
      }, 500);
      
    } catch (error) {
      clearInterval(intervalId);
      setIsLoading(false);
      toast({
        title: "Transcription failed",
        description: "There was an error transcribing your audio",
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
                  <div className="flex items-center justify-center">
                    <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {progress === 100 ? "Processing..." : "Transcribing..."}
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
