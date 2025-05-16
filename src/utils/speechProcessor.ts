// Simple mock implementation of a speech-to-text classifier
export class SpeechToTextClassifier {
  private recording = false;
  private mockData = [
    "Client appears anxious when discussing work-related stress.",
    "Client mentioned difficulty sleeping for the past two weeks.",
    "Client reports improved mood since last session.",
    "Client is using cognitive techniques discussed in previous sessions."
  ];
  
  // Mock starting recording
  startRecording(): Promise<void> {
    this.recording = true;
    return Promise.resolve();
  }
  
  // Mock stopping recording
  stopRecording(): Promise<string> {
    this.recording = false;
    // Return a random transcription from the mock data
    const randomIndex = Math.floor(Math.random() * this.mockData.length);
    return Promise.resolve(this.mockData[randomIndex]);
  }
  
  // Check if currently recording
  isRecording(): boolean {
    return this.recording;
  }
}
