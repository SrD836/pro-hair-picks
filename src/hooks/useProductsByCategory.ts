import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  category: string;
  price_range: "ELITE" | "VALUE" | "STARTER";
  name: string;
  brand: string;
  amazon_asin: string;
  amazon_url: string;
  current_price: number;
  amazon_reviews: number;
  amazon_rating: number;
  features: Record<string, string>;
  image_url?: string;
  position?: number;
}

const TIER_ORDER: Record<string, number> = { ELITE: 0, VALUE: 1, STARTER: 2 };

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category);
      if (error) throw error;
      return (data as unknown as Product[]).sort(
        (a, b) => (TIER_ORDER[a.price_range] ?? 99) - (TIER_ORDER[b.price_range] ?? 99)
      );
    },
    enabled: !!category,
  });
};
