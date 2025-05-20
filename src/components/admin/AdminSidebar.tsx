
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Settings, 
  Home, 
  Calculator, 
  ClipboardList,
  FileCheck,
  Bell
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, setActiveSection }) => {
  const sidebarLinks = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      id: 'dashboard'
    },
    {
      title: 'Benutzerverwaltung',
      icon: <Users size={20} />,
      id: 'users'
    },
    {
      title: 'Produkte',
      icon: <Package size={20} />,
      id: 'products'
    },
    {
      title: 'Anstehende Zeichnungen',
      icon: <FileCheck size={20} />,
      id: 'pending-subscriptions'
    },
    {
      title: 'Benachrichtigungen',
      icon: <Bell size={20} />,
      id: 'notifications'
    },
    {
      title: 'Produkt-Konfiguration',
      icon: <Settings size={20} />,
      id: 'product-config'
    },
    {
      title: 'Rendite-Berechnung',
      icon: <Calculator size={20} />,
      id: 'yield-calc'
    },
    {
      title: 'Aktivitätsprotokolle',
      icon: <ClipboardList size={20} />,
      id: 'activity-logs'
    }
  ];

  return (
    <div className="bg-white h-screen fixed top-0 left-0 w-64 border-r border-gray-200 pt-16 z-30">
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#B1904B] mb-1">Admin-Portal</h2>
          <p className="text-xs text-gray-500">Verwaltung & Konfiguration</p>
        </div>

        <nav className="space-y-1">
          {sidebarLinks.map((link) => (
            <Button
              key={link.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal",
                activeSection === link.id
                  ? "bg-gray-100 text-[#B1904B]"
                  : "text-gray-600 hover:text-[#B1904B] hover:bg-gray-50"
              )}
              onClick={() => setActiveSection(link.id)}
            >
              <span className="mr-3">{link.icon}</span>
              {link.title}
            </Button>
          ))}
        </nav>
        
        <div className="mt-8 pt-8 border-t">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              <span className="mr-2">←</span>
              Zurück zum Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
