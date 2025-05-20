
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./useProducts";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      // Skip the query if no ID is provided
      if (!id) {
        return null;
      }
      
      // Check if the id is a UUID or a custom slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq(isUUID ? "id" : "slug", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      return data as Product;
    },
    enabled: !!id, // Only run the query if an ID is provided
  });
}
