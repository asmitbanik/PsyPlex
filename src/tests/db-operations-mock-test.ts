/**
 * Mock Tests for Database Operations
 * 
 * This test file simulates database operations using in-memory data
 * instead of connecting to a real Supabase instance.
 */

import { v4 as uuidv4 } from 'uuid';

// Mock database store
const mockDb = {
  therapists: [],
  clients: [],
  clientProfiles: [],
  sessions: [],
  sessionNotes: [],
  treatmentGoals: [],
  progressMetrics: []
};

// Generic response type matching our actual DB operations
interface DbResponse<T> {
  data: T | null;
  error: Error | null;
}

// Helper function for responses
function success<T>(data: T): DbResponse<T> {
  return { data, error: null };
}

function error<T>(message: string): DbResponse<T> {
  return { data: null, error: new Error(message) };
}

// Types matching our real types
type Therapist = {
  id: string;
  user_id: string;
  full_name?: string;
  credentials?: string;
  specialties?: string[];
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
};

type TherapistInput = Omit<Therapist, 'id' | 'created_at' | 'updated_at'>;

type Client = {
  id: string;
  therapist_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'New';
  created_at?: string;
  updated_at?: string;
};

type ClientInput = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

type ClientProfile = {
  id: string;
  client_id: string;
  date_of_birth?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  primary_concerns?: string[];
  therapy_type?: string;
  start_date?: string;
  created_at?: string;
  updated_at?: string;
};

type ClientProfileInput = Omit<ClientProfile, 'id' | 'created_at' | 'updated_at'>;

type Session = {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  duration_minutes?: number;
  session_type: 'In-person' | 'Virtual';
  status: 'Scheduled' | 'Completed' | 'Canceled' | 'No-show';
  created_at?: string;
  updated_at?: string;
};

type SessionInput = Omit<Session, 'id' | 'created_at' | 'updated_at'>;

