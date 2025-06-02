import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Eingabefehler",
        description: "Bitte geben Sie Ihre E-Mail-Adresse und Passwort ein.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      
      // Setze den Loading-Status zurück, wenn der Login-Prozess abgeschlossen ist
      // Ein Timeout wird verwendet, um sicherzustellen, dass die Navigation Zeit hat zu erfolgen
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Google login error:", error);
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithApple();
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Apple login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-fi-blue p-4 flex items-center justify-between">
        <Link to="/" className="text-fi-gold">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <span className="text-white font-bold text-xl">FI Investments</span>
        <Link to="/register" className="text-white hover:text-fi-gold transition-colors">
          Registrieren
        </Link>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Anmelden</h1>
          <p className="text-gray-600">Bitte geben Sie Ihre Anmeldedaten ein</p>
        </div>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border-gray-300"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border-gray-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <Link to="/reset-password" className="text-gray-600 text-sm hover:text-fi-gold transition-colors">
                  Passwort vergessen?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-fi-blue hover:bg-opacity-90 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? "Anmeldung läuft..." : "Anmelden"}
              </Button>
              
              {isLoading && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Bitte warten Sie, während die Anmeldung verarbeitet wird...
                </div>
              )}
              
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Oder</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-gray-300 p-3 flex items-center justify-center gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 text-fi-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-gray-700">Mit Google anmelden</span>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-gray-300 p-3 flex items-center justify-center gap-2"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 text-fi-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.52 1c-2.77 0-4.18 1.6-5.2 3.02-.87-1.53-2.03-3.04-4.53-3.04C3.75 1 1 3.71 1 9.13c0 4.86 3.2 9.8 6.08 13.87h.31c1.78-2.19 2.88-4.16 2.91-4.22.33.67 2.08 4.2 2.95 4.22 3.26-4.09 6.75-9.04 6.75-13.87C20 3.71 18.6 1 16.52 1z"/>
                  </svg>
                  <span className="text-gray-700">Mit Apple anmelden</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <footer className="bg-fi-blue py-4 px-4 text-center mt-auto">
        <div className="flex justify-center space-x-6 text-sm">
          <Link to="/datenschutz" className="text-white hover:text-fi-gold transition-colors">
            Datenschutz
          </Link>
          <Link to="/agb" className="text-white hover:text-fi-gold transition-colors">
            AGB
          </Link>
          <Link to="/hilfe" className="text-white hover:text-fi-gold transition-colors">
            Hilfe
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
