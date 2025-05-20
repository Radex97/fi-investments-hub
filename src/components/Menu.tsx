
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart3, 
  Gauge, 
  User, 
  Briefcase, 
  History, 
  Bell, 
  Settings, 
  Headphones, 
  Info,
  ShieldCheck,
  FileText,
  X,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MenuItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const MenuItem = ({ to, icon, label, isActive, onClick }: MenuItemProps) => (
  <li>
    <Link 
      to={to} 
      className={`flex items-center space-x-4 p-3 rounded-md ${isActive ? 'bg-fi-blue/10' : 'hover:bg-fi-blue/5'}`}
      onClick={onClick}
    >
      <span className="text-fi-gold">{icon}</span>
      <span className="text-[#222733] text-base">{label}</span>
    </Link>
  </li>
);

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Menu = ({ isOpen, onClose }: MenuProps) => {
  const location = useLocation();
  const { isAdmin, adminLoading } = useAuth();
  
  if (!isOpen) return null;

  const menuItems = [
    { to: "/", icon: <Home size={22} />, label: "Startseite" },
    { to: "/products", icon: <BarChart3 size={22} />, label: "Finanzprodukte" },
    { to: "/dashboard", icon: <Gauge size={22} />, label: "Dashboard" },
    { to: "/profile", icon: <User size={22} />, label: "Profilverwaltung" },
    { to: "/portfolio", icon: <Briefcase size={22} />, label: "Investmentportfolio" },
    { to: "/transactions", icon: <History size={22} />, label: "Transaktionsverlauf" },
    { to: "/my-applications", icon: <FileText size={22} />, label: "Investment-Status" },
    { to: "/notifications", icon: <Bell size={22} />, label: "Benachrichtigungen" },
    { to: "/settings", icon: <Settings size={22} />, label: "Einstellungen" },
    { to: "/faq", icon: <Headphones size={22} />, label: "Support" },
    { to: "/rechtliches", icon: <Info size={22} />, label: "Information" },
  ];
  
  if (isAdmin) {
    menuItems.push({ to: "/admin", icon: <ShieldCheck size={22} />, label: "Admin Dashboard" });
  }

  return (
    <div className="fixed inset-0 bg-[#F4F8FA] min-h-screen w-full overflow-y-auto z-50">
      <header className="bg-fi-blue p-4 flex items-center justify-between sticky top-0">
        <div className="w-24">
          <img 
            src="/lovable-uploads/6295cab9-c14e-436c-b9db-eef568bbc657.png" 
            alt="FI Investments" 
            className="h-8" 
          />
        </div>
        <button className="text-white" onClick={onClose}>
          <X size={24} />
        </button>
      </header>
      <nav className="px-6 py-8 pb-24">
        {adminLoading ? (
          <div className="p-4 text-center text-gray-500">
            Überprüfe Berechtigungen...
          </div>
        ) : (
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onClick={onClose}
              />
            ))}
          </ul>
        )}
      </nav>
      <footer className="bg-fi-blue p-6 fixed bottom-0 w-full">
        <div className="flex flex-wrap justify-between text-white text-sm">
          <Link to="/datenschutz" className="hover:underline cursor-pointer mb-1 mr-3" onClick={onClose}>Datenschutz</Link>
          <Link to="/agb" className="hover:underline cursor-pointer mb-1 mr-3" onClick={onClose}>Nutzungsbedingungen</Link>
          <Link to="/faq" className="hover:underline cursor-pointer mb-1" onClick={onClose}>Kontakt</Link>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
