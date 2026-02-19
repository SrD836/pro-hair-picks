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
  features: { spec1?: string; spec2?: string; spec3?: string };
}

const PRICE_RANGE_ORDER: Record<string, number> = {
  ELITE: 0,
  VALUE: 1,
  STARTER: 2,
};

export function useProductsByCategory(categoria: string) {
  return useQuery<Product[]>({
    queryKey: ["products-by-category", categoria],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, category, price_range, name, brand, amazon_asin, amazon_url, current_price, amazon_reviews, amazon_rating, features")
        .eq("category", categoria);

      if (error) throw error;

      return (data ?? [])
        .sort(
          (a, b) =>
            (PRICE_RANGE_ORDER[a.price_range ?? ""] ?? 99) -
            (PRICE_RANGE_ORDER[b.price_range ?? ""] ?? 99)
        ) as Product[];
    },
    enabled: !!categoria,
  });
}
