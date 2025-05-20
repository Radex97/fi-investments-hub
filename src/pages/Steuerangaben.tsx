import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import KnowledgeExperiencePopup, { 
  InvestmentCategory, 
  InvestmentType,
  InvestmentAmount,
  InvestmentFrequency,
  PopupMode 
} from "@/components/KnowledgeExperiencePopup";

const Steuerangaben = () => {
  const [vatId, setVatId] = useState<string>("");
  const [registryNumber, setRegistryNumber] = useState<string>("");
  const [registryCourt, setRegistryCourt] = useState<string>("");
  const [isRightfulOwner, setIsRightfulOwner] = useState<boolean>(false);
  const [isNotUSCitizen, setIsNotUSCitizen] = useState<boolean>(false);
  const [isNotUSResident, setIsNotUSResident] = useState<boolean>(false);
  
  const [showInvestmentDetailsPopup, setShowInvestmentDetailsPopup] = useState<boolean>(false);
  const [showKnowledgeTypesPopup, setShowKnowledgeTypesPopup] = useState<boolean>(false);
  const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<InvestmentType[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState<InvestmentAmount | null>(null);
  const [investmentFrequency, setInvestmentFrequency] = useState<InvestmentFrequency | null>(null);
  
  const [showKnowledgePopup, setShowKnowledgePopup] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<InvestmentCategory>("Aktien");
  const [experienceData, setExperienceData] = useState<Record<InvestmentCategory, string | null>>({
    "Aktien": null,
    "Anleihen": null,
    "Investmentfonds": null,
    "Zertifikate": null,
    "Alternative Anlagen": null
  });
  
  const categories: InvestmentCategory[] = [
    "Aktien", "Anleihen", "Investmentfonds", "Zertifikate", "Alternative Anlagen"
  ];
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleFileUpload = () => {
    toast.info("Dateien können hochgeladen werden", {
      description: "Funktion ist in dieser Demo nicht implementiert."
    });
  };

  const handleSubmit = () => {
    if (!vatId) {
      toast.error("Bitte geben Sie Ihre Umsatzsteuer-ID ein");
      return;
    }
    
    if (!registryNumber) {
      toast.error("Bitte geben Sie Ihre Handelsregisternummer ein");
      return;
    }
    
    if (!registryCourt) {
      toast.error("Bitte geben Sie Ihr Handelsregistergericht ein");
      return;
    }
    
    if (!isRightfulOwner || !isNotUSCitizen || !isNotUSResident) {
      toast.error("Bitte bestätigen Sie alle erforderlichen Erklärungen");
      return;
    }
    
    setShowInvestmentDetailsPopup(true);
  };
  
  const handleInvestmentDetailsComplete = (data: { investmentAmount: InvestmentAmount, investmentFrequency: InvestmentFrequency }) => {
    setInvestmentAmount(data.investmentAmount);
    setInvestmentFrequency(data.investmentFrequency);
    setShowInvestmentDetailsPopup(false);
    
    setShowKnowledgeTypesPopup(true);
  };
  
  const handleKnowledgeTypesComplete = (data: { investmentTypes: InvestmentType[] }) => {
    setSelectedInvestmentTypes(data.investmentTypes);
    setShowKnowledgeTypesPopup(false);
    
    setCurrentCategoryIndex(0);
    setCurrentCategory(categories[0]);
    setShowKnowledgePopup(true);
  };
  
  const handleExperienceComplete = (data: { category: InvestmentCategory, experience: string }) => {
    setExperienceData(prev => ({
      ...prev,
      [data.category]: data.experience
    }));
    
    if (currentCategoryIndex < categories.length - 1) {
      const nextIndex = currentCategoryIndex + 1;
      setCurrentCategoryIndex(nextIndex);
      setCurrentCategory(categories[nextIndex]);
    } else {
      setShowKnowledgePopup(false);
      
      localStorage.setItem("investmentExperience", JSON.stringify(experienceData));
      localStorage.setItem("investmentTypes", JSON.stringify(selectedInvestmentTypes));
      localStorage.setItem("investmentAmount", investmentAmount || "");
      localStorage.setItem("investmentFrequency", investmentFrequency || "");
      
      const productTitle = location.state?.productTitle || localStorage.getItem("currentProductTitle") || "FI Investments Produkt";
      
      navigate("/payment-account", { 
        state: { 
          productTitle,
          experienceData,
          investmentTypes: selectedInvestmentTypes,
          investmentAmount,
          investmentFrequency
        } 
      });
    }
  };
  
  const handleBackFromExperience = () => {
    if (currentCategoryIndex === 0) {
      setShowKnowledgePopup(false);
      setShowKnowledgeTypesPopup(true);
    } else {
      const prevIndex = currentCategoryIndex - 1;
      setCurrentCategoryIndex(prevIndex);
      setCurrentCategory(categories[prevIndex]);
    }
  };
  
  const handleBackFromInvestmentDetails = () => {
    setShowInvestmentDetailsPopup(false);
  };
  
  const handleBackFromKnowledgeTypes = () => {
    setShowKnowledgeTypesPopup(false);
    setShowInvestmentDetailsPopup(true);
  };
  
  const handleBack = () => {
    navigate("/authorized-person");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-[#003595] px-4 py-3 flex items-center justify-between fixed w-full top-0 z-50">
        <button onClick={handleBack} className="text-[#B1904B]">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="w-32 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#003595] font-medium">FI Investments</span>
          </div>
        </div>
        <div className="w-6"></div>
      </header>
      
      <main className="flex-1 pt-20 px-4 pb-24">
        <div className="mb-6">
          <h1 className="text-xl text-[#222733] mb-2">Steuerangaben</h1>
          <p className="text-neutral-600 text-sm">
            Für die digitale Zeichnung benötigen wir Ihre Unternehmenssteuerangaben. Bitte geben Sie die Daten gemäß Ihrer Steuerdokumente an.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vat-id">Umsatzsteuer-ID</Label>
              <Input
                id="vat-id"
                value={vatId}
                onChange={(e) => setVatId(e.target.value)}
                placeholder="DE123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registry-number">Handelsregisternummer</Label>
              <Input
                id="registry-number"
                value={registryNumber}
                onChange={(e) => setRegistryNumber(e.target.value)}
                placeholder="HRB 12345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registry-court">Handelsregistergericht</Label>
              <Input
                id="registry-court"
                value={registryCourt}
                onChange={(e) => setRegistryCourt(e.target.value)}
                placeholder="Amtsgericht München"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Handelsregisterauszug hochladen</Label>
              <div 
                onClick={handleFileUpload}
                className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:bg-neutral-50"
              >
                <Upload className="mx-auto h-6 w-6 text-[#B1904B] mb-2" />
                <p className="text-sm text-neutral-600">PDF hochladen</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="rightful-owner" 
                checked={isRightfulOwner}
                onCheckedChange={(checked) => setIsRightfulOwner(checked as boolean)}
                className="mt-1 border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
              />
              <Label 
                htmlFor="rightful-owner" 
                className="text-sm text-neutral-600"
              >
                Ich bestätige hiermit, dass ich eine wirtschaftlich berechtigte Person mit einem legitimen finanziellen Interesse an dieser Investition bin.
              </Label>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Ausschluss von Staatsangehörigkeit/Wohnsitz</p>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="not-us-citizen" 
                  checked={isNotUSCitizen}
                  onCheckedChange={(checked) => setIsNotUSCitizen(checked as boolean)}
                  className="border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
                />
                <Label htmlFor="not-us-citizen" className="text-sm">
                  Ich bin kein Staatsbürger der USA
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="not-us-resident" 
                  checked={isNotUSResident}
                  onCheckedChange={(checked) => setIsNotUSResident(checked as boolean)}
                  className="border-[#B1904B] data-[state=checked]:bg-[#B1904B]"
                />
                <Label htmlFor="not-us-resident" className="text-sm">
                  Ich habe keinen Wohnsitz in den USA
                </Label>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-neutral-600 p-4 bg-neutral-100 rounded-lg">
            Bitte beachten Sie, dass alle Angaben wahrheitsgemäß und vollständig sein müssen. Falsche Angaben können rechtliche Konsequenzen haben.
          </div>
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-40">
        <div className="flex gap-4">
          <Button 
            onClick={handleBack}
            className="flex-1 border-[#B1904B] text-[#B1904B] bg-white hover:bg-neutral-100"
            variant="outline"
          >
            Zurück
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
          >
            Weiter
          </Button>
        </div>
      </div>
      
      <footer className="fixed bottom-16 w-full bg-[#003595] text-white text-xs py-2 text-center z-30">
        <div className="flex justify-center space-x-4">
          <Link to="/impressum" className="hover:text-white/100 text-white/80">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-white/100 text-white/80">Datenschutz</Link>
          <Link to="/agb" className="hover:text-white/100 text-white/80">AGB</Link>
        </div>
      </footer>
      
      <KnowledgeExperiencePopup 
        open={showInvestmentDetailsPopup}
        onOpenChange={setShowInvestmentDetailsPopup}
        mode="investmentDetails"
        onComplete={handleInvestmentDetailsComplete}
        onBack={handleBackFromInvestmentDetails}
      />
      
      <KnowledgeExperiencePopup 
        open={showKnowledgeTypesPopup}
        onOpenChange={setShowKnowledgeTypesPopup}
        mode="knowledge"
        onComplete={handleKnowledgeTypesComplete}
        onBack={handleBackFromKnowledgeTypes}
      />
      
      <KnowledgeExperiencePopup 
        open={showKnowledgePopup}
        onOpenChange={setShowKnowledgePopup}
        mode="experience"
        category={currentCategory}
        onComplete={handleExperienceComplete}
        onBack={handleBackFromExperience}
      />
    </div>
  );
};

export default Steuerangaben;
