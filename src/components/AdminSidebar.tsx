
import { Home, Users, Package, Settings } from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar = ({ activeSection, setActiveSection }: AdminSidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "users", label: "Personendaten", icon: <Users size={20} /> },
    { id: "products", label: "Produkte", icon: <Package size={20} /> },
    { id: "settings", label: "Einstellungen", icon: <Settings size={20} /> },
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16">
      <div className="py-4">
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-[#003595]/10 text-[#003595] font-medium border-l-4 border-[#003595]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className={`mr-3 ${activeSection === item.id ? "text-[#B1904B]" : "text-gray-500"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
