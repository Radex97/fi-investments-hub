
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  User,
  ChevronDown,
  Settings,
  LogOut,
  MessageCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { useSupportChat } from "@/hooks/useSupportChat";
import SupportChat from "@/components/support/SupportChat";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
  const { data: notifications } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const { isChatOpen, openChat, closeChat } = useSupportChat();

  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  return (
    <>
      <header className="bg-[#003595] text-white shadow-md z-50 sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo section */}
            <div className="flex items-center">
              <Link to="/admin" className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/4efba9de-0b13-4ce1-90d1-11ad96e54bef.png" 
                  alt="FI Investments" 
                  className="h-8 w-auto object-contain" 
                />
              </Link>
            </div>

            {/* Navigation - Only visible on desktop */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/admin" className="text-white hover:text-gray-200 px-4 py-2">
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/admin/users" className="text-white hover:text-gray-200 px-4 py-2">
                      Personen
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/admin/products" className="text-white hover:text-gray-200 px-4 py-2">
                      Produkte
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            {/* Right side icons */}
            <div className="flex items-center space-x-2">
              {/* Chat Button */}
              <Button 
                onClick={openChat} 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-[#002b7a] transition-colors"
              >
                <MessageCircle size={20} />
              </Button>
              
              {/* Notifications */}
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-[#002b7a] transition-colors">
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-2 rounded hover:bg-[#002b7a] transition-colors">
                    <User size={20} className="text-white" />
                    <span className="hidden md:block text-sm font-medium">Admin</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-white" align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Einstellungen</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <SupportChat isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};

export default AdminHeader;
