import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Download, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import KnowledgeExperiencePopup, { PopupMode, InvestmentCategory } from "@/components/KnowledgeExperiencePopup";
import { supabase } from "@/integrations/supabase/client";

const predefinedAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

const InvestmentAmount = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [brokerNumber, setBrokerNumber] = useState<string>("");
  const [customAmountError, setCustomAmountError] = useState<string>("");
  
  const [showDocumentDialog, setShowDocumentDialog] = useState<boolean>(false);
  const [documentsDownloaded, setDocumentsDownloaded] = useState<boolean>(false);
  
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState<boolean>(false);
  const [knowledgeCompleted, setKnowledgeCompleted] = useState<boolean>(false);
  const [currentKnowledgeMode, setCurrentKnowledgeMode] = useState<PopupMode>("investmentDetails");
  const [currentCategory, setCurrentCategory] = useState<InvestmentCategory>("Anleihen");
  
  const [showPepDialog, setShowPepDialog] = useState<boolean>(false);
  const [isPep, setIsPep] = useState<boolean | null>(null);
  const [pepRelationship, setPepRelationship] = useState<string>("");
  const [pepFunction, setPepFunction] = useState<string>("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const [productTitle, setProductTitle] = useState("FI Investments Produkt");
  
  // Add state for product data
  const [productData, setProductData] = useState<{
    title: string;
    id: string;
    terms_document_url?: string | null;
    info_document_url?: string | null;
  }>({
    title: "FI Investments Produkt",
    id: "",
    terms_document_url: null,
    info_document_url: null
  });

  useEffect(() => {
    if (location.state && location.state.productTitle) {
      setProductTitle(location.state.productTitle);
      localStorage.setItem("currentProductTitle", location.state.productTitle);
      
      // Store product ID if available
      if (location.state.productId) {
        localStorage.setItem("productId", location.state.productId);
        
        // Fetch product documents
        const fetchProductDocuments = async () => {
          try {
            const { data, error } = await supabase
              .from("products")
              .select("title, id, terms_document_url, info_document_url")
              .eq("id", location.state.productId)
              .single();
              
            if (error) {
              console.error("Error fetching product documents:", error);
            } else if (data) {
              setProductData({
                title: data.title,
                id: data.id,
                terms_document_url: data.terms_document_url,
                info_document_url: data.info_document_url
              });
            }
          } catch (error) {
            console.error("Error in fetchProductDocuments:", error);
          }
        };
        
        fetchProductDocuments();
      }
    }
  }, [location]);

  useEffect(() => {
    if (customAmount) {
      const amount = parseInt(customAmount);
      if (isNaN(amount)) {
        setCustomAmountError("Bitte geben Sie einen gültigen Betrag ein");
      } else if (amount % 1000 !== 0) {
        setCustomAmountError("Der Betrag muss ein Vielfaches von 1.000 € sein");
      } else {
        setCustomAmountError("");
      }
    } else {
      setCustomAmountError("");
    }
  }, [customAmount]);

  const handleAmountSelection = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleSubmit = () => {
    const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : null);
    
    if (!finalAmount) {
      toast("Bitte wählen Sie einen Betrag", {
        description: "Wählen Sie einen vordefinierten Betrag oder geben Sie einen individuellen Betrag ein.",
      });
      return;
    }

    if (customAmount && customAmountError) {
      toast("Ungültiger Betrag", {
        description: customAmountError,
      });
      return;
    }

    localStorage.setItem("investmentAmount", finalAmount.toString());

    setShowDocumentDialog(true);
  };

  const handleDownloadAllDocuments = () => {
    setDocumentsDownloaded(true);
    
    toast.success("Alle Dokumente werden heruntergeladen", {
      description: "Die Dateien werden in Kürze heruntergeladen.",
    });
    
    // Download available documents
    if (productData.terms_document_url) {
      // Create an anchor element and trigger download
      const termsLink = document.createElement('a');
      termsLink.href = productData.terms_document_url;
      termsLink.download = "Anleihebedingungen.pdf";
      document.body.appendChild(termsLink);
      termsLink.click();
      document.body.removeChild(termsLink);
    }
    
    if (productData.info_document_url) {
      // Create an anchor element and trigger download
      const infoLink = document.createElement('a');
      infoLink.href = productData.info_document_url;
      infoLink.download = "Basisinformationsblatt.pdf";
      document.body.appendChild(infoLink);
      infoLink.click();
      document.body.removeChild(infoLink);
    }
  };

  const startKnowledgeExperienceFlow = () => {
    setShowDocumentDialog(false);
    setCurrentKnowledgeMode("investmentDetails");
    setShowKnowledgeDialog(true);
  };

  const handleKnowledgeComplete = (data: any) => {
    console.log("Knowledge data:", data);
    
    if (currentKnowledgeMode === "investmentDetails") {
      setCurrentKnowledgeMode("experience");
      setCurrentCategory("Anleihen");
    } else if (currentKnowledgeMode === "experience") {
      setCurrentKnowledgeMode("knowledge");
    } else if (currentKnowledgeMode === "knowledge") {
      setKnowledgeCompleted(true);
      setShowKnowledgeDialog(false);
      setShowPepDialog(true);
    }
  };

  const handleKnowledgeBack = () => {
    if (currentKnowledgeMode === "experience") {
      setCurrentKnowledgeMode("investmentDetails");
    } else if (currentKnowledgeMode === "knowledge") {
      setCurrentKnowledgeMode("experience");
    }
  };

  const handlePepComplete = () => {
    if (isPep === null) {
      toast.error("Bitte wählen Sie, ob Sie eine politisch exponierte Person sind");
      return;
    }
    
    if (isPep && (!pepRelationship || !pepFunction)) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
      return;
    }
    
    localStorage.setItem("isPep", isPep.toString());
    if (isPep) {
      localStorage.setItem("pepRelationship", pepRelationship);
      localStorage.setItem("pepFunction", pepFunction);
    }
    
    setShowPepDialog(false);
    
    const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);
    navigate("/authorized-person", { 
      state: { 
        productTitle: productTitle,
        investmentAmount: finalAmount,
        brokerNumber: brokerNumber
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-[#003595] px-4 py-3 flex items-center justify-between">
        <Link to="/products" className="text-[#B1904B]">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/ff891d7a-641d-4efc-81d1-bb7ae825c3f9.png" 
            alt="FI Investments"
            className="h-8 object-contain"
          />
        </div>
        <div className="w-6"></div>
      </header>
      
      <main className="flex-1 pt-6 px-4 pb-32">
        <div className="mb-8">
          <h1 className="text-2xl text-[#222733] mb-3">Investment in {productTitle}</h1>
          <p className="text-neutral-600">
            Ich möchte mich mit folgendem Anlagebetrag an diesem Kapitalmarktprodukt beteiligen:
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          {predefinedAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              className={`border-2 ${
                selectedAmount === amount 
                  ? "bg-[#B1904B] text-white border-[#B1904B]" 
                  : "bg-white text-[#B1904B] border-[#B1904B] hover:bg-neutral-100"
              }`}
              onClick={() => handleAmountSelection(amount)}
            >
              {amount.toLocaleString('de-DE')} €
            </Button>
          ))}
        </div>
        
        <div className="mb-8">
          <label htmlFor="custom-amount" className="block text-sm text-neutral-600 mb-2">
            Individueller Betrag
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">€</span>
            <Input
              id="custom-amount"
              type="number"
              className="pl-8"
              placeholder="Betrag eingeben"
              value={customAmount}
              onChange={handleCustomAmountChange}
            />
          </div>
          {customAmountError && (
            <p className="mt-1 text-sm text-red-500">{customAmountError}</p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            Der Betrag muss ein Vielfaches von 1.000 € sein
          </p>
        </div>
        
        <div className="mb-12">
          <label htmlFor="broker-number" className="block text-sm text-neutral-600 mb-2">
            Vermittlernummer
          </label>
          <Input
            id="broker-number"
            type="text"
            placeholder="Vermittlernummer eingeben"
            value={brokerNumber}
            onChange={(e) => setBrokerNumber(e.target.value)}
          />
        </div>
      </main>
      
      <div className="sticky bottom-16 z-30 px-4 pb-4">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-[#B1904B] hover:bg-[#9a7b3f] text-white py-6 rounded-lg text-lg"
        >
          Weiter
        </Button>
      </div>
      
      <footer className="fixed bottom-0 w-full bg-[#003595] text-white text-xs py-2 text-center z-30">
        <div className="flex justify-center space-x-4">
          <Link to="/impressum" className="hover:text-white/100 text-white/80">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-white/100 text-white/80">Datenschutz</Link>
          <Link to="/agb" className="hover:text-white/100 text-white/80">AGB</Link>
        </div>
      </footer>

      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="border-b p-4 relative">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-[#B1904B]" />
              <span className="text-[#003595] font-medium">FI Investments</span>
            </div>
          </div>
          
          <div className="p-6">
            <DialogTitle className="text-xl mb-3">Bitte laden Sie die folgenden Dokumente herunter</DialogTitle>
            <DialogDescription className="mb-6">
              Für vollständige Transparenz stellen wir Ihnen diese Dokumente zur Verfügung. 
              Mit dem Herunterladen bestätigen Sie, dass Sie den Inhalt gelesen und verstanden haben.
            </DialogDescription>
            
            <div className="space-y-4 mb-6">
              <Card className="p-4 bg-neutral-50">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-[#B1904B]" />
                  <span className="font-medium">Erforderliche Dokumente</span>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700 ml-7 list-disc">
                  <li>Anleihebedingungen</li>
                  <li>Basisinformationsblatt</li>
                </ul>
              </Card>
            </div>
            
            <p className="text-sm text-neutral-500 mb-6">
              Mit Klick auf 'Weiter' bestätigen Sie, dass Sie alle erforderlichen Dokumente 
              heruntergeladen und geprüft haben.
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-[#B1904B] text-[#B1904B] flex items-center justify-center"
                onClick={handleDownloadAllDocuments}
              >
                <Download className="h-4 w-4 mr-2" />
                Alle Dokumente herunterladen
              </Button>
              <Button 
                className="w-full bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
                onClick={startKnowledgeExperienceFlow}
                disabled={!documentsDownloaded}
              >
                Weiter
              </Button>
            </div>
          </div>
          
          <div className="p-3 border-t bg-[#003595] text-white text-xs">
            <div className="flex justify-center space-x-4">
              <Link to="/impressum" className="hover:underline">Rechtliche Hinweise</Link>
              <Link to="/datenschutz" className="hover:underline">Datenschutz</Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <KnowledgeExperiencePopup
        open={showKnowledgeDialog}
        onOpenChange={setShowKnowledgeDialog}
        mode={currentKnowledgeMode}
        category={currentCategory}
        onComplete={handleKnowledgeComplete}
        onBack={currentKnowledgeMode !== "investmentDetails" ? handleKnowledgeBack : undefined}
      />

      <Dialog open={showPepDialog} onOpenChange={setShowPepDialog}>
        <DialogContent className="sm:max-w-md p-6">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-8 bg-white border border-neutral-200 rounded flex items-center justify-center">
              <span className="text-[#003595] font-medium">FI Investments</span>
            </div>
          </div>
          
          <DialogTitle className="text-xl mb-3">PEP Status</DialogTitle>
          
          <DialogDescription className="mb-6">
            Gemäß dem Geldwäschegesetz müssen wir Sie fragen, ob Sie oder ein naher Verwandter eine politisch exponierte Person (PEP) sind.
          </DialogDescription>
          
          <div className="mb-6 p-3 bg-neutral-100 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-neutral-600 mt-0.5 shrink-0" />
            <p className="text-sm text-neutral-600">
              Eine politisch exponierte Person ist eine Person, die ein hochrangiges öffentliches Amt ausübt oder innerhalb des letzten Jahres ausgeübt hat.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="font-medium">Sind Sie oder ein naher Verwandter eine politisch exponierte Person?</p>
            
            <RadioGroup value={isPep === true ? "yes" : isPep === false ? "no" : ""} onValueChange={(value) => setIsPep(value === "yes")}>
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="yes" id="pep-yes" className="text-[#B1904B]" />
                <Label htmlFor="pep-yes">Ja</Label>
              </div>
              
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="no" id="pep-no" className="text-[#B1904B]" />
                <Label htmlFor="pep-no">Nein</Label>
              </div>
            </RadioGroup>
          </div>
          
          {isPep && (
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="pep-relationship">Verwandtschaftsbeziehung</Label>
                <Input
                  id="pep-relationship"
                  placeholder="z.B. Selbst, Ehepartner, Kind"
                  value={pepRelationship}
                  onChange={(e) => setPepRelationship(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pep-function">Politische Funktion</Label>
                <Input
                  id="pep-function"
                  placeholder="z.B. Bürgermeister, Parlamentsmitglied"
                  value={pepFunction}
                  onChange={(e) => setPepFunction(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <Button 
            onClick={handlePepComplete}
            className="w-full bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
          >
            Weiter
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestmentAmount;
