import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ZeichnungSteuerangaben = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [productTitle, setProductTitle] = useState<string>("FI Investments Produkt");
  const [taxId, setTaxId] = useState<string>("");
  const [isBeneficialOwner, setIsBeneficialOwner] = useState<boolean>(false);
  const [isNotRestrictedCitizen, setIsNotRestrictedCitizen] = useState<boolean>(false);
  const [isRiskAware, setIsRiskAware] = useState<boolean>(false);
  
  useEffect(() => {
    const title = location.state?.productTitle || localStorage.getItem("currentProductTitle");
    if (title) {
      setProductTitle(title);
    }
    
    document.title = `FI Investments | ${title || "Steuerangaben"}`;
  }, [location.state]);
  
  const handleBack = () => {
    navigate("/steuerangaben");
  };
  
  const handleNext = () => {
    if (!taxId) {
      toast.error("Bitte geben Sie Ihre Steuer-Identifikationsnummer ein");
      return;
    }
    
    if (!isBeneficialOwner || !isNotRestrictedCitizen || !isRiskAware) {
      toast.error("Bitte bestätigen Sie alle erforderlichen Erklärungen");
      return;
    }
    
    localStorage.setItem("taxId", taxId);
    navigate("/payment-account", { 
      state: { 
        ...location.state,
        taxId
      } 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="fixed w-full top-0 z-50 bg-[#003595] px-4 py-3 flex items-center justify-between">
        <button 
          onClick={handleBack}
          className="text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex justify-center">
          <img src="/lovable-uploads/fi-logo-white.png" alt="FI Investments" className="h-8" />
        </div>
        <div className="w-5"></div>
      </header>

      <main className="flex-1 mt-16 px-4 py-6 pb-32">
        <div className="mb-8">
          <h1 className="text-xl mb-2">
            Investition in {productTitle}
          </h1>
          <p className="text-neutral-600">
            Für die digitale Zeichnung benötigen wir Ihre Steuerdaten. Bitte geben Sie die Details gemäß Ihrer Steuerunterlagen an.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tax-id">Steuer-Identifikationsnummer</Label>
            <Input
              id="tax-id"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Geben Sie Ihre Steuer-ID ein"
              className="p-3"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="beneficial-owner"
                checked={isBeneficialOwner}
                onCheckedChange={(checked) => setIsBeneficialOwner(checked as boolean)}
                className="mt-1 border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
              />
              <Label 
                htmlFor="beneficial-owner" 
                className="text-sm text-neutral-600"
              >
                Ich bestätige, dass ich der wirtschaftlich Berechtigte bin und ein wirtschaftliches Interesse an dieser Transaktion habe.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="citizenship"
                checked={isNotRestrictedCitizen}
                onCheckedChange={(checked) => setIsNotRestrictedCitizen(checked as boolean)}
                className="mt-1 border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
              />
              <Label 
                htmlFor="citizenship" 
                className="text-sm text-neutral-600"
              >
                Ich bestätige, dass ich kein Staatsbürger/Einwohner der USA, Kanada, China oder Australien bin.
              </Label>
            </div>

            <p className="text-sm text-neutral-600 bg-neutral-100 p-3 rounded">
              Dieses Investmentprodukt ist nicht verfügbar für Bürger oder Einwohner der genannten Länder.
            </p>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="risk-awareness"
                checked={isRiskAware}
                onCheckedChange={(checked) => setIsRiskAware(checked as boolean)}
                className="mt-1 border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
              />
              <Label 
                htmlFor="risk-awareness" 
                className="text-sm text-neutral-600"
              >
                Ich bin mir der Risiken bewusst und bestätige, dass alle angegebenen Informationen wahrheitsgemäß sind.
              </Label>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t z-40">
        <div className="flex space-x-4">
          <Button 
            onClick={handleBack}
            className="flex-1 py-3 border border-[#B1904B] text-[#B1904B] bg-white hover:bg-neutral-100"
            variant="outline"
          >
            Zurück
          </Button>
          <Button 
            onClick={handleNext}
            className="flex-1 py-3 bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
          >
            Weiter
          </Button>
        </div>
      </div>

      <footer className="fixed bottom-0 w-full bg-[#003595] text-white py-3 z-30">
        <div className="flex justify-center space-x-4 text-xs">
          <Link to="/datenschutz" className="hover:text-white/100 text-white/80">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-white/100 text-white/80">Impressum</Link>
          <Link to="/agb" className="hover:text-white/100 text-white/80">AGB</Link>
        </div>
      </footer>
    </div>
  );
};

export default ZeichnungSteuerangaben;
