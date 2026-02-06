import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AffiliateLink {
  id: string;
  product_id: string | null;
  platform: string | null;
  affiliate_url: string;
  is_primary: boolean | null;
}

export function useAffiliateLinks(productIds: string[]) {
  return useQuery({
    queryKey: ["affiliate_links", productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .in("product_id", productIds);
      if (error) throw error;
      return (data as AffiliateLink[]) || [];
    },
    enabled: productIds.length > 0,
  });
}
