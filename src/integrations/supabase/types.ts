export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          affiliate_url: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          platform: string | null
          product_id: string | null
        }
        Insert: {
          affiliate_url: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          platform?: string | null
          product_id?: string | null
        }
        Update: {
          affiliate_url?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          platform?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      price_update_logs: {
        Row: {
          error_message: string | null
          id: string
          new_price: number | null
          old_price: number | null
          product_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          new_price?: number | null
          old_price?: number | null
          product_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          new_price?: number | null
          old_price?: number | null
          product_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_update_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          amazon_asin: string | null
          amazon_price: number | null
          amazon_rating: number | null
          amazon_reviews: number | null
          amazon_title: string | null
          amazon_url: string | null
          brand: string | null
          category: string | null
          category_id: string | null
          classification: string | null
          created_at: string | null
          current_price: number | null
          discount_percentage: number | null
          features: Json | null
          id: string
          image_url: string | null
          last_checked: string | null
          last_price_update: string | null
          match_confidence: number | null
          name: string
          original_price: number | null
          position: number | null
          price_range: string | null
        }
        Insert: {
          amazon_asin?: string | null
          amazon_price?: number | null
          amazon_rating?: number | null
          amazon_reviews?: number | null
          amazon_title?: string | null
          amazon_url?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          classification?: string | null
          created_at?: string | null
          current_price?: number | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          last_checked?: string | null
          last_price_update?: string | null
          match_confidence?: number | null
          name: string
          original_price?: number | null
          position?: number | null
          price_range?: string | null
        }
        Update: {
          amazon_asin?: string | null
          amazon_price?: number | null
          amazon_rating?: number | null
          amazon_reviews?: number | null
          amazon_title?: string | null
          amazon_url?: string | null
          brand?: string | null
          category?: string | null
          category_id?: string | null
          classification?: string | null
          created_at?: string | null
          current_price?: number | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          last_checked?: string | null
          last_price_update?: string | null
          match_confidence?: number | null
          name?: string
          original_price?: number | null
          position?: number | null
          price_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answers: Json
          category: string
          created_at: string | null
          id: string
          recommended_products: string[]
          session_id: string
        }
        Insert: {
          answers: Json
          category: string
          created_at?: string | null
          id?: string
          recommended_products: string[]
          session_id: string
        }
        Update: {
          answers?: Json
          category?: string
          created_at?: string | null
          id?: string
          recommended_products?: string[]
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_products_by_quiz: {
        Args: {
          p_budget: string
          p_category: string
          p_experience: string
          p_limit?: number
          p_usage: string
        }
        Returns: {
          affiliate_link: string
          brand: string
          id: string
          image_url: string
          match_score: number
          name: string
          price: number
          rating: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
