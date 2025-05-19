
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "../hooks/useIsMobile";

/**
 * Layout component - completely rewritten to fix navigation issues
 * Particularly when navigating between Dashboard and Profile pages
 */
const Layout = () => {
  // Get current location and mobile status
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Control sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // This forces a remount of components when location changes
  // Critical for fixing navigation issues between pages
  const [pageKey, setPageKey] = useState(`page-${Date.now()}`);

  // Update when route changes
  useEffect(() => {
    // Generate new key to force remount
    setPageKey(`page-${Date.now()}`);
    
    // Close sidebar on mobile automatically
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="bg-therapy-offwhite min-h-screen flex flex-col md:flex-row">
      {/* Sidebar with key to force remounting when navigating to/from Profile */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        key={`sidebar-${pageKey}`}
      />

      {/* Main content also uses key to ensure clean remount */}
      <div className={`flex-1 transition-all ${isSidebarOpen && !isMobile ? 'md:ml-56' : ''}`}>
        <main className="p-3 md:p-6" key={pageKey}>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="mb-4 px-4 py-2 bg-therapy-purple text-white rounded-lg shadow-md"
              type="button"
            >
              {isSidebarOpen ? "Close Menu" : "Open Menu"}
            </button>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
