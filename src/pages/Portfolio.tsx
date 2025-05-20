
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MobileFooter from "@/components/MobileFooter";
import { useInvestments } from "@/hooks/useInvestments";
import { InvestmentCard } from "@/components/InvestmentCard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Portfolio = () => {
  const { user } = useAuth();
  const { data: investments, isLoading, error, refetch } = useInvestments();
  const { toast } = useToast();
  const [totalPerformance, setTotalPerformance] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (investments?.length > 0) {
      calculatePerformanceMetrics();
      fetchLastUpdated();
    }
  }, [investments]);

  const fetchLastUpdated = async () => {
    try {
      // Get the latest ETF performance date
      const { data: etfData, error: etfError } = await supabase.rpc('get_latest_etf_performance');
      
      if (etfError) {
        console.error("Error fetching ETF data:", etfError);
        return;
      }
      
      // Check if we have data and it's an array with at least one element
      if (etfData && Array.isArray(etfData) && etfData.length > 0) {
        const latestData = etfData[0]; // Get the first (and should be only) element
        if (latestData.date) {
          const date = new Date(latestData.date);
          const formattedDate = date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          setLastUpdated(formattedDate);
        } else {
          console.log("No date found in ETF data");
        }
      } else {
        console.log("ETF data not available or empty:", etfData);
      }
    } catch (error) {
      console.error("Error fetching last updated date:", error);
    }
  };

  const calculatePerformanceMetrics = () => {
    // Get weighted average performance
    const totalInvestment = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    
    let weightedPerformanceSum = 0;
    let totalProfit = 0;

    investments?.forEach(inv => {
      // Calculate weighted performance contribution
      const weight = inv.amount / totalInvestment;
      const performance = inv.fixed_interest_rate + inv.profit_share_rate;
      weightedPerformanceSum += weight * performance;
      
      // Calculate profit/loss in currency
      const investmentProfit = inv.amount * performance / 100;
      totalProfit += investmentProfit;
    });

    setTotalPerformance(weightedPerformanceSum);
    setProfitLoss(totalProfit);
  };

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load portfolio data"
    });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      console.log("Triggering ETF data update edge function...");
      
      // Manually trigger ETF data update edge function
      const response = await fetch(`https://vsxbmdghnqyhcyldjdoa.functions.supabase.co/update-etf-data?manual=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeGJtZGdobnF5aGN5bGRqZG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTcwNjgsImV4cCI6MjA2MDM3MzA2OH0.4191FRa6bXC_SOtkYwt2DpBKzr80GUsNy4ORMAvPlMI'}`
        },
        body: JSON.stringify({})
      });
      
      const responseData = await response.json();
      console.log("Edge function response:", responseData);
      
      if (!response.ok) {
        throw new Error(`Failed to update ETF data: ${responseData.error || 'Unknown error'}`);
      }
      
      // Refetch investments to get the latest data
      await refetch();
      await fetchLastUpdated();
      
      toast({
        title: "Daten aktualisiert",
        description: "Die ETF-Performance wurde erfolgreich aktualisiert."
      });
    } catch (error) {
      console.error("Error updating ETF data:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Aktualisieren der ETF-Daten"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalValue = investments?.reduce((sum, inv) => sum + inv.amount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="fixed w-full top-0 z-50 bg-fi-blue px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-fi-gold">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-white font-bold text-xl">Mein Portfolio</span>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow pt-20 px-4 pb-24">
        <section className="mb-6">
          <Card className="bg-white rounded-xl p-4 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-neutral-600">Gesamtwert</p>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-xs flex items-center text-neutral-500 hover:text-fi-blue transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </button>
              </div>
              <p className="text-2xl mb-4">€{totalValue.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-neutral-600">Performance</p>
                  <p className={`text-lg ${totalPerformance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totalPerformance >= 0 ? "+" : ""}{totalPerformance.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Gewinn/Verlust</p>
                  <p className={`text-lg ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profitLoss >= 0 ? "+" : "-"}€{Math.abs(profitLoss).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <div className="text-xs text-neutral-500 text-right">
                  Letztes Update: {lastUpdated}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          ) : investments?.length ? (
            investments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600">No investments found</p>
            </div>
          )}
        </section>
      </main>

      <MobileFooter />
    </div>
  );
};

export default Portfolio;