type SessionNote = {
  id: string;
  session_id: string;
  therapist_id: string;
  client_id: string;
  title: string;
  content: Record<string, any>;
  therapy_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

type SessionNoteInput = Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>;

type TreatmentGoal = {
  id: string;
  client_id: string;
  goal_description: string;
  status: 'Not Started' | 'In Progress' | 'Achieved';
  target_date?: string;
  created_at?: string;
  updated_at?: string;
};

type TreatmentGoalInput = Omit<TreatmentGoal, 'id' | 'created_at' | 'updated_at'>;

type ProgressMetric = {
  id: string;
  client_id: string;
  metric_name: string;
  metric_value: number;
  date_recorded: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

type ProgressMetricInput = Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'>;

// Mock implementations of our database operations

// Therapist operations
async function createTherapist(data: TherapistInput): Promise<DbResponse<Therapist>> {
  try {
    const now = new Date().toISOString();
    const therapist: Therapist = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.therapists.push(therapist);
    return success(therapist);
  } catch (err) {
    return error<Therapist>(`Error creating therapist: ${err.message}`);
  }
}

async function getTherapistById(id: string): Promise<DbResponse<Therapist>> {
  try {
    const therapist = mockDb.therapists.find(t => t.id === id);
    if (!therapist) {
      return error<Therapist>('Therapist not found');
    }
    return success(therapist);
  } catch (err) {
    return error<Therapist>(`Error fetching therapist: ${err.message}`);
  }
}

async function getTherapistByUserId(userId: string): Promise<DbResponse<Therapist>> {
  try {
    const therapist = mockDb.therapists.find(t => t.user_id === userId);
    if (!therapist) {
      return error<Therapist>('Therapist not found');
    }
    return success(therapist);
  } catch (err) {
    return error<Therapist>(`Error fetching therapist: ${err.message}`);
  }
}

async function updateTherapist(id: string, data: Partial<TherapistInput>): Promise<DbResponse<Therapist>> {
  try {
    const index = mockDb.therapists.findIndex(t => t.id === id);
    if (index === -1) {
      return error<Therapist>('Therapist not found');
    }
    
    const now = new Date().toISOString();
    mockDb.therapists[index] = {
      ...mockDb.therapists[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.therapists[index]);
  } catch (err) {
    return error<Therapist>(`Error updating therapist: ${err.message}`);
  }
}

async function deleteTherapist(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.therapists.findIndex(t => t.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Therapist not found');
    }
    
    mockDb.therapists.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting therapist: ${err.message}`);
  }
}

async function getAllTherapists(): Promise<DbResponse<Therapist[]>> {
  try {
    return success(mockDb.therapists);
  } catch (err) {
    return error<Therapist[]>(`Error fetching therapists: ${err.message}`);
  }
}

// Client operations
async function createClient(data: ClientInput): Promise<DbResponse<Client>> {
  try {
    const now = new Date().toISOString();
    const client: Client = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.clients.push(client);
    return success(client);
  } catch (err) {
    return error<Client>(`Error creating client: ${err.message}`);
  }
}

async function getClientById(id: string): Promise<DbResponse<Client>> {
  try {
    const client = mockDb.clients.find(c => c.id === id);
    if (!client) {
      return error<Client>('Client not found');
    }
    return success(client);
  } catch (err) {
    return error<Client>(`Error fetching client: ${err.message}`);
  }
}

async function getClientsByTherapistId(therapistId: string): Promise<DbResponse<Client[]>> {
  try {
    const clients = mockDb.clients.filter(c => c.therapist_id === therapistId);
    return success(clients);
  } catch (err) {
    return error<Client[]>(`Error fetching clients: ${err.message}`);
  }
}

async function updateClient(id: string, data: Partial<ClientInput>): Promise<DbResponse<Client>> {
  try {
    const index = mockDb.clients.findIndex(c => c.id === id);
    if (index === -1) {
      return error<Client>('Client not found');
    }
    
    const now = new Date().toISOString();
    mockDb.clients[index] = {
      ...mockDb.clients[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.clients[index]);
  } catch (err) {
    return error<Client>(`Error updating client: ${err.message}`);
  }
}

async function deleteClient(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.clients.findIndex(c => c.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Client not found');
    }
    
    mockDb.clients.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting client: ${err.message}`);
  }
}

// Client Profile operations
async function createClientProfile(data: ClientProfileInput): Promise<DbResponse<ClientProfile>> {
  try {
    const now = new Date().toISOString();
    const profile: ClientProfile = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.clientProfiles.push(profile);
    return success(profile);
  } catch (err) {
    return error<ClientProfile>(`Error creating client profile: ${err.message}`);
  }
}

async function getClientProfileByClientId(clientId: string): Promise<DbResponse<ClientProfile>> {
  try {
    const profile = mockDb.clientProfiles.find(p => p.client_id === clientId);
    if (!profile) {
      return error<ClientProfile>('Client profile not found');
    }
    return success(profile);
  } catch (err) {
    return error<ClientProfile>(`Error fetching client profile: ${err.message}`);
  }
}

async function updateClientProfile(id: string, data: Partial<ClientProfileInput>): Promise<DbResponse<ClientProfile>> {
  try {
    const index = mockDb.clientProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      return error<ClientProfile>('Client profile not found');
    }
    
    const now = new Date().toISOString();
    mockDb.clientProfiles[index] = {
      ...mockDb.clientProfiles[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.clientProfiles[index]);
  } catch (err) {
    return error<ClientProfile>(`Error updating client profile: ${err.message}`);
  }
}

async function deleteClientProfile(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.clientProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Client profile not found');
    }
    
    mockDb.clientProfiles.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting client profile: ${err.message}`);
  }
}

// Session operations
async function createSession(data: SessionInput): Promise<DbResponse<Session>> {
  try {
    const now = new Date().toISOString();
    const session: Session = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.sessions.push(session);
    return success(session);
  } catch (err) {
    return error<Session>(`Error creating session: ${err.message}`);
  }
}

async function getSessionById(id: string): Promise<DbResponse<Session>> {
  try {
    const session = mockDb.sessions.find(s => s.id === id);
    if (!session) {
      return error<Session>('Session not found');
    }
    return success(session);
  } catch (err) {
    return error<Session>(`Error fetching session: ${err.message}`);
  }
}

async function getSessionsByClientId(clientId: string): Promise<DbResponse<Session[]>> {
  try {
    const sessions = mockDb.sessions.filter(s => s.client_id === clientId);
    return success(sessions);
  } catch (err) {
    return error<Session[]>(`Error fetching sessions: ${err.message}`);
  }
}

async function getSessionsByTherapistId(therapistId: string): Promise<DbResponse<Session[]>> {
  try {
    const sessions = mockDb.sessions.filter(s => s.therapist_id === therapistId);
    return success(sessions);
  } catch (err) {
    return error<Session[]>(`Error fetching sessions: ${err.message}`);
  }
}

async function updateSession(id: string, data: Partial<SessionInput>): Promise<DbResponse<Session>> {
  try {
    const index = mockDb.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return error<Session>('Session not found');
    }
    
    const now = new Date().toISOString();
    mockDb.sessions[index] = {
      ...mockDb.sessions[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.sessions[index]);
  } catch (err) {
    return error<Session>(`Error updating session: ${err.message}`);
  }
}

async function deleteSession(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Session not found');
    }
    
    mockDb.sessions.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting session: ${err.message}`);
  }
}

