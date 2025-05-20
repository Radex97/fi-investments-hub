
import { useEffect, useState } from "react";
import { Wallet, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the product configuration type
interface ProductConfig {
  id: string;
  product_id: string;
  fixed_interest_rate: number;
  profit_share_rate: number;
  payment_frequency: 'quarterly' | 'annual';
  payment_dates: string[];
  product_name?: string;
}

export const DashboardStats = ({ 
  totalAmount, 
  investments,
  growth = 2.5,
  lastUpdated = "10:30"
}: { 
  totalAmount: number;
  investments: any[];
  growth?: number;
  lastUpdated?: string;
}) => {
  const { t } = useLanguage();
  const [calculatedYield, setCalculatedYield] = useState<number>(0);
  const { toast } = useToast();
  
  useEffect(() => {
    const calculateYield = async () => {
      try {
        // Get products and their configurations
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');
          
        if (productsError) throw productsError;
        
        // Calculate total yield across all investments
        let totalYield = 0;
        
        for (const investment of investments) {
          const product = products?.find(p => p.id === investment.product_id);
          
          if (product) {
            // Use fixed interest rate + profit share from product
            const fixedInterestRate = parseFloat(product.fixed_interest_rate.toString()) || 0;
            const profitShareRate = parseFloat(product.calculated_profit_share.toString()) || 0;
            const totalRate = fixedInterestRate + profitShareRate;
            
            // Calculate yield for this investment
            const investmentYield = (investment.amount * totalRate) / 100;
            totalYield += investmentYield;
          }
        }
        
        setCalculatedYield(totalYield);
      } catch (error: any) {
        console.error("Error calculating yield:", error);
      }
    };
    
    if (investments && investments.length > 0) {
      calculateYield();
    }
  }, [investments]);

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-sm text-neutral-600 mb-2">{t("totalAssets")}</p>
          <h2 className="text-3xl font-bold mb-4">
            €{totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">
              +{growth.toFixed(2)}% <span className="text-green-500">↑</span>
            </span>
            <span className="text-neutral-600">{t("lastUpdate")}: {lastUpdated}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <Package className="h-8 w-8 text-fi-gold mb-2" />
            <span className="text-sm text-neutral-600 text-center">{t("yield")}</span>
            <span className="text-lg font-medium">
              {calculatedYield.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Wallet className="h-8 w-8 text-fi-gold mb-2" />
            <span className="text-sm text-neutral-600 text-center">{t("investedProducts")}</span>
            <span className="text-lg font-medium">{investments.length}</span>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
