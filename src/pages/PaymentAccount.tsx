
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Define interface for our navigation state to fix TypeScript errors
interface NavigationState {
  productTitle: string;
  paymentDetails: {
    iban: string;
    depositNumber: string;
    bankCode: string;
    bank: string;
    bic: string;
    country: string;
    accountHolder: string;
    accountHolderTitle: string;
  };
  authorizedPerson?: any; // Add the authorizedPerson property as optional
}

const PaymentAccount = () => {
  const [iban, setIban] = useState<string>("");
  const [depositNumber, setDepositNumber] = useState<string>("");
  const [bankCode, setBankCode] = useState<string>("");
  const [bank, setBank] = useState<string>("");
  const [bic, setBic] = useState<string>("");
  const [country, setCountry] = useState<string>("Deutschland");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [accountHolderTitle, setAccountHolderTitle] = useState<string>("Herr");
  
  const navigate = useNavigate();
  const location = useLocation();
  const [productTitle, setProductTitle] = useState("FI Investments Produkt");
  const [authorizedPerson, setAuthorizedPerson] = useState(null);

  useEffect(() => {
    if (location.state) {
      if (location.state.productTitle) {
        setProductTitle(location.state.productTitle);
      }
      
      // Save authorizedPerson data if available
      if (location.state.authorizedPerson) {
        setAuthorizedPerson(location.state.authorizedPerson);
      }
    } else {
      const storedTitle = localStorage.getItem("currentProductTitle");
      if (storedTitle) {
        setProductTitle(storedTitle);
      }
    }
  }, [location]);

  const handleSubmit = () => {
    if (!iban) {
      toast.error("Bitte geben Sie Ihre IBAN ein");
      return;
    }

    localStorage.setItem("paymentIban", iban);
    localStorage.setItem("depositNumber", depositNumber);
    localStorage.setItem("bankCode", bankCode);
    localStorage.setItem("bank", bank);
    localStorage.setItem("bic", bic);
    localStorage.setItem("country", country);
    localStorage.setItem("accountHolder", accountHolder);
    localStorage.setItem("accountHolderTitle", accountHolderTitle);
    
    // Prepare navigation state, including both payment details and authorizedPerson data
    const navigationState: NavigationState = { 
      productTitle: productTitle,
      paymentDetails: {
        iban,
        depositNumber,
        bankCode,
        bank,
        bic,
        country,
        accountHolder,
        accountHolderTitle
      }
    };
    
    // Add authorizedPerson data to the navigation state if available
    if (authorizedPerson) {
      navigationState.authorizedPerson = authorizedPerson;
    } else if (location.state && location.state.authorizedPerson) {
      // Fallback to location.state.authorizedPerson if available
      navigationState.authorizedPerson = location.state.authorizedPerson;
    }
    
    navigate("/zeichnungsschein", { state: navigationState });
  };

  const handleBack = () => {
    navigate("/steuerangaben");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-[#003595] px-4 py-3 flex items-center justify-between fixed w-full top-0 z-50">
        <button onClick={handleBack} className="text-[#B1904B]">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/1ddfa9b7-c839-4ec6-a099-e3819bde1098.png" 
            alt="FI Investments"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="w-6"></div>
      </header>
      
      <main className="flex-1 pt-20 px-4 pb-4">
        <div className="mb-6">
          <h1 className="text-xl text-[#222733] mb-2">Investment in {productTitle}</h1>
          <p className="text-neutral-600 text-sm">
            Bitte geben Sie Ihr Auszahlungskonto an. Nach Zeichnung und Zahlung werden Ihre Anteile in das angegebene Depot übertragen.
          </p>
        </div>
        
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Auszahlungskonto</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderTitle">Anrede</Label>
                <Select value={accountHolderTitle} onValueChange={setAccountHolderTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Anrede auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Herr">Herr</SelectItem>
                    <SelectItem value="Frau">Frau</SelectItem>
                    <SelectItem value="Herr und Frau">Herr und Frau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Name Kontoinhaber</Label>
                <Input
                  id="accountHolder"
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                type="text"
                placeholder="DE00 0000 0000 0000 0000 00"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-medium">Depot</h2>
            <span className="text-sm text-neutral-500 italic">Optional</span>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            Geben Sie Ihre Depot-Details ein. Die Angaben können auch zu einem späteren Zeitpunkt nachgereicht werden. Wir übertragen Ihre Anteile nach Zeichnung und Zahlung in dieses Depot.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="depositNumber">Depotnummer</Label>
              <Input
                id="depositNumber"
                type="text"
                value={depositNumber}
                onChange={(e) => setDepositNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankCode">Bankleitzahl</Label>
              <Input
                id="bankCode"
                type="text"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bic">BIC</Label>
              <Input
                id="bic"
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountHolderTitle">Anrede</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={accountHolderTitle} onValueChange={setAccountHolderTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Anrede auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Herr">Herr</SelectItem>
                    <SelectItem value="Frau">Frau</SelectItem>
                    <SelectItem value="Herr und Frau">Herr und Frau</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="accountHolder"
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <div className="bg-white p-4 border-t">
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
      
      <footer className="bg-[#003595] text-white text-xs py-2 text-center">
        <div className="flex justify-center space-x-4">
          <Link to="/impressum" className="hover:text-white/100 text-white/80">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-white/100 text-white/80">Datenschutz</Link>
          <Link to="/agb" className="hover:text-white/100 text-white/80">AGB</Link>
        </div>
      </footer>
    </div>
  );
};

export default PaymentAccount;
