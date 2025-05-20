
import { useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export type InvestmentCategory = "Aktien" | "Anleihen" | "Investmentfonds" | "Zertifikate" | "Alternative Anlagen";
export type InvestmentType = "Geschlossene Investmentfonds" | "Anleihen" | "Aktien" | "Tokenisierte Wertpapiere";
export type InvestmentAmount = "below-5000" | "5000-25000" | "above-25000";
export type InvestmentFrequency = "rarely" | "1-to-5" | "more-than-5";

export type PopupMode = "experience" | "knowledge" | "investmentDetails";

interface KnowledgeExperiencePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PopupMode;
  category?: InvestmentCategory;
  onComplete: (data: any) => void;
  onBack?: () => void;
}

const KnowledgeExperiencePopup = ({
  open,
  onOpenChange,
  mode,
  category,
  onComplete,
  onBack
}: KnowledgeExperiencePopupProps) => {
  const [experience, setExperience] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<InvestmentType[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState<InvestmentAmount | "">("");
  const [investmentFrequency, setInvestmentFrequency] = useState<InvestmentFrequency | "">("");
  
  const investmentTypes: InvestmentType[] = [
    "Geschlossene Investmentfonds",
    "Anleihen",
    "Aktien",
    "Tokenisierte Wertpapiere"
  ];

  const handleSubmit = () => {
    if (mode === "experience") {
      if (!experience) {
        toast.error("Bitte wählen Sie eine Option aus");
        return;
      }
      
      onComplete({ category, experience });
    } else if (mode === "knowledge") {
      if (selectedTypes.length === 0) {
        toast.error("Bitte wählen Sie mindestens eine Option aus");
        return;
      }
      
      onComplete({ investmentTypes: selectedTypes });
    } else if (mode === "investmentDetails") {
      if (!investmentAmount) {
        toast.error("Bitte wählen Sie einen Investitionsbetrag aus");
        return;
      }
      
      if (!investmentFrequency) {
        toast.error("Bitte wählen Sie eine Investitionshäufigkeit aus");
        return;
      }
      
      onComplete({ investmentAmount, investmentFrequency });
    }
  };
  
  const handleTypeToggle = (type: InvestmentType) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        {/* FI Logo displayed at the top of all popups */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/2786da11-fda0-4658-8e66-1e4510da76c9.png" 
              alt="FI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {mode === "investmentDetails" && (
          <>
            <div className="mb-6">
              <p className="text-sm text-neutral-700">
                Gemäß Wertpapierhandelsgesetz (WpHG §63 Abs 5) sind wir verpflichtet, Sie nach Ihren Kenntnissen und Erfahrungen mit Finanzinstrumenten zu befragen. Bitte beantworten Sie die folgenden Fragen sorgfältig.
              </p>
            </div>
            
            <div className="mb-6">
              <p className="mb-3 font-medium">Wie viel investieren Sie durchschnittlich?</p>
              <RadioGroup 
                value={investmentAmount} 
                onValueChange={(value) => setInvestmentAmount(value as InvestmentAmount)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="below-5000" id="below-5000" className="text-[#B1904B]" />
                  <Label htmlFor="below-5000" className="cursor-pointer">Bis zu 5.000€</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="5000-25000" id="5000-25000" className="text-[#B1904B]" />
                  <Label htmlFor="5000-25000" className="cursor-pointer">Bis zu 25.000€</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="above-25000" id="above-25000" className="text-[#B1904B]" />
                  <Label htmlFor="above-25000" className="cursor-pointer">Über 25.000€</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mb-8">
              <p className="mb-3 font-medium">Wie häufig investieren Sie in diese Anlageklassen?</p>
              <RadioGroup 
                value={investmentFrequency} 
                onValueChange={(value) => setInvestmentFrequency(value as InvestmentFrequency)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="rarely" id="rarely" className="text-[#B1904B]" />
                  <Label htmlFor="rarely" className="cursor-pointer">Selten</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="1-to-5" id="1-to-5" className="text-[#B1904B]" />
                  <Label htmlFor="1-to-5" className="cursor-pointer">1-5 mal pro Jahr</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2">
                  <RadioGroupItem value="more-than-5" id="more-than-5-frequency" className="text-[#B1904B]" />
                  <Label htmlFor="more-than-5-frequency" className="cursor-pointer">Mehr als 5 mal pro Jahr</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        )}
        
        {mode === "experience" && (
          <>
            <DialogTitle className="text-xl mb-2">
              Wissen & Erfahrung: {category}
            </DialogTitle>
            
            <DialogDescription className="mb-6">
              Wie lange haben Sie Kenntnisse und Erfahrungen in dieser Anlageklasse?
            </DialogDescription>
            
            <RadioGroup 
              value={experience} 
              onValueChange={setExperience}
              className="space-y-4 mb-8"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="less-than-3" id="less-than-3" className="text-[#B1904B]" />
                <Label htmlFor="less-than-3" className="cursor-pointer flex-1">Weniger als 3 Jahre</Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="3-to-5" id="3-to-5" className="text-[#B1904B]" />
                <Label htmlFor="3-to-5" className="cursor-pointer flex-1">3 bis 5 Jahre</Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                <RadioGroupItem value="more-than-5" id="more-than-5" className="text-[#B1904B]" />
                <Label htmlFor="more-than-5" className="cursor-pointer flex-1">Über 5 Jahre</Label>
              </div>
            </RadioGroup>
          </>
        )}
        
        {mode === "knowledge" && (
          <>
            <DialogTitle className="text-xl mb-2">
              Ihre Kenntnisse im Bereich Investieren
            </DialogTitle>
            
            <DialogDescription className="mb-6">
              Bitte geben Sie an, mit welchen Anlagearten Sie Erfahrung haben.
            </DialogDescription>
            
            <div className="space-y-4 mb-8">
              {investmentTypes.map((type) => (
                <div key={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <Checkbox 
                    id={type} 
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                    className="text-[#B1904B] data-[state=checked]:bg-[#B1904B] data-[state=checked]:border-[#B1904B]"
                  />
                  <Label htmlFor={type} className="cursor-pointer flex-1">{type}</Label>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="flex justify-between gap-4">
          <Button 
            variant="outline"
            className="flex-1 border-[#B1904B] text-[#B1904B] hover:bg-neutral-50"
            onClick={onBack}
            disabled={!onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          
          <Button 
            className="flex-1 bg-[#B1904B] hover:bg-[#9a7b3f] text-white"
            onClick={handleSubmit}
          >
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeExperiencePopup;
