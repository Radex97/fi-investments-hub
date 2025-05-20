
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  title: string;
  description: string;
  risk_level: string;
  return_value: string;
  minimum_investment: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  slug?: string;
  terms_document_url?: string | null;
  info_document_url?: string | null;
};

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data as Product[];
    },
  });
}
