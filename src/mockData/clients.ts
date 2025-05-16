import { ClientWithProfile } from "../services/ClientService";

// Mock data for clients when the database tables don't exist yet
export const mockClients: ClientWithProfile[] = [
  {
    id: "mock-client-1",
    created_at: new Date().toISOString(),
    user_id: "mock-user-1",
    therapist_id: "current-user-id",
    email: "john.doe@example.com",
    status: "Active",
    profile: {
      id: "mock-profile-1",
      client_id: "mock-client-1",
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1990-05-15",
      phone_number: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      emergency_contact: "Jane Doe (Wife) 555-987-6543",
      insurance_provider: "Health Insurance Co.",
      insurance_id: "HI12345678",
      notes: "First-time client, experiencing anxiety"
    }
  },
  {
    id: "mock-client-2",
    created_at: new Date().toISOString(),
    user_id: "mock-user-2",
    therapist_id: "current-user-id",
    email: "jane.smith@example.com",
    status: "Active",
    profile: {
      id: "mock-profile-2",
      client_id: "mock-client-2",
      first_name: "Jane",
      last_name: "Smith",
      date_of_birth: "1985-03-22",
      phone_number: "555-876-5432",
      address: "456 Oak Ave, Somewhere, USA",
      emergency_contact: "Michael Smith (Brother) 555-111-2222",
      insurance_provider: "National Health Plan",
      insurance_id: "NHP87654321",
      notes: "Returning client, depression management"
    }
  }
];
