
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AGB = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-fi-blue shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/rechtliches" className="text-fi-gold">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-white font-bold">{t('termsAndConditions')}</span>
          <div className="w-6"></div>
        </div>
      </header>
      
      <main className="pt-16 pb-24 px-4">
        <div className="space-y-6">
          <section>
            <h1 className="text-2xl font-semibold mb-3">{t('termsAndConditions')}</h1>
            <p className="mb-4">{t('lastUpdated')}: {t('may')} 2023</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. {t('scope')}</h2>
            <p className="mb-4">
              {t('termsScope')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. {t('serviceDescription')}</h2>
            <p className="mb-4">
              {t('serviceDetails')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. {t('contractConclusion')}</h2>
            <p className="mb-4">
              {t('contractDetails')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. {t('paymentTerms')}</h2>
            <p className="mb-4">
              {t('paymentDetails')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. {t('liability')}</h2>
            <p className="mb-4">
              {t('liabilityDetails')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. {t('termination')}</h2>
            <p className="mb-4">
              {t('terminationDetails')}
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. {t('finalProvisions')}</h2>
            <p className="mb-4">
              {t('finalProvisionsDetails')}
            </p>
          </section>
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full bg-fi-blue text-white">
        <div className="px-4 py-4 text-center text-sm">
          <p>{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default AGB;