// Session Notes operations
async function createSessionNote(data: SessionNoteInput): Promise<DbResponse<SessionNote>> {
  try {
    const now = new Date().toISOString();
    const note: SessionNote = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.sessionNotes.push(note);
    return success(note);
  } catch (err) {
    return error<SessionNote>(`Error creating session note: ${err.message}`);
  }
}

async function getSessionNoteById(id: string): Promise<DbResponse<SessionNote>> {
  try {
    const note = mockDb.sessionNotes.find(n => n.id === id);
    if (!note) {
      return error<SessionNote>('Session note not found');
    }
    return success(note);
  } catch (err) {
    return error<SessionNote>(`Error fetching session note: ${err.message}`);
  }
}

async function getSessionNotesBySessionId(sessionId: string): Promise<DbResponse<SessionNote[]>> {
  try {
    const notes = mockDb.sessionNotes.filter(n => n.session_id === sessionId);
    return success(notes);
  } catch (err) {
    return error<SessionNote[]>(`Error fetching session notes: ${err.message}`);
  }
}

async function updateSessionNote(id: string, data: Partial<SessionNoteInput>): Promise<DbResponse<SessionNote>> {
  try {
    const index = mockDb.sessionNotes.findIndex(n => n.id === id);
    if (index === -1) {
      return error<SessionNote>('Session note not found');
    }
    
    const now = new Date().toISOString();
    mockDb.sessionNotes[index] = {
      ...mockDb.sessionNotes[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.sessionNotes[index]);
  } catch (err) {
    return error<SessionNote>(`Error updating session note: ${err.message}`);
  }
}

async function deleteSessionNote(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.sessionNotes.findIndex(n => n.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Session note not found');
    }
    
    mockDb.sessionNotes.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting session note: ${err.message}`);
  }
}

// Treatment Goals operations
async function createTreatmentGoal(data: TreatmentGoalInput): Promise<DbResponse<TreatmentGoal>> {
  try {
    const now = new Date().toISOString();
    const goal: TreatmentGoal = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.treatmentGoals.push(goal);
    return success(goal);
  } catch (err) {
    return error<TreatmentGoal>(`Error creating treatment goal: ${err.message}`);
  }
}

async function getTreatmentGoalById(id: string): Promise<DbResponse<TreatmentGoal>> {
  try {
    const goal = mockDb.treatmentGoals.find(g => g.id === id);
    if (!goal) {
      return error<TreatmentGoal>('Treatment goal not found');
    }
    return success(goal);
  } catch (err) {
    return error<TreatmentGoal>(`Error fetching treatment goal: ${err.message}`);
  }
}

async function getTreatmentGoalsByClientId(clientId: string): Promise<DbResponse<TreatmentGoal[]>> {
  try {
    const goals = mockDb.treatmentGoals.filter(g => g.client_id === clientId);
    return success(goals);
  } catch (err) {
    return error<TreatmentGoal[]>(`Error fetching treatment goals: ${err.message}`);
  }
}

async function updateTreatmentGoal(id: string, data: Partial<TreatmentGoalInput>): Promise<DbResponse<TreatmentGoal>> {
  try {
    const index = mockDb.treatmentGoals.findIndex(g => g.id === id);
    if (index === -1) {
      return error<TreatmentGoal>('Treatment goal not found');
    }
    
    const now = new Date().toISOString();
    mockDb.treatmentGoals[index] = {
      ...mockDb.treatmentGoals[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.treatmentGoals[index]);
  } catch (err) {
    return error<TreatmentGoal>(`Error updating treatment goal: ${err.message}`);
  }
}

async function deleteTreatmentGoal(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.treatmentGoals.findIndex(g => g.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Treatment goal not found');
    }
    
    mockDb.treatmentGoals.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting treatment goal: ${err.message}`);
  }
}

