
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Impressum = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-fi-blue shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/rechtliches" className="text-fi-gold">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <span className="text-white font-bold">{t('impressum')}</span>
          <div className="w-6"></div>
        </div>
      </header>
      
      <main className="pt-16 pb-24 px-4">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">FI Emissions GmbH</h2>
            <p className="mb-2">{t('managingDirector')}: Vito Micoli</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('address')}</h2>
            <p className="mb-2">Ballindamm 27</p>
            <p className="mb-2">20095 Hamburg</p>
            <p className="mb-2">Deutschland</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('contact')}</h2>
            <p className="mb-2">{t('phone')}: +49 40 696384155</p>
            <p className="mb-2">E-Mail: secretary@fi.group</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('commercialRegister')}</h2>
            <p className="mb-2">{t('registerCourt')}: Amtsgericht Hamburg</p>
            <p className="mb-2">{t('registerNumber')}: HRB 185398</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('vatId')}</h2>
            <p className="mb-2">{t('vatIdDesc')}: DE365345652</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('economicIdentifier')}</h2>
            <p className="mb-2">LEI 5299005AEZA4FSYM1B17</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('onlineDisputeResolution')}</h2>
            <p className="mb-2">{t('onlineDisputeDesc')} <a href="https://ec.europa.eu/consumers/odr/" className="text-fi-gold underline">https://ec.europa.eu/consumers/odr/</a>. {t('onlineDisputeEndDate')}</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('disputeResolutionProcedure')}</h2>
            <p className="mb-2">{t('disputeResolutionDesc')}</p>
          </section>
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full bg-fi-blue text-white">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <Link to="/faq" className="text-white">{t('customerService')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Impressum;
