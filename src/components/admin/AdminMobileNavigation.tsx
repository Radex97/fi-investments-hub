
import { Home, Users, Package, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMobileNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const AdminMobileNavigation = ({ activeSection, setActiveSection, onLogout }: AdminMobileNavigationProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "users", label: "Personen", icon: <Users size={20} /> },
    { id: "products", label: "Produkte", icon: <Package size={20} /> },
    { id: "notifications", label: "Benachr.", icon: <Bell size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-0.5",
              activeSection === item.id
                ? "text-[#003595]"
                : "text-gray-600"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-full",
                activeSection === item.id && "bg-[#003595]/10"
              )}
            >
              <span className={activeSection === item.id ? "text-[#B1904B]" : ""}>
                {item.icon}
              </span>
            </div>
            <span className="text-xs mt-1 w-full text-center truncate">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center py-2 px-0.5 text-gray-600"
        >
          <div className="p-1 rounded-full">
            <LogOut size={20} />
          </div>
          <span className="text-xs mt-1 w-full text-center">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminMobileNavigation;
