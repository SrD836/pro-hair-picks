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
  tech_specs?: Record<string, string>;
}

const TIER_ORDER: Record<string, number> = { ELITE: 0, VALUE: 1, STARTER: 2 };

export const useProductsByCategory = (category: string) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", category],
    queryFn: async () => {
      console.log("[useProductsByCategory] Querying category:", category);

      const { data, error } = await supabase
        .from("products")
        .select("id, category, price_range, name, brand, amazon_asin, amazon_url, current_price, amazon_reviews, amazon_rating, features, image_url, position, tech_specs")
        .ilike("category", category);

      console.log("[useProductsByCategory] Result:", { data, error, count: data?.length });

      if (error) {
        console.error("[useProductsByCategory] Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("[useProductsByCategory] No products found for category:", category);
        return [];
      }

      return (data as unknown as Product[]).sort(
        (a, b) => (TIER_ORDER[a.price_range] ?? 99) - (TIER_ORDER[b.price_range] ?? 99)
      );
    },
    enabled: !!category,
  });
};
