
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { InvestmentOverview } from "@/components/dashboard/InvestmentOverview";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchInvestments();
      fetchLastUpdated();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error) {
      toast({
        title: "Fehler beim Laden des Profils",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProfile(data);
  };

  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Fehler beim Laden der Investitionen",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setInvestments(data);
    const total = data.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    setTotalAmount(total);
    
    // Calculate growth after fetching investments
    calculateAverageGrowth(data);
  };

  const fetchLastUpdated = async () => {
    try {
      // Get the latest ETF performance date
      const { data: etfData, error } = await supabase
        .rpc('get_latest_etf_performance');

      if (error) {
        console.error("Error fetching ETF data:", error);
        return;
      }

      if (etfData && Array.isArray(etfData) && etfData.length > 0) {
        const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(time);
      }
    } catch (error) {
      console.error("Error fetching last updated time:", error);
    }
  };

  const calculateAverageGrowth = async (investmentsData = investments) => {
    if (!investmentsData || investmentsData.length === 0) {
      setGrowthPercentage(0);
      return;
    }

    try {
      // Get products data with fixed and variable interest rates
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      // Calculate weighted average growth based on investment amounts
      let totalWeight = 0;
      let weightedGrowthSum = 0;

      for (const investment of investmentsData) {
        const product = products?.find(p => p.id === investment.product_id);
        
        if (product) {
          // Calculate total return using fixed_interest_rate and calculated_profit_share
          const fixedRate = parseFloat(product.fixed_interest_rate.toString()) || 0;
          const profitShare = parseFloat(product.calculated_profit_share.toString()) || 0;
          const totalReturn = fixedRate + profitShare;
          
          // Use investment amount as weight
          const weight = investment.amount;
          totalWeight += weight;
          weightedGrowthSum += weight * totalReturn;
        }
      }

      // Calculate weighted average
      const averageGrowth = totalWeight > 0 ? weightedGrowthSum / totalWeight : 0;
      setGrowthPercentage(averageGrowth);
    } catch (error) {
      console.error("Error calculating average growth:", error);
      // Default to a reasonable growth value if calculation fails
      setGrowthPercentage(2.5);
    }
  };

  if (!profile) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <TopBar />

      <main className="flex-grow pt-20 px-4 pb-8">
        <section className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {t("welcome")}, {profile.first_name || 'Investor'}
          </h1>
          <p className="text-neutral-600">{t("portfolioOverview")}</p>
        </section>

        <DashboardStats 
          totalAmount={totalAmount}
          investments={investments}
          growth={growthPercentage}
          lastUpdated={lastUpdated}
        />

        <div className="mb-6">
          <InvestmentOverview />
        </div>

        <DashboardNavigation />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
