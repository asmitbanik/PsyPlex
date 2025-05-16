import React from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase";

interface GoogleSignInButtonProps {
  variant?: "default" | "outline";
  text?: string;
  className?: string;
  isLoading?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  variant = "outline",
  text = "Sign in with Google",
  className = "",
  isLoading = false
}) => {
  const handleGoogleSignIn = async () => {
    try {
      // Use Supabase's direct OAuth method with a specific redirect to our app
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      // AuthRedirect component will handle the redirect to dashboard
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <Button
      variant={variant}
      type="button"
      disabled={isLoading}
      className={`w-full ${className}`}
      onClick={handleGoogleSignIn}
    >
      {!isLoading && <FcGoogle className="h-5 w-5 mr-2" />}
      {isLoading ? "Connecting..." : text}
    </Button>
  );
};

export default GoogleSignInButton;
