export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          details: Json | null;
          id: string;
          target_id: string | null;
          target_table: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          target_id?: string | null;
          target_table?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          target_id?: string | null;
          target_table?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          user_id: string | null;
          origem_lead_id: string | null;
          razao_social: string;
          documento: string;
          tipo_documento: string;
          inscricao_estadual: string | null;
          email: string;
          contato_nome: string;
          telefone: string;
          logradouro: string;
          numero: string | null;
          bairro: string | null;
          cidade: string;
          uf: string;
          cep: string;
          status: string;
          grupo_preco_id: string | null;
          aprovado_por: string | null;
          aprovado_em: string | null;
          boleto_liberado: boolean;
          boleto_prazos_dias: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          origem_lead_id?: string | null;
          razao_social: string;
          documento: string;
          tipo_documento: string;
          inscricao_estadual?: string | null;
          email: string;
          contato_nome: string;
          telefone: string;
          logradouro: string;
          numero?: string | null;
          bairro?: string | null;
          cidade: string;
          uf: string;
          cep: string;
          status?: string;
          grupo_preco_id?: string | null;
          aprovado_por?: string | null;
          aprovado_em?: string | null;
          boleto_liberado?: boolean;
          boleto_prazos_dias?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          origem_lead_id?: string | null;
          razao_social?: string;
          documento?: string;
          tipo_documento?: string;
          inscricao_estadual?: string | null;
          email?: string;
          contato_nome?: string;
          telefone?: string;
          logradouro?: string;
          numero?: string | null;
          bairro?: string | null;
          cidade?: string;
          uf?: string;
          cep?: string;
          status?: string;
          grupo_preco_id?: string | null;
          aprovado_por?: string | null;
          aprovado_em?: string | null;
          boleto_liberado?: boolean;
          boleto_prazos_dias?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clientes_grupo_preco_id_fkey";
            columns: ["grupo_preco_id"];
            isOneToOne: false;
            referencedRelation: "grupos_preco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clientes_origem_lead_id_fkey";
            columns: ["origem_lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      grupos_preco: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      precos: {
        Row: {
          id: string;
          produto_id: string;
          grupo_preco_id: string;
          valor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          produto_id: string;
          grupo_preco_id: string;
          valor: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          produto_id?: string;
          grupo_preco_id?: string;
          valor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "precos_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "precos_grupo_preco_id_fkey";
            columns: ["grupo_preco_id"];
            isOneToOne: false;
            referencedRelation: "grupos_preco";
            referencedColumns: ["id"];
          },
        ];
      };
      precos_excecao: {
        Row: {
          id: string;
          cliente_id: string;
          produto_id: string;
          valor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          produto_id: string;
          valor: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          produto_id?: string;
          valor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "precos_excecao_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "precos_excecao_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          interest: string | null;
          message: string | null;
          name: string;
          phone: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          interest?: string | null;
          message?: string | null;
          name: string;
          phone?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          interest?: string | null;
          message?: string | null;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      leads_rate_limit: {
        Row: {
          created_at: string;
          id: string;
          ip: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip?: string;
        };
        Relationships: [];
      };
      product_lines: {
        Row: {
          available: boolean;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          available: boolean | null;
          box_weight: string | null;
          category_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string;
          name: string;
          sort_order: number;
          updated_at: string | null;
          weight: string;
        };
        Insert: {
          available?: boolean | null;
          box_weight?: string | null;
          category_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url: string;
          name: string;
          sort_order?: number;
          updated_at?: string | null;
          weight: string;
        };
        Update: {
          available?: boolean | null;
          box_weight?: string | null;
          category_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string | null;
          weight?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_lines";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          contact_email: string;
          contact_phone: string;
          facebook_url: string | null;
          gtm_id: string | null;
          id: string;
          instagram_url: string | null;
          meta_pixel_id: string | null;
          stat_1_value: number;
          stat_1_label: string;
          stat_2_value: number;
          stat_2_label: string;
          stat_3_value: number;
          stat_3_label: string;
          updated_at: string;
        };
        Insert: {
          contact_email: string;
          contact_phone: string;
          facebook_url?: string | null;
          gtm_id?: string | null;
          id?: string;
          instagram_url?: string | null;
          meta_pixel_id?: string | null;
          stat_1_value?: number;
          stat_1_label?: string;
          stat_2_value?: number;
          stat_2_label?: string;
          stat_3_value?: number;
          stat_3_label?: string;
          updated_at?: string;
        };
        Update: {
          contact_email?: string;
          contact_phone?: string;
          facebook_url?: string | null;
          gtm_id?: string | null;
          id?: string;
          instagram_url?: string | null;
          meta_pixel_id?: string | null;
          stat_1_value?: number;
          stat_1_label?: string;
          stat_2_value?: number;
          stat_2_label?: string;
          stat_3_value?: number;
          stat_3_label?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          image_url: string;
          title: string;
          year: string;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          id?: string;
          image_url: string;
          title: string;
          year: string;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          image_url?: string;
          title?: string;
          year?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "operador" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operador", "user"],
    },
  },
} as const;
