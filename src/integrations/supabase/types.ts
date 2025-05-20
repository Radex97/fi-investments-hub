export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          profiles_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          profiles_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          profiles_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_profiles_id_fkey"
            columns: ["profiles_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notification_logs: {
        Row: {
          admin_id: string
          created_at: string
          custom_content: boolean | null
          id: string
          notification_id: string | null
          sent_to_user_id: string | null
          template_id: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          custom_content?: boolean | null
          id?: string
          notification_id?: string | null
          sent_to_user_id?: string | null
          template_id?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          custom_content?: boolean | null
          id?: string
          notification_id?: string | null
          sent_to_user_id?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_profit: {
        Row: {
          created_at: string
          id: string
          rate_percent: number
        }
        Insert: {
          created_at?: string
          id: string
          rate_percent: number
        }
        Update: {
          created_at?: string
          id?: string
          rate_percent?: number
        }
        Relationships: []
      }
      etf_performance: {
        Row: {
          average_performance: number
          created_at: string
          date: string
          euro_stoxx_50: number | null
          id: string
          msci_world: number | null
          sp_500: number | null
        }
        Insert: {
          average_performance: number
          created_at?: string
          date?: string
          euro_stoxx_50?: number | null
          id?: string
          msci_world?: number | null
          sp_500?: number | null
        }
        Update: {
          average_performance?: number
          created_at?: string
          date?: string
          euro_stoxx_50?: number | null
          id?: string
          msci_world?: number | null
          sp_500?: number | null
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device: string | null
          id: string
          last_used_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device?: string | null
          id?: string
          last_used_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device?: string | null
          id?: string
          last_used_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          document_url: string | null
          id: string
          payment_received: boolean | null
          performance_percentage: number | null
          product_id: string
          product_title: string | null
          shares: number
          signature_date: string | null
          signature_provided: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          document_url?: string | null
          id?: string
          payment_received?: boolean | null
          performance_percentage?: number | null
          product_id: string
          product_title?: string | null
          shares: number
          signature_date?: string | null
          signature_provided?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          document_url?: string | null
          id?: string
          payment_received?: boolean | null
          performance_percentage?: number | null
          product_id?: string
          product_title?: string | null
          shares?: number
          signature_date?: string | null
          signature_provided?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legitimation_photos: {
        Row: {
          created_at: string
          id: string
          photo_type: string
          photo_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_type: string
          photo_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_type?: string
          photo_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          marketing_notifications: boolean | null
          product_updates: boolean | null
          push_enabled: boolean | null
          transaction_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          marketing_notifications?: boolean | null
          product_updates?: boolean | null
          push_enabled?: boolean | null
          transaction_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          marketing_notifications?: boolean | null
          product_updates?: boolean | null
          push_enabled?: boolean | null
          transaction_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          content_html: string | null
          content_text: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          trigger_event: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          trigger_event?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content_html?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          trigger_event?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notification_triggers: {
        Row: {
          created_at: string
          description: string | null
          email_enabled: boolean | null
          email_template_id: string | null
          event_key: string
          id: string
          name: string
          push_enabled: boolean | null
          push_template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email_enabled?: boolean | null
          email_template_id?: string | null
          event_key: string
          id?: string
          name: string
          push_enabled?: boolean | null
          push_template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email_enabled?: boolean | null
          email_template_id?: string | null
          event_key?: string
          id?: string
          name?: string
          push_enabled?: boolean | null
          push_template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_triggers_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_triggers_push_template_id_fkey"
            columns: ["push_template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_documents: {
        Row: {
          created_at: string
          document_type: string
          file_url: string
          id: string
          product_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_url: string
          id?: string
          product_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string
          id?: string
          product_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          calculated_profit_share: number | null
          created_at: string
          description: string
          fixed_interest_rate: number | null
          id: string
          image_url: string | null
          info_document_url: string | null
          interest_rate: number
          last_interest_date: string
          minimum_investment: number
          profit_share_percentage: number | null
          return_value: string
          risk_level: string
          slug: string | null
          terms_document_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          calculated_profit_share?: number | null
          created_at?: string
          description: string
          fixed_interest_rate?: number | null
          id?: string
          image_url?: string | null
          info_document_url?: string | null
          interest_rate?: number
          last_interest_date?: string
          minimum_investment?: number
          profit_share_percentage?: number | null
          return_value: string
          risk_level: string
          slug?: string | null
          terms_document_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          calculated_profit_share?: number | null
          created_at?: string
          description?: string
          fixed_interest_rate?: number | null
          id?: string
          image_url?: string | null
          info_document_url?: string | null
          interest_rate?: number
          last_interest_date?: string
          minimum_investment?: number
          profit_share_percentage?: number | null
          return_value?: string
          risk_level?: string
          slug?: string | null
          terms_document_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_holder: string | null
          bank_name: string | null
          bic: string | null
          birth_place: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          iban: string | null
          id: string
          is_company: boolean | null
          kyc_status: string | null
          last_name: string | null
          legal_form: string | null
          nationality: string | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          salutation: string | null
          street: string | null
          trade_register_number: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          birth_place?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          iban?: string | null
          id: string
          is_company?: boolean | null
          kyc_status?: string | null
          last_name?: string | null
          legal_form?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salutation?: string | null
          street?: string | null
          trade_register_number?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          birth_place?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          iban?: string | null
          id?: string
          is_company?: boolean | null
          kyc_status?: string | null
          last_name?: string | null
          legal_form?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          salutation?: string | null
          street?: string | null
          trade_register_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          status: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_knowledge: {
        Row: {
          average_investment_amount: string
          bond_experience: string
          created_at: string
          id: string
          investment_frequency: string
          investment_knowledge: string
          is_pep: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_investment_amount: string
          bond_experience: string
          created_at?: string
          id?: string
          investment_frequency: string
          investment_knowledge: string
          is_pep?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_investment_amount?: string
          bond_experience?: string
          created_at?: string
          id?: string
          investment_frequency?: string
          investment_knowledge?: string
          is_pep?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_create_activity_logs_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_latest_etf_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          date: string
          euro_stoxx_50: number
          msci_world: number
          sp_500: number
          average_performance: number
          created_at: string
        }[]
      }
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user: {
        Args: { row_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const
