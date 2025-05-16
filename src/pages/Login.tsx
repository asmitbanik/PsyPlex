import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string | null>(location.state?.message || null);

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from || "/therapist";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage(null); // Clear any previous messages
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }
    
    try {
      await signIn(email, password);
      // No need for toast here as the AuthContext already shows a toast
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Set more descriptive error messages based on the error
      let errorMessage = "Invalid email or password. Please try again.";
      if (err.message) {
        if (err.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email address before logging in.";
        } else if (err.message.includes("Invalid login") || err.message.includes("credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (err.message.includes("rate limit")) {
          errorMessage = "Too many login attempts. Please try again later.";
        }
      }
      
      setError(errorMessage);
      // No need for toast here as the AuthContext already shows a toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-therapy-offwhite flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="PsyPlex Logo" className="w-10 h-10 rounded-full object-cover bg-white" />
            <span className="font-bold text-2xl text-therapy-gray">PsyPlex</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="therapist@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-therapy-purple hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-therapy-purple hover:bg-therapy-purpleDeep"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <GoogleSignInButton isLoading={isLoading} />
              
              <div className="text-center text-sm mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-therapy-purple font-semibold hover:underline text-base">
                  Sign up
                </Link>
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full border-therapy-purple text-therapy-purple hover:bg-therapy-purple hover:text-white"
                  onClick={() => navigate('/register')}
                >
                  Create New Account
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
