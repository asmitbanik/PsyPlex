import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; // Point to your FastAPI server

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you're using cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("therapistId");
      localStorage.removeItem("therapistData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
