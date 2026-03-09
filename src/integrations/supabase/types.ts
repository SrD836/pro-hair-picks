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
      alopecia_factors: {
        Row: {
          applies_to: string
          category: string
          created_at: string
          evidence_level: string
          factor_id: string
          factor_name: string
          factor_simple: string
          factor_technical: string
          id: string
          impact_magnitude: string
          modifiable: boolean
          pending_verification: boolean
          sources: Json | null
        }
        Insert: {
          applies_to: string
          category: string
          created_at?: string
          evidence_level: string
          factor_id: string
          factor_name: string
          factor_simple: string
          factor_technical: string
          id?: string
          impact_magnitude: string
          modifiable?: boolean
          pending_verification?: boolean
          sources?: Json | null
        }
        Update: {
          applies_to?: string
          category?: string
          created_at?: string
          evidence_level?: string
          factor_id?: string
          factor_name?: string
          factor_simple?: string
          factor_technical?: string
          id?: string
          impact_magnitude?: string
          modifiable?: boolean
          pending_verification?: boolean
          sources?: Json | null
        }
        Relationships: []
      }
      alopecia_myths: {
        Row: {
          common_in_profiles: string[]
          created_at: string
          id: string
          myth_id: string
          myth_statement: string
          scientific_explanation: string
          study_reference: Json | null
          verdict: string
          verdict_simple: string
        }
        Insert: {
          common_in_profiles?: string[]
          created_at?: string
          id?: string
          myth_id: string
          myth_statement: string
          scientific_explanation: string
          study_reference?: Json | null
          verdict: string
          verdict_simple: string
        }
        Update: {
          common_in_profiles?: string[]
          created_at?: string
          id?: string
          myth_id?: string
          myth_statement?: string
          scientific_explanation?: string
          study_reference?: Json | null
          verdict?: string
          verdict_simple?: string
        }
        Relationships: []
      }
      alopecia_reports: {
        Row: {
          evidence_based_options: Json
          generated_at: string
          id: string
          input_data: Json
          myth_alerts: string[]
          recommended_action: string
          risk_level: string
          risk_score: number
          session_id: string
        }
        Insert: {
          evidence_based_options?: Json
          generated_at?: string
          id?: string
          input_data: Json
          myth_alerts?: string[]
          recommended_action: string
          risk_level: string
          risk_score: number
          session_id: string
        }
        Update: {
          evidence_based_options?: Json
          generated_at?: string
          id?: string
          input_data?: Json
          myth_alerts?: string[]
          recommended_action?: string
          risk_level?: string
          risk_score?: number
          session_id?: string
        }
        Relationships: []
      }
      alopecia_treatments: {
        Row: {
          applies_to: string
          avg_cost_spain_eur: number | null
          contraindications: string[]
          created_at: string
          effective_stages_hamilton: number[]
          effective_stages_ludwig: number[]
          evidence_level: string
          id: string
          name: string
          pending_verification: boolean
          realistic_expectation: string
          requires_maintenance: boolean
          sources: Json | null
          time_to_results_months: number | null
          treatment_id: string
          type: string
        }
        Insert: {
          applies_to: string
          avg_cost_spain_eur?: number | null
          contraindications?: string[]
          created_at?: string
          effective_stages_hamilton?: number[]
          effective_stages_ludwig?: number[]
          evidence_level: string
          id?: string
          name: string
          pending_verification?: boolean
          realistic_expectation: string
          requires_maintenance?: boolean
          sources?: Json | null
          time_to_results_months?: number | null
          treatment_id: string
          type: string
        }
        Update: {
          applies_to?: string
          avg_cost_spain_eur?: number | null
          contraindications?: string[]
          created_at?: string
          effective_stages_hamilton?: number[]
          effective_stages_ludwig?: number[]
          evidence_level?: string
          id?: string
          name?: string
          pending_verification?: boolean
          realistic_expectation?: string
          requires_maintenance?: boolean
          sources?: Json | null
          time_to_results_months?: number | null
          treatment_id?: string
          type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          affiliate_products: string[] | null
          author: string | null
          bridge_trend_topic: string | null
          canonical: string | null
          category: string | null
          category_en: string | null
          cluster: string | null
          content: string | null
          content_en: string | null
          cover_image_url: string | null
          dislikes: number | null
          excerpt: string | null
          excerpt_en: string | null
          external_links: string[] | null
          has_data_viz: boolean | null
          has_expert_verdict: boolean | null
          hreflang: string | null
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
          canonical?: string | null
          category?: string | null
          category_en?: string | null
          cluster?: string | null
          content?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          dislikes?: number | null
          excerpt?: string | null
          excerpt_en?: string | null
          external_links?: string[] | null
          has_data_viz?: boolean | null
          has_expert_verdict?: boolean | null
          hreflang?: string | null
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
          canonical?: string | null
          category?: string | null
          category_en?: string | null
          cluster?: string | null
          content?: string | null
          content_en?: string | null
          cover_image_url?: string | null
          dislikes?: number | null
          excerpt?: string | null
          excerpt_en?: string | null
          external_links?: string[] | null
          has_data_viz?: boolean | null
          has_expert_verdict?: boolean | null
          hreflang?: string | null
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
      canicie_factors: {
        Row: {
          category: string
          created_at: string | null
          evidence_level: string
          factor_name: string
          factor_simple: string | null
          factor_technical: string | null
          id: string
          impact_magnitude: string | null
          modifiable: boolean
          myth_verdict: string | null
          sources: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          evidence_level: string
          factor_name: string
          factor_simple?: string | null
          factor_technical?: string | null
          id: string
          impact_magnitude?: string | null
          modifiable?: boolean
          myth_verdict?: string | null
          sources?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          evidence_level?: string
          factor_name?: string
          factor_simple?: string | null
          factor_technical?: string | null
          id?: string
          impact_magnitude?: string | null
          modifiable?: boolean
          myth_verdict?: string | null
          sources?: Json | null
        }
        Relationships: []
      }
      canicie_myths: {
        Row: {
          created_at: string | null
          id: string
          myth_statement: string
          nuance: string | null
          scientific_explanation: string | null
          study_reference: Json | null
          verdict: string
          verdict_simple: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          myth_statement: string
          nuance?: string | null
          scientific_explanation?: string | null
          study_reference?: Json | null
          verdict: string
          verdict_simple?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          myth_statement?: string
          nuance?: string | null
          scientific_explanation?: string | null
          study_reference?: Json | null
          verdict?: string
          verdict_simple?: string | null
        }
        Relationships: []
      }
      canicie_reports: {
        Row: {
          canicie_type: string
          generated_at: string | null
          id: string
          input_data: Json
          modifiable_factors: Json | null
          non_modifiable_factors: Json | null
          onset_classification: string
          realistic_expectations: string | null
          recommendations: Json | null
          session_id: string
          structural_care_needed: boolean | null
        }
        Insert: {
          canicie_type: string
          generated_at?: string | null
          id?: string
          input_data: Json
          modifiable_factors?: Json | null
          non_modifiable_factors?: Json | null
          onset_classification: string
          realistic_expectations?: string | null
          recommendations?: Json | null
          session_id: string
          structural_care_needed?: boolean | null
        }
        Update: {
          canicie_type?: string
          generated_at?: string | null
          id?: string
          input_data?: Json
          modifiable_factors?: Json | null
          non_modifiable_factors?: Json | null
          onset_classification?: string
          realistic_expectations?: string | null
          recommendations?: Json | null
          session_id?: string
          structural_care_needed?: boolean | null
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
      diagnostico_completo: {
        Row: {
          alopecia_data: Json | null
          canicie_data: Json | null
          capilar_data: Json | null
          created_at: string | null
          id: string
          overall_score: number | null
          user_id: string | null
          user_session_id: string | null
        }
        Insert: {
          alopecia_data?: Json | null
          canicie_data?: Json | null
          capilar_data?: Json | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          user_id?: string | null
          user_session_id?: string | null
        }
        Update: {
          alopecia_data?: Json | null
          canicie_data?: Json | null
          capilar_data?: Json | null
          created_at?: string | null
          id?: string
          overall_score?: number | null
          user_id?: string | null
          user_session_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
          user_session_id?: string
        }
        Relationships: []
      }
      inci_ingredients: {
        Row: {
          benefits_technical: string | null
          cas_number: string | null
          category: string
          common_name: string
          created_at: string | null
          eu_restriction: string | null
          function_simple: string | null
          function_technical: string | null
          id: string
          inci_name: string
          max_concentration_eu: string | null
          pending_review: boolean | null
          profile_allergy: Json | null
          profile_pregnancy: Json | null
          profile_sensitive_scalp: Json | null
          risks: Json | null
          search_vector: unknown
          sources: Json | null
          updated_at: string | null
        }
        Insert: {
          benefits_technical?: string | null
          cas_number?: string | null
          category: string
          common_name: string
          created_at?: string | null
          eu_restriction?: string | null
          function_simple?: string | null
          function_technical?: string | null
          id: string
          inci_name: string
          max_concentration_eu?: string | null
          pending_review?: boolean | null
          profile_allergy?: Json | null
          profile_pregnancy?: Json | null
          profile_sensitive_scalp?: Json | null
          risks?: Json | null
          search_vector?: unknown
          sources?: Json | null
          updated_at?: string | null
        }
        Update: {
          benefits_technical?: string | null
          cas_number?: string | null
          category?: string
          common_name?: string
          created_at?: string | null
          eu_restriction?: string | null
          function_simple?: string | null
          function_technical?: string | null
          id?: string
          inci_name?: string
          max_concentration_eu?: string | null
          pending_review?: boolean | null
          profile_allergy?: Json | null
          profile_pregnancy?: Json | null
          profile_sensitive_scalp?: Json | null
          risks?: Json | null
          search_vector?: unknown
          sources?: Json | null
          updated_at?: string | null
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
          slug: string
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
          slug: string
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
          slug?: string
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
      user_diagnostics: {
        Row: {
          created_at: string
          full_result: Json
          id: string
          is_complete_diagnostic: boolean
          result_summary: string
          share_token: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_result?: Json
          id?: string
          is_complete_diagnostic?: boolean
          result_summary?: string
          share_token?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_result?: Json
          id?: string
          is_complete_diagnostic?: boolean
          result_summary?: string
          share_token?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
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
