import { DatabaseService, ServiceResponse } from './DatabaseService';

// Create and export an instance of the DatabaseService
export const databaseService = new DatabaseService();

// Re-export the ServiceResponse type
export type { ServiceResponse };