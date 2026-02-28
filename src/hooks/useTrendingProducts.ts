import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  current_price: number;
  image_url?: string;
  amazon_url?: string;
  amazon_url_us?: string;
}

const TRENDING_CATEGORIES = ["Clippers", "Trimmers", "Secadores profesionales"];

export const useTrendingProducts = () => {
  return useQuery<TrendingProduct[], Error>({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const results: TrendingProduct[] = [];

      for (const category of TRENDING_CATEGORIES) {
        const { data } = await supabase
          .from("products")
          .select("id, name, brand, category, current_price, image_url, amazon_url, amazon_url_us")
          .ilike("category", category)
          .order("position", { ascending: true })
          .limit(1)
          .single();

        if (data) results.push(data as TrendingProduct);
      }

      return results;
    },
    staleTime: 1000 * 60 * 10,
  });
};
