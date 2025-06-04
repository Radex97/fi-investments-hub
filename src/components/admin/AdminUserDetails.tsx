
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface AdminUserDetailsProps {
  userId: string;
  onClose: () => void;
}

const AdminUserDetails = ({ userId, onClose }: AdminUserDetailsProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId as any)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Fetch user investments
  const { data: userInvestments, isLoading: investmentsLoading } = useQuery({
    queryKey: ["user-investments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId as any)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (profileLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Check if userProfile exists and has required properties
  if (!userProfile || typeof userProfile !== 'object') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Fehler</DialogTitle>
            <DialogDescription>
              Benutzerdaten konnten nicht geladen werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const profile = userProfile as any;
  const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unbekannter Benutzer';
  const totalInvestment = userInvestments?.reduce((sum, investment: any) => {
    if (investment && typeof investment === 'object' && 'amount' in investment) {
      return sum + (parseFloat(investment.amount.toString()) || 0);
    }
    return sum;
  }, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Benutzerdetails
          </DialogTitle>
          <DialogDescription>
            Vollständige Informationen über {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">KYC Status</p>
                  <Badge variant={profile.kyc_status === "approved" ? "default" : "secondary"}>
                    {profile.kyc_status === "approved" ? "Genehmigt" : "Ausstehend"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kontotyp</p>
                  <p>{profile.is_company ? "Unternehmen" : "Privat"}</p>
                </div>
              </div>
              
              {profile.is_company ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Firmenname</p>
                    <p>{profile.company_name || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rechtsform</p>
                    <p>{profile.legal_form || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Handelsregisternummer</p>
                    <p>{profile.trade_register_number || 'Nicht angegeben'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Geburtsdatum</p>
                    <p>{profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Geburtsort</p>
                    <p>{profile.birth_place || 'Nicht angegeben'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Kontaktdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <p>{profile.email || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p>{profile.phone || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p>
                  {[profile.street, profile.postal_code, profile.city, profile.country]
                    .filter(Boolean)
                    .join(', ') || 'Nicht angegeben'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationalität</p>
                <p>{profile.nationality || 'Nicht angegeben'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bankdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Kontoinhaber</p>
                <p>{profile.account_holder || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p>{profile.iban || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BIC</p>
                <p>{profile.bic || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank</p>
                <p>{profile.bank_name || 'Nicht angegeben'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Investment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Investitionen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Gesamtinvestition</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
                </div>
                
                {userInvestments && userInvestments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Einzelne Investitionen:</p>
                    {userInvestments.map((investment: any) => {
                      // Check if investment has required properties
                      if (!investment || typeof investment !== 'object' || !('id' in investment)) {
                        return null;
                      }

                      return (
                        <div key={investment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{investment.product_title}</p>
                            <p className="text-sm text-gray-500">{formatDate(investment.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(parseFloat(investment.amount.toString()) || 0)}</p>
                            <Badge variant={investment.status === "approved" ? "default" : "secondary"}>
                              {investment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Keine Investitionen vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserDetails;
