
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon, MessageCircle } from "lucide-react";
import Menu from "./Menu";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportChat } from "@/hooks/useSupportChat";
import SupportChat from "@/components/support/SupportChat";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface TopBarProps {
  showBackButton?: boolean;
}

const TopBar = ({ showBackButton = true }: TopBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isChatOpen, openChat, closeChat } = useSupportChat();
  const { t } = useLanguage();

  const handleMenuClick = () => {
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-[#003595] px-4 py-3 flex items-center justify-between shadow-md">
        <button onClick={handleMenuClick} className="text-white" aria-label={t('openMenu')}>
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img 
              src="/lovable-uploads/4efba9de-0b13-4ce1-90d1-11ad96e54bef.png" 
              alt="FI Investments" 
              className="h-8" 
            />
          </Link>
        </div>
        <Button 
          onClick={openChat} 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-[#002b7a] transition-colors"
          aria-label={t('customerSupport')}
        >
          <MessageCircle size={20} />
        </Button>
      </header>
      {menuOpen && <Menu isOpen={menuOpen} onClose={handleMenuClose} />}
      <SupportChat isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
};

export default TopBar;
