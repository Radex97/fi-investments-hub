
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "./AdminActivityLog";

const AdminProductConfig = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [fixedRate, setFixedRate] = useState<string>("");
  const [profitShare, setProfitShare] = useState<string>("");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title")
        .order("title", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: productDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["product-details", selectedProduct],
    queryFn: async () => {
      if (!selectedProduct) return null;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", selectedProduct as any)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedProduct
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: {
      interest_rate?: number;
      fixed_interest_rate?: number;
      profit_share_percentage?: number;
    }) => {
      const { error } = await supabase
        .from("products")
        .update(updates as any)
        .eq("id", selectedProduct as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produktkonfiguration aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["product-details", selectedProduct] });
      logActivity("product_config_update", `Updated configuration for product ${(productDetails as any)?.title || selectedProduct}`);
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren", {
        description: error.message
      });
    }
  });

  // Update form values when product changes
  React.useEffect(() => {
    if (productDetails && typeof productDetails === 'object' && 'interest_rate' in productDetails) {
      setInterestRate((productDetails as any).interest_rate?.toString() || "");
      setFixedRate((productDetails as any).fixed_interest_rate?.toString() || "");
      setProfitShare((productDetails as any).profit_share_percentage?.toString() || "");
    }
  }, [productDetails]);

  const handleSave = () => {
    if (!selectedProduct) {
      toast.error("Bitte wählen Sie ein Produkt aus");
      return;
    }

    const updates: any = {};
    
    if (interestRate) {
      updates.interest_rate = parseFloat(interestRate);
    }
    
    if (fixedRate) {
      updates.fixed_interest_rate = parseFloat(fixedRate);
    }
    
    if (profitShare) {
      updates.profit_share_percentage = parseFloat(profitShare);
    }

    if (Object.keys(updates).length === 0) {
      toast.error("Keine Änderungen zum Speichern");
      return;
    }

    updateMutation.mutate(updates);
  };

  if (productsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produktkonfiguration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Zinssätze und Gewinnbeteiligung
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie die Zinssätze und Gewinnbeteiligungsparameter für Ihre Produkte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-select">Produkt auswählen</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie ein Produkt aus..." />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product: any) => (
                  <SelectItem key={(product as any).id} value={(product as any).id}>
                    {(product as any).title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="interest-rate">Aktueller Zinssatz (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="z.B. 0.05 für 5%"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixed-rate">Fester Zinssatz (%)</Label>
                <Input
                  id="fixed-rate"
                  type="number"
                  step="0.01"
                  value={fixedRate}
                  onChange={(e) => setFixedRate(e.target.value)}
                  placeholder="z.B. 0.02 für 2%"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit-share">Gewinnbeteiligung (%)</Label>
                <Input
                  id="profit-share"
                  type="number"
                  step="0.01"
                  value={profitShare}
                  onChange={(e) => setProfitShare(e.target.value)}
                  placeholder="z.B. 0.15 für 15%"
                />
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Speichert..." : "Konfiguration speichern"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProductConfig;