// Progress Metrics operations
async function createProgressMetric(data: ProgressMetricInput): Promise<DbResponse<ProgressMetric>> {
  try {
    const now = new Date().toISOString();
    const metric: ProgressMetric = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    mockDb.progressMetrics.push(metric);
    return success(metric);
  } catch (err) {
    return error<ProgressMetric>(`Error creating progress metric: ${err.message}`);
  }
}

async function getProgressMetricById(id: string): Promise<DbResponse<ProgressMetric>> {
  try {
    const metric = mockDb.progressMetrics.find(m => m.id === id);
    if (!metric) {
      return error<ProgressMetric>('Progress metric not found');
    }
    return success(metric);
  } catch (err) {
    return error<ProgressMetric>(`Error fetching progress metric: ${err.message}`);
  }
}

async function getProgressMetricsByClientId(clientId: string): Promise<DbResponse<ProgressMetric[]>> {
  try {
    const metrics = mockDb.progressMetrics.filter(m => m.client_id === clientId);
    return success(metrics);
  } catch (err) {
    return error<ProgressMetric[]>(`Error fetching progress metrics: ${err.message}`);
  }
}

async function getClientMetricsByName(clientId: string, metricName: string): Promise<DbResponse<ProgressMetric[]>> {
  try {
    const metrics = mockDb.progressMetrics.filter(
      m => m.client_id === clientId && m.metric_name === metricName
    );
    return success(metrics);
  } catch (err) {
    return error<ProgressMetric[]>(`Error fetching metrics by name: ${err.message}`);
  }
}

async function updateProgressMetric(id: string, data: Partial<ProgressMetricInput>): Promise<DbResponse<ProgressMetric>> {
  try {
    const index = mockDb.progressMetrics.findIndex(m => m.id === id);
    if (index === -1) {
      return error<ProgressMetric>('Progress metric not found');
    }
    
    const now = new Date().toISOString();
    mockDb.progressMetrics[index] = {
      ...mockDb.progressMetrics[index],
      ...data,
      updated_at: now
    };
    
    return success(mockDb.progressMetrics[index]);
  } catch (err) {
    return error<ProgressMetric>(`Error updating progress metric: ${err.message}`);
  }
}

async function deleteProgressMetric(id: string): Promise<DbResponse<{ success: boolean }>> {
  try {
    const index = mockDb.progressMetrics.findIndex(m => m.id === id);
    if (index === -1) {
      return error<{ success: boolean }>('Progress metric not found');
    }
    
    mockDb.progressMetrics.splice(index, 1);
    return success({ success: true });
  } catch (err) {
    return error<{ success: boolean }>(`Error deleting progress metric: ${err.message}`);
  }
}

// Export all the mock implementations
export {
  // Therapist operations
  createTherapist,
  getTherapistById,
  getTherapistByUserId,
  updateTherapist,
  deleteTherapist,
  getAllTherapists,
  
  // Client operations
  createClient,
  getClientById,
  getClientsByTherapistId,
  updateClient,
  deleteClient,
  
  // Client Profile operations
  createClientProfile,
  getClientProfileByClientId,
  updateClientProfile,
  deleteClientProfile,
  
  // Session operations
  createSession,
  getSessionById,
  getSessionsByClientId,
  getSessionsByTherapistId,
  updateSession,
  deleteSession,
  
  // Session Notes operations
  createSessionNote,
  getSessionNoteById,
  getSessionNotesBySessionId,
  updateSessionNote,
  deleteSessionNote,
  
  // Treatment Goals operations
  createTreatmentGoal,
  getTreatmentGoalById,
  getTreatmentGoalsByClientId,
  updateTreatmentGoal,
  deleteTreatmentGoal,
  
  // Progress Metrics operations
  createProgressMetric,
  getProgressMetricById,
  getProgressMetricsByClientId,
  getClientMetricsByName,
  updateProgressMetric,
  deleteProgressMetric
};
