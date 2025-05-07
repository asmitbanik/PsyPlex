
import { Link, useLocation } from "react-router-dom";
import { CalendarCheck, Users, FileText, BrainCircuit, LineChart, Home } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/therapist", icon: <Home className="w-5 h-5" /> },
    { name: "Clients", path: "/therapist/clients", icon: <Users className="w-5 h-5" /> },
    { name: "Sessions", path: "/therapist/sessions", icon: <CalendarCheck className="w-5 h-5" /> },
    { name: "Therapy Insights", path: "/therapist/insights", icon: <BrainCircuit className="w-5 h-5" /> },
    { name: "Progress Tracker", path: "/therapist/progress", icon: <LineChart className="w-5 h-5" /> },
    { name: "Notes", path: "/therapist/notes", icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <aside 
      className={`bg-white shadow-md fixed inset-y-0 left-0 z-50 w-64 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/therapist" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-therapy-purple flex items-center justify-center">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-semibold text-xl text-therapy-gray">MindfulPro</span>
        </Link>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== "/therapist" && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-therapy-purpleLight text-therapy-purple"
                      : "text-therapy-gray hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-therapy-blue flex items-center justify-center text-therapy-purpleDeep font-semibold">
            TP
          </div>
          <div>
            <p className="font-medium text-therapy-gray">Dr. Taylor Parker</p>
            <p className="text-sm text-gray-500">Clinical Psychologist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
