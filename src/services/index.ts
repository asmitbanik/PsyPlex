/**
 * PsyPlex Service Layer
 * 
 * This service layer provides a comprehensive interface to all database operations
 * and business logic for the PsyPlex application. Services are implemented as classes
 * with methods for specific operations related to each domain.
 */

// Export service instances to be used throughout the application
import { databaseService, ServiceResponse } from './db';
import { AuthService } from './AuthService';
import { ClientService, clientService } from './ClientService';
import { clientProfileService } from './ClientProfileService';
import { sessionService } from './SessionService';
import { TherapistService } from './TherapistService';
import { treatmentGoalService } from './TreatmentGoalService';
import { progressMetricService } from './ProgressMetricService';
import { TherapyInsightsService } from './TherapyInsightsService';
import { TranscriptionService } from './TranscriptionService';
import { VoiceProfileService } from './voiceProfileService';

// Instantiate services
export const therapistService = new TherapistService();
export const authService = new AuthService(therapistService);
export const clientService = clientService;
export const clientProfileService = clientProfileService;
export const sessionService = sessionService;
export const treatmentGoalService = treatmentGoalService;
export const progressMetricService = progressMetricService;
export const therapyInsightsService = new TherapyInsightsService();
export const transcriptionService = new TranscriptionService();
export const voiceProfileService = new VoiceProfileService();
export const databaseService = databaseService;

// Export types
export type { ServiceResponse };

// (optional) Export service error types
export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
}
