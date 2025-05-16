import { SessionWithDetails } from "../services/SessionService";

// Mock data for sessions when the database tables don't exist yet
export const mockSessions: SessionWithDetails[] = [
  {
    id: "mock-session-1",
    created_at: new Date().toISOString(),
    therapist_id: "current-user-id",
    client_id: "mock-client-1",
    session_date: new Date().toISOString(),
    session_time: "10:00",
    session_type: "Virtual",
    status: "Scheduled",
    notes: "Initial consultation",
    client: {
      id: "mock-client-1",
      email: "john.doe@example.com",
      profile: {
        first_name: "John",
        last_name: "Doe"
      }
    }
  },
  {
    id: "mock-session-2",
    created_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    therapist_id: "current-user-id",
    client_id: "mock-client-2",
    session_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    session_time: "14:30",
    session_type: "In-person",
    status: "Scheduled",
    client: {
      id: "mock-client-2",
      email: "jane.smith@example.com",
      profile: {
        first_name: "Jane",
        last_name: "Smith"
      }
    }
  }
];
