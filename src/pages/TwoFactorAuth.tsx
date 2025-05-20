import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, QrCode, Download, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { QRCode } from "@/components/ui/qrcode";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { useState as useHookState } from "react";

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const { enroll2FA, verify2FA, unenroll2FA, isTOTPEnabled } = useAuth();
  
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Check if 2FA is already enabled on component mount
  useEffect(() => {
    const checkTOTPStatus = async () => {
      setLoading(true);
      const isEnabled = await isTOTPEnabled();
      setEnabled(isEnabled);
      setLoading(false);
    };
    
    checkTOTPStatus();
  }, [isTOTPEnabled]);

  const handleToggle = async () => {
    if (loading) return;
    
    if (enabled) {
      // Disable 2FA
      setLoading(true);
      const success = await unenroll2FA();
      if (success) {
        setEnabled(false);
        toast("2FA wurde deaktiviert", {
          description: "Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert.",
          position: "bottom-center"
        });
      }
      setLoading(false);
    } else {
      // Start 2FA setup process
      startSetup();
    }
  };

  const startSetup = async () => {
    setLoading(true);
    const result = await enroll2FA();
    setLoading(false);
    
    if (result) {
      setQrCodeData(result.qrCode);
      setSecret(result.secret);
      setSetupDialogOpen(true);
    }
  };

  const handleContinue = () => {
    setSetupDialogOpen(false);
    setVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast("Ungültiger Code", {
        description: "Bitte geben Sie einen gültigen 6-stelligen Code ein.",
        position: "bottom-center"
      });
      return;
    }
    
    setLoading(true);
    const success = await verify2FA(verificationCode);
    setLoading(false);
    
    if (success) {
      setEnabled(true);
      setVerifyDialogOpen(false);
      toast("2FA wurde aktiviert", {
        description: "Die Zwei-Faktor-Authentifizierung ist jetzt aktiviert.",
        position: "bottom-center"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#003595] px-4 py-3 flex items-center justify-between">
        <button 
          className="text-white" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex justify-center">
          <img src="/lovable-uploads/fi-logo-white.png" alt="FI Investments" className="h-8" />
        </div>
        <div className="w-5"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl mb-4 font-semibold">Zwei-Faktor-Authentifizierung</h1>
          
          <p className="text-neutral-600 mb-6">
            Aktivieren Sie eine zusätzliche Sicherheitsebene für Ihr Konto, indem Sie einen einzigartigen 
            Code aus einer Authentifizierungs-App anfordern. Wir empfehlen Google Authenticator oder eine 
            kompatible 2FA-App.
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="text-fi-gold" size={20} />
                  <span>2FA Aktivieren</span>
                </div>
                <Switch 
                  checked={enabled} 
                  onCheckedChange={handleToggle}
                  disabled={loading}
                  className="data-[state=checked]:bg-fi-gold"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Status: {loading ? "Wird geladen..." : enabled ? "Aktiviert" : "Deaktiviert"}
              </p>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <Button 
                className="flex-1 bg-fi-gold hover:bg-fi-gold/90" 
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2", "_blank")}
              >
                <Download size={16} className="mr-2" />
                Google Play
              </Button>
              <Button 
                className="flex-1 bg-fi-gold hover:bg-fi-gold/90"
                onClick={() => window.open("https://apps.apple.com/us/app/google-authenticator/id388497605", "_blank")}
              >
                <Download size={16} className="mr-2" />
                App Store
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <QrCode size={18} className="text-fi-gold" />
                  <span className="font-medium">Verbindung einrichten</span>
                </div>
                <p className="text-sm text-neutral-600">
                  Laden Sie eine Authentifizierungs-App herunter und scannen Sie den QR-Code oder 
                  geben Sie den bereitgestellten Schlüssel ein, um Ihr Konto zu verknüpfen.
                </p>
                {!enabled && (
                  <Button 
                    className="w-full mt-4 bg-fi-gold hover:bg-fi-gold/90"
                    onClick={startSetup}
                    disabled={loading}
                  >
                    2FA Einrichtung starten
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Lock size={18} className="mr-2 text-fi-gold" />
                Zusätzliche Informationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-neutral-600">
                Die Zwei-Faktor-Authentifizierung (2FA) ist eine zusätzliche Sicherheitsmaßnahme zum 
                Schutz Ihres Kontos. Bei jeder Anmeldung müssen Sie einen einzigartigen Code eingeben, 
                der von Ihrer 2FA-App generiert wird.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* QR Code Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>2FA Einrichten</DialogTitle>
            <DialogDescription>
              Scannen Sie diesen QR-Code mit Ihrer Authentifizierungs-App oder geben Sie den Code manuell ein.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeData && <QRCode value={qrCodeData} size={200} />}
            
            {secret && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Oder geben Sie diesen Code manuell ein:</p>
                <p className="font-mono bg-muted p-2 rounded text-sm select-all">{secret}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleContinue} 
              className="w-full bg-fi-gold hover:bg-fi-gold/90"
            >
              Weiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verify Code Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Code bestätigen</DialogTitle>
            <DialogDescription>
              Geben Sie den 6-stelligen Code aus Ihrer Authentifizierungs-App ein.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <InputOTP 
              maxLength={6} 
              value={verificationCode} 
              onChange={setVerificationCode}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleVerify}
              className="w-full bg-fi-gold hover:bg-fi-gold/90"
              disabled={loading || verificationCode.length !== 6}
            >
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-fi-blue text-white py-4 px-4">
        <div className="flex justify-center space-x-4 text-sm">
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/datenschutz")}>Datenschutz</span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/impressum")}>Impressum</span>
          <span className="hover:underline cursor-pointer">Cookies</span>
        </div>
      </footer>
    </div>
  );
};

export default TwoFactorAuth;
