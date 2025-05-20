
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-fi-blue shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-fi-gold">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <img 
            src="/lovable-uploads/36244e64-d6bc-459e-a671-c91f3ede1524.png" 
            alt="FI Investments" 
            className="h-8 w-auto object-contain" 
          />
          <div className="w-6"></div>
        </div>
      </header>
      
      <main className="pt-16 pb-24">
        <section className="px-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Über Uns</h2>
            <p className="text-neutral-700">
              FI Emissions GmbH, als Teil der FI Group, ist ein führender
              Anbieter von Finanzprodukten mit über 60
              Jahren Erfahrung im Team. Unsere Mission ist es, innovative
              und nachhaltige Finanzlösungen anzubieten.
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Rechtliche Informationen</h2>
            <div className="space-y-3">
              <Link 
                to="/impressum"
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <span>Impressum</span>
                <span className="text-fi-gold">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </span>
              </Link>
              
              <Link 
                to="/datenschutz"
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <span>Datenschutzerklärung</span>
                <span className="text-fi-gold">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </span>
              </Link>
              
              <Link to="/agb" className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <span>Allgemeine Geschäftsbedingungen</span>
                <span className="text-fi-gold">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </span>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Regulatorische Informationen</h2>
            <p className="text-neutral-700">
              FI Emissions GmbH emittiert nur Produkte, die allen regulatorischen Anforderungen erfüllen und in der Regel bei der Börse Hamburg gelistet werden. Registrierungsnummer: HRB 185398
              Amtsgericht Hamburg.
            </p>
          </div>
        </section>
      </main>
      
      <footer className="fixed bottom-0 w-full bg-fi-blue text-white">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <Link to="/faq" className="text-white">Kundenservice</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Legal;
