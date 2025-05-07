
import { Navigate, Outlet } from "react-router-dom";

// This is a placeholder for actual authentication
// When integrating with a backend, you'll implement proper auth checks
const isAuthenticated = () => {
  // For now, we'll assume the user is authenticated
  // In a real app, check for a valid token or session
  return true;
};

const AuthLayout = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default AuthLayout;
