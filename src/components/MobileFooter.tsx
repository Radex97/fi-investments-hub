
import { Home, PieChart, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isIOS } from "@/utils/capacitorIntegration";

const MobileFooter = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const hasBottomSafeArea = isIOS();

  return (
    <footer className={`fixed bottom-0 w-full bg-fi-blue text-white py-4 z-40 ${hasBottomSafeArea ? 'pb-[calc(1rem+var(--safe-area-bottom,0))]' : ''}`}>
      <div className="flex justify-around">
        <Link to="/" className="flex flex-col items-center">
          <Home className={`${isActive('/') ? 'text-white' : 'text-fi-gold'} h-5 w-5`} />
          <span className="text-xs mt-1">{t('home')}</span>
        </Link>
        <Link to="/portfolio" className="flex flex-col items-center">
          <PieChart className={`${isActive('/portfolio') ? 'text-white' : 'text-fi-gold'} h-5 w-5`} />
          <span className="text-xs mt-1">{t('portfolio')}</span>
        </Link>
        <Link to="/products" className="flex flex-col items-center">
          <Plus className={`${isActive('/products') ? 'text-white' : 'text-fi-gold'} h-5 w-5`} />
          <span className="text-xs mt-1">{t('invest')}</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center">
          <User className={`${isActive('/profile') ? 'text-white' : 'text-fi-gold'} h-5 w-5`} />
          <span className="text-xs mt-1">{t('profile')}</span>
        </Link>
      </div>
    </footer>
  );
};

export default MobileFooter;
