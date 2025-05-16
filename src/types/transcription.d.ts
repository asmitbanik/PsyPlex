import { TherapyFormat } from './therapy';

export interface TranscriptionData {
  mockTranscription: string;
}

export interface TranscriptionResult {
  transcription: string;
  timestamp: string;
  sessionId: string;
}

export interface HumeResponse {
  job_id: string;
  state: 'pending' | 'processing' | 'done' | 'failed';
  results?: {
    transcriptions: Array<{
      text: string;
      confidence: number;
    }>;
  };
  error?: string;
}

export interface TherapyReport {
  SOAP?: {
    Subjective: string[];
    Objective: string[];
    Assessment: string[];
    Plan: string[];
  };
  BIRP?: {
    Behavior: string[];
    Intervention: string[];
    Response: string[];
    Plan: string[];
  };
  DAP?: {
    Data: string[];
    Assessment: string[];
    Plan: string[];
  };
  ScribbledNotes?: {
    observations: string[];
    keyPoints: string[];
    followUp: string[];
  };
  format: TherapyFormat;
  transcription: string;
  timestamp: string;
  sessionId: string;
}

declare module "*/transcriptionData.json" {
  const value: TranscriptionData;
  export default value;
}