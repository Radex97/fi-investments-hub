import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Investment {
  id: string;
  amount: number;
  shares: number;
  created_at: string;
  product_title: string;
  product_id: string;
  fixed_interest_rate: number;
  profit_share_rate: number;
  userName?: string;
  status?: string;
  signature_provided?: boolean;
  payment_received?: boolean;
  updated_at?: string;
  signature_date?: string;
  document_url?: string;
}

export function useInvestments(options?: { forAdmin?: boolean }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["investments", user?.id, options?.forAdmin],
    queryFn: async () => {
      // If fetching for admin, get all pending investments
      const query = options?.forAdmin
        ? supabase
            .from("investments")
            .select("*")
            .or("signature_provided.is.null,payment_received.is.null")
        : supabase
            .from("investments")
            .select("*")
            .eq("user_id", user?.id);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Get additional user information for admin view
      let userProfiles: Record<string, string> = {};
      
      if (options?.forAdmin && data && data.length > 0) {
        // Extract unique user IDs
        const userIds = [...new Set(data.map(item => item.user_id))];
        
        // Fetch profiles for these users
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
          
        if (profiles) {
          // Create a map of user IDs to names
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
            return acc;
          }, {});
        }
      }

      // Get latest ETF performance data with robust fallback strategy
      let currentETFPerformance = 14.21; // Default fallback value
      
      try {
        console.log('Fetching latest ETF performance...');
        
        // First try: RPC function
        try {
          const { data: etfRpcData, error: etfRpcError } = await supabase
            .rpc('get_latest_etf_performance');
          
          if (!etfRpcError && etfRpcData && Array.isArray(etfRpcData) && etfRpcData.length > 0) {
            currentETFPerformance = parseFloat(etfRpcData[0].average_performance.toString()) || currentETFPerformance;
            console.log('ETF performance from RPC:', currentETFPerformance);
          } else {
            throw new Error('RPC function failed or returned no data');
          }
        } catch (rpcError) {
          console.log('RPC function failed, trying direct table query...');
          
          // Second try: Direct table query
          const { data: etfDirectData, error: etfDirectError } = await supabase
            .from('etf_performance')
            .select('average_performance')
            .order('date', { ascending: false })
            .limit(1);
          
          if (!etfDirectError && etfDirectData && etfDirectData.length > 0) {
            currentETFPerformance = parseFloat(etfDirectData[0].average_performance.toString()) || currentETFPerformance;
            console.log('ETF performance from direct query:', currentETFPerformance);
          } else {
            console.log('Direct table query also failed, using default value:', currentETFPerformance);
          }
        }
      } catch (error) {
        console.error('Error fetching ETF performance, using default:', error);
      }

      // Calculate interest rates for each investment
      const investmentsWithRates = await Promise.all(
        (data || []).map(async (investment: any) => {
          try {
            // Get the related product to determine fixed and profit share rates
            const { data: productData } = await supabase
              .from('products')
              .select('fixed_interest_rate, profit_share_percentage, calculated_profit_share')
              .eq('id', investment.product_id)
              .single();

            const fixedRate = productData?.fixed_interest_rate || 0;
            const profitSharePercentage = productData?.profit_share_percentage || 0;
            
            // Calculate profit share rate: (ETF performance * profit share percentage / 100)
            const profitShareRate = (currentETFPerformance * profitSharePercentage) / 100;

            return {
              ...investment,
              fixed_interest_rate: fixedRate,
              profit_share_rate: profitShareRate,
              userName: options?.forAdmin ? userProfiles[investment.user_id] : undefined,
            };
          } catch (error) {
            console.error('Error calculating rates for investment:', investment.id, error);
            return {
              ...investment,
              fixed_interest_rate: 0,
              profit_share_rate: 0,
              userName: options?.forAdmin ? userProfiles[investment.user_id] : undefined,
            };
          }
        })
      );

      return investmentsWithRates as Investment[];
    },
    enabled: !!user || !!options?.forAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Only retry on network errors, not on authentication errors
      const isNetworkError = 
        error.message?.includes('network') ||
        error.message?.includes('connection') ||
        error.message?.includes('Load failed') ||
        (error as any).code === 'NSURLErrorDomain';
      
      return isNetworkError && failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
