import { supabase } from "../lib/supabase";

/**
 * Get all clients for a therapist
 */
export async function getClientsForTherapist(therapistId: string) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        *,
        client_profiles (*)
      `
      )
      .eq("therapist_id", therapistId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
}

/**
 * Get a specific client with their profile
 */
export async function getClientDetails(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
        *,
        client_profiles (*),
        treatment_goals (*),
        progress_tracker (*)
      `
      )
      .eq("id", clientId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching client details:", error);
    throw error;
  }
}

/**
 * Add a new client for a therapist
 */
export async function addClient(
  therapistId: string,
  clientData: {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    phone?: string;
    emergencyContact?: string;
    diagnosis?: string;
    currentMedication?: string;
  }
) {
  try {
    // First, create the client record
    const { data: newClientData, error: clientError } = await supabase
      .from("clients")
      .insert({
        therapist_id: therapistId,
        full_name: clientData.fullName,
        date_of_birth: clientData.dateOfBirth || null,
        gender: clientData.gender || null,
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // Then, create the client profile
    const { data: profileData, error: profileError } = await supabase
      .from("client_profiles")
      .insert({
        client_id: newClientData.id,
        address: clientData.address || null,
        phone: clientData.phone || null,
        emergency_contact: clientData.emergencyContact || null,
        diagnosis: clientData.diagnosis || null,
        current_medication: clientData.currentMedication || null,
      });

    if (profileError) throw profileError;

    return newClientData;
  } catch (error) {
    console.error("Error adding client:", error);
    throw error;
  }
}

/**
 * Update client information
 */
export async function updateClient(
  clientId: string,
  clientData: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    phone?: string;
    emergencyContact?: string;
    diagnosis?: string;
    currentMedication?: string;
    therapyNotes?: string;
  }
) {
  try {
    // Update the client record
    if (clientData.fullName || clientData.dateOfBirth || clientData.gender) {
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          full_name: clientData.fullName,
          date_of_birth: clientData.dateOfBirth,
          gender: clientData.gender,
        })
        .eq("id", clientId);

      if (clientError) throw clientError;
    }

    // Update the client profile
    const { error: profileError } = await supabase
      .from("client_profiles")
      .update({
        address: clientData.address,
        phone: clientData.phone,
        emergency_contact: clientData.emergencyContact,
        diagnosis: clientData.diagnosis,
        current_medication: clientData.currentMedication,
        therapy_notes: clientData.therapyNotes,
      })
      .eq("client_id", clientId);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
}
