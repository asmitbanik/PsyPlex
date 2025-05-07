
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  return (
    <div className="bg-therapy-offwhite min-h-screen flex flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={`flex-1 transition-all ${sidebarOpen && !isMobile ? 'md:ml-64' : ''}`}>
        <div className="p-4 md:p-8">
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 bg-therapy-purple text-white p-2 rounded-md"
            >
              {sidebarOpen ? "Close Menu" : "Open Menu"}
            </button>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
