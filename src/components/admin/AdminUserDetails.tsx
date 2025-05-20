
import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Phone, Calendar, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminUserDetailsProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdminUserDetails = ({ userId, isOpen, onClose }: AdminUserDetailsProps) => {
  // Fetch detailed user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch investments
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId);
      
      if (investmentsError) throw investmentsError;
      
      return {
        profile,
        investments: investments || []
      };
    },
    enabled: isOpen && !!userId
  });

  if (isLoading || !userData) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Benutzerdetails werden geladen...</DrawerTitle>
            <DrawerDescription>Bitte warten Sie einen Moment</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Schließen</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  const { profile, investments } = userData;
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Kein Name angegeben';
  const totalInvested = investments.reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Keine Angabe';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <DrawerTitle className="text-xl font-bold">{fullName}</DrawerTitle>
            <Badge 
              variant={
                profile.kyc_status === "Aktiv" ? "success" : 
                profile.kyc_status === "Inaktiv" ? "destructive" : "secondary"
              } 
              className={
                profile.kyc_status === "Aktiv" ? "bg-green-500" : 
                profile.kyc_status === "Inaktiv" ? "bg-red-500" : "bg-yellow-500"
              }
            >
              {profile.kyc_status || "Pending"}
            </Badge>
          </div>
          <DrawerDescription className="flex items-center mt-2">
            <Mail className="h-4 w-4 mr-2" />
            {profile.email || "Keine E-Mail-Adresse angegeben"}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          {/* Personal Information */}
          <section className="space-y-2">
            <h3 className="font-medium text-lg">Persönliche Informationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Vorname</p>
                <p>{profile.first_name || "Nicht angegeben"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nachname</p>
                <p>{profile.last_name || "Nicht angegeben"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rolle</p>
                <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                  {profile.role === "admin" ? "Administrator" : "Benutzer"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registriert am</p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>
          </section>
          
          {/* Investment Summary */}
          <section className="space-y-2">
            <h3 className="font-medium text-lg">Investment Übersicht</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">Gesamtinvestition:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  }).format(totalInvested)}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Investierte Produkte ({investments.length})</p>
                {investments.length > 0 ? (
                  <div className="space-y-2">
                    {investments.map((investment, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center border-b border-gray-200 pb-2"
                      >
                        <span>{investment.product_title || "Unbenanntes Produkt"}</span>
                        <span>
                          {new Intl.NumberFormat('de-DE', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(parseFloat(String(investment.amount)) || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-400">Keine Investments vorhanden</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Contact Information */}
          {(profile.street || profile.city || profile.country) && (
            <section className="space-y-2">
              <h3 className="font-medium text-lg">Adresse</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {profile.street && <p>{profile.street}</p>}
                {profile.city && profile.postal_code && (
                  <p>{profile.postal_code} {profile.city}</p>
                )}
                {profile.country && <p>{profile.country}</p>}
              </div>
            </section>
          )}
          
          {/* Bank Information (if available) */}
          {profile.iban && (
            <section className="space-y-2">
              <h3 className="font-medium text-lg">Bankdaten</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <p className="font-medium">IBAN</p>
                </div>
                <p className="font-mono">{profile.iban}</p>
              </div>
            </section>
          )}
        </div>
        
        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Schließen
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AdminUserDetails;
