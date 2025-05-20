
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopBar from "@/components/TopBar";
import { useLanguage } from "@/contexts/LanguageContext";

const EmailConfirmation = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = "Email Confirmation | FI Investments";
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar showBackButton={true} />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">{t('emailConfirmation')}</h2>
          <p className="text-gray-700 mb-4 text-center">
            {t('checkEmailForConfirmation')}
          </p>
          <div className="text-center">
            <Link to="/login" className="text-blue-500 hover:underline">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmation;
