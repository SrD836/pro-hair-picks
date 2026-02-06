import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseProduct {
  id: string;
  name: string;
  brand: string | null;
  classification: string | null;
  position: number | null;
  current_price: number | null;
  original_price: number | null;
  discount_percentage: number | null;
  features: string[] | null;
  image_url: string | null;
  amazon_asin: string | null;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  description: string | null;
  image_url: string | null;
}

export function useCategory(gender: string, slug: string) {
  return useQuery({
    queryKey: ["category", gender, slug],
    queryFn: async () => {
      const genderMap: Record<string, string> = {
        hombre: "hombre",
        mujer: "mujer",
      };
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("gender", genderMap[gender] || gender)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as SupabaseCategory | null;
    },
    enabled: !!gender && !!slug,
  });
}

export function useCategoryProducts(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as SupabaseProduct[]) || [];
    },
    enabled: !!categoryId,
  });
}

export function useCategories(gender?: string) {
  return useQuery({
    queryKey: ["categories", gender],
    queryFn: async () => {
      let query = supabase.from("categories").select("*").order("name");
      if (gender) query = query.eq("gender", gender);
      const { data, error } = await query;
      if (error) throw error;
      return (data as SupabaseCategory[]) || [];
    },
  });
}
