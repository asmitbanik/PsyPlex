import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

/**
 * Login a therapist with FastAPI and store session data
 */
export async function loginTherapist(email: string, password: string) {
  try {
    // First authenticate with FastAPI
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error("Login failed");
    }

    // Store auth token in localStorage for API requests
    localStorage.setItem("authToken", response.data.token);

    // Fetch therapist data using the email
    const { data: therapistData, error } = await supabase
      .from("therapists")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;

    // Store therapist data in localStorage
    localStorage.setItem("therapistId", therapistData.id);
    localStorage.setItem("therapistData", JSON.stringify(therapistData));

    return {
      therapist: therapistData,
      token: response.data.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get the current logged-in therapist
 */
export function getCurrentTherapist() {
  try {
    const therapistData = localStorage.getItem("therapistData");
    if (!therapistData) return null;

    return JSON.parse(therapistData);
  } catch (error) {
    console.error("Error getting current therapist:", error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

/**
 * Logout the therapist
 */
export async function logoutTherapist() {
  try {
    // Call the FastAPI logout endpoint if necessary
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Error calling logout API:", error);
  } finally {
    // Clean up local storage regardless of API result
    localStorage.removeItem("authToken");
    localStorage.removeItem("therapistId");
    localStorage.removeItem("therapistData");
  }
}

/**
 * Update the therapist profile
 */
export async function updateTherapistProfile(
  therapistId: string,
  profileData: {
    name?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from("therapists")
      .update({
        name: profileData.name,
      })
      .eq("id", therapistId);

    if (error) throw error;

    // Update the stored therapist data
    const currentTherapist = getCurrentTherapist();
    if (currentTherapist) {
      localStorage.setItem(
        "therapistData",
        JSON.stringify({
          ...currentTherapist,
          name: profileData.name,
        })
      );
    }

    return data;
  } catch (error) {
    console.error("Error updating therapist profile:", error);
    throw error;
  }
}
