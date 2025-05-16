export type TherapyFormat = 'SOAP' | 'BIRP' | 'DAP' | 'Scribbled Notes';

export interface SOAPNote {
  Subjective: string[];
  Objective: string[];
  Assessment: string[];
  Plan: string[];
}

export interface BIRPNote {
  Behavior: string[];
  Intervention: string[];
  Response: string[];
  Plan: string[];
}

export interface DAPNote {
  Data: string[];
  Assessment: string[];
  Plan: string[];
}

export interface ScribbledNote {
  observations: string[];
  keyPoints: string[];
  followUp: string[];
}

export type StructuredNote = {
  format: TherapyFormat;
  content: SOAPNote | BIRPNote | DAPNote | ScribbledNote;
  transcription: string;
  timestamp: string;
  sessionId: string;
}

export interface TherapySession {
  id: string;
  clientId: string;
  date: string;
  format: TherapyFormat;
  transcription: string;
  notes: StructuredNote;
}
