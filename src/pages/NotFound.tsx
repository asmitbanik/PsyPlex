
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-therapy-offwhite flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-therapy-purple flex items-center justify-center mb-4">
          <BrainCircuit size={32} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold text-therapy-gray">404</h1>
        <h2 className="text-2xl font-semibold text-therapy-gray">Page Not Found</h2>
        <p className="text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-therapy-purple hover:bg-therapy-purpleDeep">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
