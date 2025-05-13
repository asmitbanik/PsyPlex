import { Link, useLocation } from "react-router-dom";
import { CalendarCheck, Users, FileText, BrainCircuit, LineChart, Home, UserCircle } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";

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
      className={`bg-therapy-offwhite shadow-xl fixed inset-y-0 left-0 z-50 w-64 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col border-r border-gray-200`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <Link to="/therapist" className="flex items-center space-x-4">
          <img src="/logo.png" alt="PsyPlex Logo" className="w-12 h-12 rounded-2xl shadow-md object-cover bg-white" />
          <h1 className="font-extrabold text-2xl text-therapy-purple tracking-wide" style={{ fontFamily: 'Ovo, serif' }}>PsyPlex</h1>
        </Link>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-6">
        <ul className="space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== "/therapist" && location.pathname.startsWith(item.path));
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-3 rounded-xl text-lg font-semibold transition-all group relative
                    ${isActive
                      ? "bg-therapy-purple/10 text-therapy-purple border-l-4 border-therapy-purple shadow-sm"
                      : "text-therapy-gray hover:bg-gray-100 hover:shadow"
                    }`
                  }
                >
                  <span className={`flex items-center justify-center w-7 h-7 ${isActive ? 'text-therapy-purple' : 'text-gray-400 group-hover:text-therapy-purple'} transition-colors`}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>      <div className="p-6 border-t border-gray-200">
        <ProfileMenu />
      </div>
    </aside>
  );
};

export default Sidebar;
