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
      inci_ingredients: {
        Row: {
          id: string
          inci_name: string
          common_name: string
          cas_number: string | null
          category: string
          function_technical: string | null
          function_simple: string | null
          risks: Json | null
          benefits_technical: string | null
          profile_sensitive_scalp: Json | null
          profile_allergy: Json | null
          profile_pregnancy: Json | null
          eu_restriction: string | null
          max_concentration_eu: string | null
          sources: Json | null
          pending_review: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          inci_name: string
          common_name: string
          cas_number?: string | null
          category: string
          function_technical?: string | null
          function_simple?: string | null
          risks?: Json | null
          benefits_technical?: string | null
          profile_sensitive_scalp?: Json | null
          profile_allergy?: Json | null
          profile_pregnancy?: Json | null
          eu_restriction?: string | null
          max_concentration_eu?: string | null
          sources?: Json | null
          pending_review?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          inci_name?: string
          common_name?: string
          cas_number?: string | null
          category?: string
          function_technical?: string | null
          function_simple?: string | null
          risks?: Json | null
          benefits_technical?: string | null
          profile_sensitive_scalp?: Json | null
          profile_allergy?: Json | null
          profile_pregnancy?: Json | null
          eu_restriction?: string | null
          max_concentration_eu?: string | null
          sources?: Json | null
          pending_review?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recovery_phases: {
        Row: {
          id: string
          phase_type: string
          damage_level_min: number
          damage_level_max: number
          week_start: number
          week_end: number
          last_treatment_filter: string[] | null
          porosity_filter: string[] | null
          objective_technical: string | null
          objective_simple: string | null
          key_ingredients: string[] | null
          avoid: string[] | null
          checkpoint: string | null
          pending_review: boolean | null
          sources: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          phase_type: string
          damage_level_min: number
          damage_level_max: number
          week_start: number
          week_end: number
          last_treatment_filter?: string[] | null
          porosity_filter?: string[] | null
          objective_technical?: string | null
          objective_simple?: string | null
          key_ingredients?: string[] | null
          avoid?: string[] | null
          checkpoint?: string | null
          pending_review?: boolean | null
          sources?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          phase_type?: string
          damage_level_min?: number
          damage_level_max?: number
          week_start?: number
          week_end?: number
          last_treatment_filter?: string[] | null
          porosity_filter?: string[] | null
          objective_technical?: string | null
          objective_simple?: string | null
          key_ingredients?: string[] | null
          avoid?: string[] | null
          checkpoint?: string | null
          pending_review?: boolean | null
          sources?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      recovery_calendars: {
        Row: {
          id: string
          damage_level: number
          last_treatment: string
          hair_porosity: string
          scalp_condition: string
          total_weeks: number
          weeks: Json
          chemical_rest_days: number
          next_safe_treatment_date: string | null
          summary: Json | null
          blocked: boolean | null
          blocked_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          damage_level: number
          last_treatment: string
          hair_porosity: string
          scalp_condition: string
          total_weeks: number
          weeks: Json
          chemical_rest_days: number
          next_safe_treatment_date?: string | null
          summary?: Json | null
          blocked?: boolean | null
          blocked_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          damage_level?: number
          last_treatment?: string
          hair_porosity?: string
          scalp_condition?: string
          total_weeks?: number
          weeks?: Json
          chemical_rest_days?: number
          next_safe_treatment_date?: string | null
          summary?: Json | null
          blocked?: boolean | null
          blocked_message?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      canicie_factors: {
        Row: {
          id: string
          factor_id: string
          category: string
          title_es: string
          subtitle_es: string | null
          explanation_simple_es: string
          explanation_technical_es: string
          impact_level: string
          modifiable: boolean
          evidence_level: string
          key_mechanism: string | null
          sources: Json | null
          pending_review: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          factor_id: string
          category: string
          title_es: string
          subtitle_es?: string | null
          explanation_simple_es: string
          explanation_technical_es: string
          impact_level: string
          modifiable: boolean
          evidence_level: string
          key_mechanism?: string | null
          sources?: Json | null
          pending_review?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          factor_id?: string
          category?: string
          title_es?: string
          subtitle_es?: string | null
          explanation_simple_es?: string
          explanation_technical_es?: string
          impact_level?: string
          modifiable?: boolean
          evidence_level?: string
          key_mechanism?: string | null
          sources?: Json | null
          pending_review?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      canicie_myths: {
        Row: {
          id: string
          myth_id: string
          myth_statement_es: string
          verdict: string
          explanation_es: string
          explanation_technical_es: string | null
          reference: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          myth_id: string
          myth_statement_es: string
          verdict: string
          explanation_es: string
          explanation_technical_es?: string | null
          reference?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          myth_id?: string
          myth_statement_es?: string
          verdict?: string
          explanation_es?: string
          explanation_technical_es?: string | null
          reference?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      canicie_reports: {
        Row: {
          id: string
          session_id: string
          input_data: Json
          report_data: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          input_data: Json
          report_data: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          input_data?: Json
          report_data?: Json
          created_at?: string | null
        }
        Relationships: []
      }
      actual_expenses: {
        Row: {
          actual_amount: number | null
          actual_hours: number | null
          campaign_id: string | null
          category: string
          date: string | null
          description: string | null
          id: string
        }
        Insert: {
          actual_amount?: number | null
          actual_hours?: number | null
          campaign_id?: string | null
          category: string
          date?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          actual_amount?: number | null
          actual_hours?: number | null
          campaign_id?: string | null
          category?: string
          date?: string | null
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actual_expenses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
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
      blog_posts: {
        Row: {
          affiliate_products: string[] | null
          author: string | null
          bridge_trend_topic: string | null
          category: string | null
          category_en: string | null
          content: string | null
          content_en: string | null
          cover_image_url: string | null
          dislikes: number | null
          excerpt: string | null
          excerpt_en: string | null
          external_links: string[] | null
          has_data_viz: boolean | null
          has_expert_verdict: boolean | null
          id: string
          internal_links: string[] | null
          is_published: boolean | null
          keywords: string[] | null
          lang: string | null
          likes: number | null
          market: string | null
          meta_description: string | null
          post_type: string | null
          published_at: string | null
          read_time_minutes: number | null
          schema_markup: Json | null
          slug: string
          slug_en: string | null
          title: string
          title_en: string | null
        }
        Insert: {
          affiliate_products?: string[] | null
          author?: string | null
          bridge_trend_topic?: string | null
          category?: string | null
          category_en?: string | null
          content?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          dislikes?: number | null
          excerpt?: string | null
          excerpt_en?: string | null
          external_links?: string[] | null
          has_data_viz?: boolean | null
          has_expert_verdict?: boolean | null
          id?: string
          internal_links?: string[] | null
          is_published?: boolean | null
          keywords?: string[] | null
          lang?: string | null
          likes?: number | null
          market?: string | null
          meta_description?: string | null
          post_type?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          schema_markup?: Json | null
          slug: string
          slug_en?: string | null
          title: string
          title_en?: string | null
        }
        Update: {
          affiliate_products?: string[] | null
          author?: string | null
          bridge_trend_topic?: string | null
          category?: string | null
          category_en?: string | null
          content?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          dislikes?: number | null
          excerpt?: string | null
          excerpt_en?: string | null
          external_links?: string[] | null
          has_data_viz?: boolean | null
          has_expert_verdict?: boolean | null
          id?: string
          internal_links?: string[] | null
          is_published?: boolean | null
          keywords?: string[] | null
          lang?: string | null
          likes?: number | null
          market?: string | null
          meta_description?: string | null
          post_type?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          schema_markup?: Json | null
          slug?: string
          slug_en?: string | null
          title?: string
          title_en?: string | null
        }
        Relationships: []
      }
      blog_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reaction: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reaction?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_estimates: {
        Row: {
          campaign_id: string | null
          category: string
          estimated_amount: number | null
          estimated_hours: number | null
          id: string
        }
        Insert: {
          campaign_id?: string | null
          category: string
          estimated_amount?: number | null
          estimated_hours?: number | null
          id?: string
        }
        Update: {
          campaign_id?: string | null
          category?: string
          estimated_amount?: number | null
          estimated_hours?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_estimates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_name: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          client_name?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          client_name?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
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
      chemical_compatibility: {
        Row: {
          compatibility: string
          created_at: string
          id: string
          risk_summary: string
          simple_explanation: string
          source: string | null
          strand_test: boolean
          technical_explanation: string
          treatment_desired: string
          treatment_done: string
          wait_weeks: number | null
        }
        Insert: {
          compatibility: string
          created_at?: string
          id?: string
          risk_summary: string
          simple_explanation: string
          source?: string | null
          strand_test?: boolean
          technical_explanation: string
          treatment_desired: string
          treatment_done: string
          wait_weeks?: number | null
        }
        Update: {
          compatibility?: string
          created_at?: string
          id?: string
          risk_summary?: string
          simple_explanation?: string
          source?: string | null
          strand_test?: boolean
          technical_explanation?: string
          treatment_desired?: string
          treatment_done?: string
          wait_weeks?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      hair_diagnostic_sessions: {
        Row: {
          answers: Json
          cizura_cta_clicked: boolean | null
          cizura_cta_shown: boolean | null
          created_at: string | null
          cuticle_score: number
          elasticity_score: number
          id: string
          porosity_score: number
          product_recommendations: string[] | null
          risk_level: string
          scalp_score: number
          total_score: number
          user_session_id: string
        }
        Insert: {
          answers?: Json
          cizura_cta_clicked?: boolean | null
          cizura_cta_shown?: boolean | null
          created_at?: string | null
          cuticle_score?: number
          elasticity_score?: number
          id?: string
          porosity_score?: number
          product_recommendations?: string[] | null
          risk_level: string
          scalp_score?: number
          total_score?: number
          user_session_id: string
        }
        Update: {
          answers?: Json
          cizura_cta_clicked?: boolean | null
          cizura_cta_shown?: boolean | null
          created_at?: string | null
          cuticle_score?: number
          elasticity_score?: number
          id?: string
          porosity_score?: number
          product_recommendations?: string[] | null
          risk_level?: string
          scalp_score?: number
          total_score?: number
          user_session_id?: string
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
          amazon_url_us: string | null
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
          tech_specs: Json | null
        }
        Insert: {
          amazon_asin?: string | null
          amazon_price?: number | null
          amazon_rating?: number | null
          amazon_reviews?: number | null
          amazon_title?: string | null
          amazon_url?: string | null
          amazon_url_us?: string | null
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
          tech_specs?: Json | null
        }
        Update: {
          amazon_asin?: string | null
          amazon_price?: number | null
          amazon_rating?: number | null
          amazon_reviews?: number | null
          amazon_title?: string | null
          amazon_url?: string | null
          amazon_url_us?: string | null
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
          tech_specs?: Json | null
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
      recovery_calendars: {
        Row: {
          calendar_json: Json
          damage_level: number
          generated_at: string
          hair_porosity: string
          id: string
          last_treatment: string
          next_safe_treatment_date: string
          scalp_condition: string
          user_session: string
        }
        Insert: {
          calendar_json: Json
          damage_level: number
          generated_at?: string
          hair_porosity: string
          id?: string
          last_treatment: string
          next_safe_treatment_date: string
          scalp_condition: string
          user_session: string
        }
        Update: {
          calendar_json?: Json
          damage_level?: number
          generated_at?: string
          hair_porosity?: string
          id?: string
          last_treatment?: string
          next_safe_treatment_date?: string
          scalp_condition?: string
          user_session?: string
        }
        Relationships: []
      }
      recovery_phases: {
        Row: {
          avoid: string[]
          checkpoint: string
          created_at: string
          damage_level_max: number
          damage_level_min: number
          id: string
          key_ingredients: string[]
          last_treatment_filter: string[] | null
          objective_simple: string
          objective_technical: string
          pending_review: boolean
          phase_type: string
          porosity_filter: string[] | null
          sources: Json
          week_end: number
          week_start: number
        }
        Insert: {
          avoid?: string[]
          checkpoint: string
          created_at?: string
          damage_level_max: number
          damage_level_min: number
          id: string
          key_ingredients?: string[]
          last_treatment_filter?: string[] | null
          objective_simple: string
          objective_technical: string
          pending_review?: boolean
          phase_type: string
          porosity_filter?: string[] | null
          sources?: Json
          week_end: number
          week_start: number
        }
        Update: {
          avoid?: string[]
          checkpoint?: string
          created_at?: string
          damage_level_max?: number
          damage_level_min?: number
          id?: string
          key_ingredients?: string[]
          last_treatment_filter?: string[] | null
          objective_simple?: string
          objective_technical?: string
          pending_review?: boolean
          phase_type?: string
          porosity_filter?: string[] | null
          sources?: Json
          week_end?: number
          week_start?: number
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
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
