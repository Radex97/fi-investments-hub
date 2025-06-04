
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Investment {
  id: string;
  product_title: string;
  shares: number;
  amount: number;
  performance_percentage: number;
  created_at: string;
  status: string;
  document_url?: string | null;
  payment_received?: boolean;
  fixed_interest_rate: number;
  profit_share_rate: number;
  product_id: string;
  user_id: string; // Added to match PendingSubscription type
  userName?: string; // Added to match PendingSubscription type
  product_interest_rate?: number; // Added to match AdminPendingSubscriptions usage
  product_last_interest_date?: string; // Added to match AdminPendingSubscriptions usage
}

export function useInvestments(options?: { forAdmin?: boolean }) {
  return useQuery({
    queryKey: ["investments", options?.forAdmin ? "admin" : "user"],
    queryFn: async () => {
      // If fetching for admin, get all pending investments
      // Otherwise, only fetch the current user's investments
      const query = supabase
        .from("investments")
        .select("*");
      
      if (options?.forAdmin) {
        // For admin, get all pending subscriptions across all users
        query.eq("status", "pending");
      } else {
        // For regular users, filter by their user ID and include active investments
        query.in("status", ['pending', 'active', 'confirmed'])
          .order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // After fetching investments, update the local cache of KYC status
      if (!options?.forAdmin) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          // Query for current profile data to get updated KYC status
          await supabase
            .from("profiles")
            .select("kyc_status")
            .eq("id", userData.user.id)
            .single();
        }
      }

      // Get products to fetch interest rate and profit share details
      const { data: products } = await supabase
        .from("products")
        .select("*");

      // For admin view, get user profiles to display user names
      let userProfiles = {};
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

      // Get latest ETF performance data
      const { data: etfData } = await supabase
        .rpc('get_latest_etf_performance');

      // Enhance investment data with interest details from products table
      const enhancedData = data?.map(investment => {
        const product = products?.find(p => p.id === investment.product_id);
        
        // Base enhanced investment with properties needed by AdminPendingSubscriptions
        const enhancedInvestment = {
          ...investment,
          fixed_interest_rate: product?.fixed_interest_rate !== null ? parseFloat(product?.fixed_interest_rate.toString()) : 0,
          profit_share_rate: product?.calculated_profit_share !== null ? parseFloat(product?.calculated_profit_share.toString()) : 0,
          // Add these for compatibility with existing code
          product_interest_rate: product?.interest_rate !== null ? parseFloat(product?.interest_rate.toString()) : 0.05,
          product_last_interest_date: product?.last_interest_date || investment.created_at,
          // Add userName if we're in admin mode
          userName: options?.forAdmin ? userProfiles[investment.user_id] : undefined,
          // Sum both for total performance
          performance_percentage: 
            (product?.fixed_interest_rate !== null ? parseFloat(product?.fixed_interest_rate.toString()) : 0) + 
            (product?.calculated_profit_share !== null ? parseFloat(product?.calculated_profit_share.toString()) : 0)
        };
        
        return enhancedInvestment;
      });

      return enhancedData as Investment[];
    },
  });
}
