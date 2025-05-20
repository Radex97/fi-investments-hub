
import { History, User, Settings, ChevronRight, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const DashboardNavigation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, adminLoading } = useAuth();

  const handleAdminClick = () => {
    console.log('DashboardNavigation: Admin button clicked, isAdmin:', isAdmin);
    if (isAdmin) {
      navigate('/admin');
    }
  };

  return (
    <nav className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start text-left bg-white hover:bg-gray-50 border-gray-200 p-4 h-auto"
        onClick={() => navigate('/portfolio')}
      >
        <Wallet className="h-5 w-5 text-fi-gold mr-3" />
        <span className="text-neutral-700 hover:text-neutral-900">{t("myPortfolio")}</span>
        <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-left bg-white hover:bg-gray-50 border-gray-200 p-4 h-auto"
        onClick={() => navigate('/transactions')}
      >
        <History className="h-5 w-5 text-fi-gold mr-3" />
        <span className="text-neutral-700 hover:text-neutral-900">{t("transactions")}</span>
        <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-left bg-white hover:bg-gray-50 border-gray-200 p-4 h-auto"
        onClick={() => navigate('/profile')}
      >
        <User className="h-5 w-5 text-fi-gold mr-3" />
        <span className="text-neutral-700 hover:text-neutral-900">{t("profile")}</span>
        <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-left bg-white hover:bg-gray-50 border-gray-200 p-4 h-auto"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-5 w-5 text-fi-gold mr-3" />
        <span className="text-neutral-700 hover:text-neutral-900">{t("settings")}</span>
        <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
      </Button>

      {adminLoading ? (
        <div className="w-full p-4 text-center text-neutral-500">Berechtigungen werden überprüft...</div>
      ) : isAdmin && (
        <Button
          variant="outline"
          className="w-full justify-start text-left bg-white hover:bg-gray-50 border-gray-200 p-4 h-auto"
          onClick={handleAdminClick}
        >
          <ShieldCheck className="h-5 w-5 text-fi-gold mr-3" />
          <span className="text-neutral-700 hover:text-neutral-900">Admin Dashboard</span>
          <ChevronRight className="h-5 w-5 ml-auto text-gray-400" />
        </Button>
      )}
    </nav>
  );
};
