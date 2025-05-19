import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck, Users, FileText, BrainCircuit, LineChart, Home, UserCircle, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Define navigation items outside component to prevent recreations
const navigationItems = [
  { name: "Dashboard", path: "/therapist", icon: <Home className="w-5 h-5" />, exact: true },
  { name: "Clients", path: "/therapist/clients", icon: <Users className="w-5 h-5" /> },
  { name: "Sessions", path: "/therapist/sessions", icon: <CalendarCheck className="w-5 h-5" /> },
  { name: "Therapy Insights", path: "/therapist/insights", icon: <BrainCircuit className="w-5 h-5" /> },
  { name: "Progress Tracker", path: "/therapist/progress", icon: <LineChart className="w-5 h-5" /> },
  { name: "Notes", path: "/therapist/notes", icon: <FileText className="w-5 h-5" /> }
  // Profile removed from main nav - now using dedicated button below
];

// Create functional component for Sidebar
const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  // Component state
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Handle navigation with standard React navigation
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
    
    // Navigate to the path
    navigate(path);
  };

  // Handle logout 
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
      setIsSigningOut(false);
    }
  };
  
  // Handle mobile sidebar close
  const handleCloseSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  // Get current active path
  const isActivePath = (path: string, exact: boolean = false) => {
    return exact 
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-therapy-offwhite shadow-xl fixed inset-y-0 left-0 z-50 w-56 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col border-r border-gray-200`}
      data-sidebar-id="main-sidebar"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        {/* Logo and brand - using button with onClick instead of Link */}
        <button 
          className="flex items-center space-x-2 bg-transparent border-0 cursor-pointer"
          onClick={(e) => handleNavigation('/therapist', e)}
        >
          <img src="/logo.png" alt="PsyPlex Logo" className="w-8 h-8 rounded-xl shadow-md object-cover bg-white" />
          <h1 className="font-extrabold text-xl text-therapy-purple tracking-wide" style={{ fontFamily: 'Ovo, serif' }}>PsyPlex</h1>
        </button>
        <button 
          onClick={handleCloseSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-2xl font-bold"
          type="button"
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 pt-2">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path, item.exact);
            
            return (
              <li key={`${item.name}-${isActive ? 'active' : 'inactive'}`}>
                {/* Use Link from react-router for native navigation */}
                <button
                  onClick={(e) => handleNavigation(item.path, e)}
                  className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all group relative
                    ${isActive
                      ? "bg-therapy-purple/10 text-therapy-purple border-l-3 border-therapy-purple shadow-sm"
                      : "text-therapy-gray hover:bg-gray-100 hover:shadow"
                    }`
                  }
                  type="button"
                >
                  <span className={`flex items-center justify-center w-5 h-5 ${isActive ? 'text-therapy-purple' : 'text-gray-400 group-hover:text-therapy-purple'} transition-colors`}>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 border-t border-gray-200 space-y-2">
        {/* Profile button */}
        <button
          onClick={(e) => handleNavigation('/therapist/profile', e)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all group relative text-blue-600 hover:bg-blue-50"
          type="button"
        >
          <span className="flex items-center justify-center w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors">
            <User className="w-5 h-5" />
          </span>
          <span>My Profile</span>
        </button>
        
        {/* Direct logout button with more robust event handling */}
        <button
          onClick={handleLogout}
          disabled={isSigningOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all group relative text-red-600 hover:bg-red-50"
          type="button"
        >
          <span className="flex items-center justify-center w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </span>
          <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
        </button>
      </div>
    </aside>
  );
};

// Export default component
export default Sidebar;
