
import { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKey, translations } from '@/utils/translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('de');

  // Load language preference when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['de', 'en', 'it'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Fallback to browser language or default to German
      const browserLang = navigator.language.split('-')[0];
      if (['de', 'en', 'it'].includes(browserLang as Language)) {
        setLanguage(browserLang as Language);
      }
    }
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  // Store language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
