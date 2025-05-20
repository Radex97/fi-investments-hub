import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  adminLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUp: (email: string, password: string, isCompany: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  registerUser: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  enroll2FA: () => Promise<{ qrCode: string, secret: string } | null>;
  verify2FA: (token: string) => Promise<boolean>;
  unenroll2FA: () => Promise<boolean>;
  isTOTPEnabled: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track if navigation should happen (only for actual sign in/out actions)
  const shouldNavigateRef = useRef(false);

  // Check admin role
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    const checkAdminRole = async () => {
      try {
        console.log("AuthContext: Checking admin role for user ID:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('AuthContext: Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }

        console.log('AuthContext: Role data:', data);
        const hasAdminRole = data?.role === 'admin';
        console.log('AuthContext: Is admin:', hasAdminRole);
        setIsAdmin(hasAdminRole);
      } catch (err) {
        console.error('AuthContext: Exception checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        // Only navigate on explicit sign in/out events, not on token refresh
        if (event === 'SIGNED_IN' && shouldNavigateRef.current) {
          shouldNavigateRef.current = false;
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    // Check for existing session on initial load without redirecting
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      // Set flag to navigate after sign-in
      shouldNavigateRef.current = true;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich angemeldet",
        description: "Sie werden zum Dashboard weitergeleitet...",
      });
    } catch (error: any) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Set flag to navigate after sign-in
      shouldNavigateRef.current = true;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Google Anmeldung",
        description: "Bitte folgen Sie den Anweisungen im neuen Fenster...",
      });
    } catch (error: any) {
      toast({
        title: "Google Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      // Set flag to navigate after sign-in
      shouldNavigateRef.current = true;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Apple Anmeldung",
        description: "Bitte folgen Sie den Anweisungen im neuen Fenster...",
      });
    } catch (error: any) {
      toast({
        title: "Apple Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, isCompany: boolean) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_company: isCompany,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte bestätigen Sie Ihre E-Mail-Adresse.",
      });
    } catch (error: any) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerUser = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Erfolgreich abgemeldet",
        description: "Auf Wiedersehen!",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Abmelden",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 2FA Methods
  const enroll2FA = async (): Promise<{ qrCode: string, secret: string } | null> => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      
      if (error) {
        toast({
          title: "Fehler bei 2FA-Aktivierung",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data.totp) {
        toast({
          title: "Fehler bei 2FA-Aktivierung",
          description: "Keine TOTP-Daten zurückgegeben",
          variant: "destructive",
        });
        return null;
      }
      
      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      };
    } catch (error: any) {
      toast({
        title: "2FA-Aktivierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
      return null;
    }
  };

  const verify2FA = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: 'totp',
      });
      
      if (error || !data) {
        toast({
          title: "Fehler bei 2FA-Verifizierung",
          description: error?.message || "Fehler bei der Anforderung der Challenge",
          variant: "destructive",
        });
        return false;
      }
      
      const challengeId = data.id;
      
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId,
        code: token,
      });
      
      if (verifyError || !verifyData) {
        toast({
          title: "2FA-Verifizierung fehlgeschlagen",
          description: verifyError?.message || "Ungültiger Code",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "2FA erfolgreich verifiziert",
        description: "Zwei-Faktor-Authentifizierung wurde aktiviert",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "2FA-Verifizierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
      return false;
    }
  };

  const unenroll2FA = async (): Promise<boolean> => {
    try {
      // Get factors first to find the right one to unenroll
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError || !factorsData) {
        toast({
          title: "Fehler beim Abrufen der 2FA-Faktoren",
          description: factorsError?.message || "Konnte keine Faktoren abrufen",
          variant: "destructive",
        });
        return false;
      }
      
      const totpFactor = factorsData.totp.find(factor => factor.factor_type === 'totp');
      
      if (!totpFactor) {
        toast({
          title: "Keine 2FA-Faktoren gefunden",
          description: "Es sind keine TOTP-Faktoren zum Deaktivieren vorhanden",
          variant: "destructive",
        });
        return false;
      }
      
      const { data, error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });
      
      if (error) {
        toast({
          title: "2FA-Deaktivierung fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "2FA deaktiviert",
        description: "Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "2FA-Deaktivierung fehlgeschlagen",
        description: error.message || "Unbekannter Fehler",
        variant: "destructive",
      });
      return false;
    }
  };

  const isTOTPEnabled = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error checking 2FA status:', error);
        return false;
      }
      
      return data.totp.some(factor => factor.factor_type === 'totp' && factor.status === 'verified');
    } catch (error) {
      console.error('Exception checking 2FA status:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAdmin, 
      adminLoading, 
      signIn, 
      signInWithGoogle,
      signInWithApple,
      signUp, 
      signOut, 
      registerUser,
      enroll2FA,
      verify2FA,
      unenroll2FA,
      isTOTPEnabled
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
