import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LiveRecorder from "@/components/LiveRecorder";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Sessions from "./pages/Sessions";
import TherapyInsights from "./pages/TherapyInsights";
import ProgressTracker from "./pages/ProgressTracker";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";

const queryClient = new QueryClient();

const App = () => {
  const { user, logout } = useAuth();

  const handleTranscriptionComplete = (text: string) => {
    console.log("Transcription:", text);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/therapist" element={<AuthLayout />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:clientId" element={<ClientDetails />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="insights" element={<TherapyInsights />} />
                <Route path="progress" element={<ProgressTracker />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {user && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Logged in as: {user.email}
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-sm"
                >
                  Logout
                </Button>
              </div>
            )}
            
            <LiveRecorder onTranscriptionComplete={handleTranscriptionComplete} />
          </div>
        </div>
      </ProtectedRoute>
    </QueryClientProvider>
  );
};

export default App;
