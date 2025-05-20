
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      toast({
        title: "Eingabefehler",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }
    
    // Show success message
    setIsSubmitted(true);
    toast({
      title: "E-Mail gesendet",
      description: "Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts zugesendet.",
    });
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-fi-blue px-4 py-3 flex items-center justify-between">
        <Link to="/login" className="text-fi-gold">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 flex justify-center">
          <img 
            src="/lovable-uploads/36244e64-d6bc-459e-a671-c91f3ede1524.png" 
            alt="FI Investments" 
            className="h-8 w-auto" 
          />
        </div>
        <div className="w-6"></div>
      </header>
      
      <main className="flex-1 px-4 py-8">
        {isSubmitted && (
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 mb-8">
            <p className="text-neutral-700 text-center">
              Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts.
            </p>
          </div>
        )}
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm text-neutral-700">
                  E-Mail-Adresse
                </label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  placeholder="ihre@email.de"
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-fi-gold text-white py-3 rounded-lg hover:bg-fi-gold/90"
                >
                  Passwort zurücksetzen
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full border border-fi-gold text-fi-gold py-3 rounded-lg hover:bg-neutral-50"
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-fi-blue text-white px-4 py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center space-x-4">
            <Link to="/impressum" className="text-sm text-white/90 hover:text-white cursor-pointer">
              Impressum
            </Link>
            <Link to="/datenschutz" className="text-sm text-white/90 hover:text-white cursor-pointer">
              Datenschutz
            </Link>
            <Link to="/hilfe" className="text-sm text-white/90 hover:text-white cursor-pointer">
              Hilfe & Support
            </Link>
          </div>
          <div className="text-center text-xs opacity-75">
            © 2025 FI Investments. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PasswordReset;
