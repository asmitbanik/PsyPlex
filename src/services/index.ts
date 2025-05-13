import { TherapistService } from './TherapistService';
import { ClientService } from './ClientService';
import { SessionService } from './SessionService';
import { NotesService, notesService } from './notesService';
import { TranscriptionService } from './TranscriptionService';
import { voiceProfileService } from './voiceProfileService';
import { TherapyInsightsService } from './TherapyInsightsService';

// Create instances of each service
export const therapistService = new TherapistService();
export const clientService = new ClientService();
export const sessionService = new SessionService();
export const transcriptionService = new TranscriptionService();
export const therapyInsightsService = new TherapyInsightsService();

// Re-export the singleton instances
export { notesService, voiceProfileService };

// Service types
export * from './TherapistService';
export * from './ClientService';
export * from './SessionService';
export * from './notesService';
export * from './TranscriptionService';
export * from './voiceProfileService';
export * from './TherapyInsightsService';

// Export the base service
export * from './base/BaseService';
