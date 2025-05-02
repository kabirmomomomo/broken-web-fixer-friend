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
      cart_item_customizations: {
        Row: {
          cart_item_id: string
          created_at: string | null
          customization_id: string
          id: string
          selected_option: string
        }
        Insert: {
          cart_item_id: string
          created_at?: string | null
          customization_id: string
          id?: string
          selected_option: string
        }
        Update: {
          cart_item_id?: string
          created_at?: string | null
          customization_id?: string
          id?: string
          selected_option?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_item_customizations_customization_id_fkey"
            columns: ["customization_id"]
            isOneToOne: false
            referencedRelation: "menu_item_customizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_addon_options: {
        Row: {
          addon_id: string
          created_at: string | null
          id: string
          name: string
          order: number | null
          price: string
          updated_at: string | null
        }
        Insert: {
          addon_id: string
          created_at?: string | null
          id?: string
          name: string
          order?: number | null
          price: string
          updated_at?: string | null
        }
        Update: {
          addon_id?: string
          created_at?: string | null
          id?: string
          name?: string
          order?: number | null
          price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_addon_options_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "menu_item_addons"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order: number | null
          restaurant_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          order?: number | null
          restaurant_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order?: number | null
          restaurant_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_addon_mapping: {
        Row: {
          addon_id: string
          created_at: string | null
          id: string
          menu_item_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string | null
          id?: string
          menu_item_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string | null
          id?: string
          menu_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_addon_mapping_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "menu_item_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_addon_mapping_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_addons: {
        Row: {
          created_at: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_item_customizations: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          name: string
          options: string[]
          required: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          name: string
          options: string[]
          required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          name?: string
          options?: string[]
          required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_customizations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string
          name: string
          order: number | null
          price: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id: string
          name: string
          order?: number | null
          price: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string
          name?: string
          order?: number | null
          price?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_vegetarian: boolean | null
          is_visible: boolean | null
          name: string
          old_price: string | null
          order: number | null
          price: string
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegetarian?: boolean | null
          is_visible?: boolean | null
          name: string
          old_price?: string | null
          order?: number | null
          price: string
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegetarian?: boolean | null
          is_visible?: boolean | null
          name?: string
          old_price?: string | null
          order?: number | null
          price?: string
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_name: string
          order_id: string
          price: number
          quantity: number
          restaurant_id: string | null
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_name: string
          order_id: string
          price: number
          quantity: number
          restaurant_id?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_name?: string
          order_id?: string
          price?: number
          quantity?: number
          restaurant_id?: string | null
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          restaurant_id: string
          status: string
          stripe_session_id: string | null
          table_id: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id: string
          status?: string
          stripe_session_id?: string | null
          table_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string
          status?: string
          stripe_session_id?: string | null
          table_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          closing_time: string | null
          created_at: string | null
          description: string | null
          google_review_link: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          opening_time: string | null
          payment_gateway_merchant_id: string | null
          payment_gateway_public_key: string | null
          payment_gateway_type: string | null
          payment_qr_code: string | null
          phone: string | null
          stripe_account_id: string | null
          stripe_public_key: string | null
          table_count: number | null
          updated_at: string | null
          upi_id: string | null
          use_payment_gateway: boolean | null
          use_stripe_payments: boolean | null
          user_id: string
          wifi_password: string | null
        }
        Insert: {
          closing_time?: string | null
          created_at?: string | null
          description?: string | null
          google_review_link?: string | null
          id: string
          image_url?: string | null
          location?: string | null
          name: string
          opening_time?: string | null
          payment_gateway_merchant_id?: string | null
          payment_gateway_public_key?: string | null
          payment_gateway_type?: string | null
          payment_qr_code?: string | null
          phone?: string | null
          stripe_account_id?: string | null
          stripe_public_key?: string | null
          table_count?: number | null
          updated_at?: string | null
          upi_id?: string | null
          use_payment_gateway?: boolean | null
          use_stripe_payments?: boolean | null
          user_id: string
          wifi_password?: string | null
        }
        Update: {
          closing_time?: string | null
          created_at?: string | null
          description?: string | null
          google_review_link?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          opening_time?: string | null
          payment_gateway_merchant_id?: string | null
          payment_gateway_public_key?: string | null
          payment_gateway_type?: string | null
          payment_qr_code?: string | null
          phone?: string | null
          stripe_account_id?: string | null
          stripe_public_key?: string | null
          table_count?: number | null
          updated_at?: string | null
          upi_id?: string | null
          use_payment_gateway?: boolean | null
          use_stripe_payments?: boolean | null
          user_id?: string
          wifi_password?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          table_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          table_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          table_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      waiter_calls: {
        Row: {
          created_at: string
          id: string
          reason: string
          restaurant_id: string
          status: string
          table_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          restaurant_id: string
          status?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          restaurant_id?: string
          status?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiter_calls_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_table_if_not_exists: {
        Args: { table_name: string; table_definition: string }
        Returns: undefined
      }
      execute_sql: {
        Args: { sql_string: string }
        Returns: Json
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
    Enums: {},
  },
} as const
