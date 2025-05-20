
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const DashboardFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-fi-blue text-white text-sm py-4 px-4">
      <div className="flex justify-between mb-4">
        <Link to="/impressum" className="hover:text-fi-gold transition-colors">{t("impressum")}</Link>
        <Link to="/datenschutz" className="hover:text-fi-gold transition-colors">{t("privacy")}</Link>
        <Link to="/hilfe" className="hover:text-fi-gold transition-colors">{t("help")}</Link>
      </div>
      <p className="text-center text-xs opacity-75">{t("copyright")}</p>
    </footer>
  );
};
