
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Bell, Globe, User, LogOut, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/utils/translations";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/useNotificationSettings";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { data: settings, isLoading: settingsLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  
  useEffect(() => {
    document.title = `FI Investments | ${t('settings')}`;
  }, [language, t]);

  const handleLogout = () => {
    navigate("/login");
  };

  const languages = {
    de: "Deutsch",
    en: "English",
    it: "Italiano"
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  const handleNotificationToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1 pt-16 pb-24">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-semibold mb-6">{t('settings')}</h1>
          
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">{t('account')}</h2>
              </div>
              
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                onClick={() => navigate("/profile")}
              >
                <div className="flex items-center">
                  <User className="w-5 h-5 text-fi-gold mr-3" />
                  <span>{t('editProfile')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
              
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                onClick={() => navigate("/two-factor-auth")}
              >
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-fi-gold mr-3" />
                  <span>{t('twoFactorAuth')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">{t('appSettings')}</h2>
              </div>
              
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                onClick={() => navigate("/notifications")}
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-fi-gold mr-3" />
                  <span>{t('notifications')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-fi-gold mr-3" />
                  <span>{t('language')}</span>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={t('language')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">{languages.de}</SelectItem>
                    <SelectItem value="en">{languages.en}</SelectItem>
                    <SelectItem value="it">{languages.it}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Benachrichtigungen</h2>
              </div>
              
              {settingsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : settings ? (
                <>
                  <div className="p-4 flex items-center justify-between">
                    <span>E-Mail-Benachrichtigungen</span>
                    <Switch 
                      checked={settings.email_enabled} 
                      onCheckedChange={(checked) => handleNotificationToggle('email_enabled', checked)}
                      className="data-[state=checked]:bg-fi-gold"
                    />
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <span>Push-Benachrichtigungen</span>
                    <Switch 
                      checked={settings.push_enabled} 
                      onCheckedChange={(checked) => handleNotificationToggle('push_enabled', checked)}
                      className="data-[state=checked]:bg-fi-gold"
                    />
                  </div>
                  
                  <div className="p-4 border-t pt-5">
                    <h3 className="text-sm font-medium text-neutral-500 mb-4">Benachrichtigungstypen</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Produkt-Updates</span>
                        <Switch 
                          checked={settings.product_updates} 
                          onCheckedChange={(checked) => handleNotificationToggle('product_updates', checked)}
                          className="data-[state=checked]:bg-fi-gold"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Transaktions-Benachrichtigungen</span>
                        <Switch 
                          checked={settings.transaction_alerts} 
                          onCheckedChange={(checked) => handleNotificationToggle('transaction_alerts', checked)}
                          className="data-[state=checked]:bg-fi-gold"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Marketing-Benachrichtigungen</span>
                        <Switch 
                          checked={settings.marketing_notifications} 
                          onCheckedChange={(checked) => handleNotificationToggle('marketing_notifications', checked)}
                          className="data-[state=checked]:bg-fi-gold"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-neutral-500">
                  Einstellungen konnten nicht geladen werden
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                className="p-4 flex items-center text-red-500 cursor-pointer hover:bg-neutral-50"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>{t('logout')}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-neutral-500">
            <p>{t('version')} 1.0.0</p>
            <p className="mt-1">© {new Date().getFullYear()} FI Investments</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
