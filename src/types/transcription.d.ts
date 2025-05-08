interface TranscriptionData {
  mockTranscription: string;
}

declare module "*/transcriptionData.json" {
  const value: TranscriptionData;
  export default value;
} 