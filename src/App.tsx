import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveRecorder from "@/components/LiveRecorder";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Sessions from "./pages/Sessions";
import TherapyInsights from "./pages/TherapyInsights";
import ProgressTracker from "./pages/ProgressTracker";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import AuthRedirect from "./components/AuthRedirect";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const handleTranscriptionComplete = (text: string) => {
    console.log("Transcription:", text);
  };

  // Set up auth state listener for handling OAuth callbacks
  useEffect(() => {
    // This sets up a listener for auth state changes including OAuth redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event);
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully');
        // We could redirect here if needed
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthRedirect />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/therapist" element={<AuthLayout />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:clientId" element={<ClientDetails />} />                <Route path="sessions" element={<Sessions />} />
                <Route path="insights" element={<TherapyInsights />} />
                <Route path="progress" element={<ProgressTracker />} />
                <Route path="notes" element={<Notes />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
