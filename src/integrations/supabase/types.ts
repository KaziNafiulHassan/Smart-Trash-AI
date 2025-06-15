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
      achievements: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string | null
          description_de: string
          description_en: string
          emoji: string
          id: string
          name_de: string
          name_en: string
        }
        Insert: {
          condition_type: string
          condition_value: number
          created_at?: string | null
          description_de: string
          description_en: string
          emoji: string
          id: string
          name_de: string
          name_en: string
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string | null
          description_de?: string
          description_en?: string
          emoji?: string
          id?: string
          name_de?: string
          name_en?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          bin_type: Database["public"]["Enums"]["bin_type"]
          created_at: string | null
          id: string
          name_de: string
          name_en: string
          rule_de: string | null
          rule_en: string | null
        }
        Insert: {
          bin_type: Database["public"]["Enums"]["bin_type"]
          created_at?: string | null
          id: string
          name_de: string
          name_en: string
          rule_de?: string | null
          rule_en?: string | null
        }
        Update: {
          bin_type?: Database["public"]["Enums"]["bin_type"]
          created_at?: string | null
          id?: string
          name_de?: string
          name_en?: string
          rule_de?: string | null
          rule_en?: string | null
        }
        Relationships: []
      }
      feedback_ratings: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          item_id: string | null
          rating: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          item_id?: string | null
          rating: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          item_id?: string | null
          rating?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          accuracy: number
          completed_at: string | null
          correct_sorts: number
          id: string
          items_sorted: number
          level: number
          score: number
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          accuracy: number
          completed_at?: string | null
          correct_sorts: number
          id?: string
          items_sorted: number
          level: number
          score: number
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy?: number
          completed_at?: string | null
          correct_sorts?: number
          id?: string
          items_sorted?: number
          level?: number
          score?: number
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_game_sessions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_classifications: {
        Row: {
          confidence: number | null
          created_at: string | null
          feedback_comment: string | null
          id: string
          image_url: string | null
          predicted_bin: Database["public"]["Enums"]["bin_type"] | null
          predicted_category: string | null
          user_feedback_correct: boolean | null
          user_id: string | null
          user_selected_bin: Database["public"]["Enums"]["bin_type"] | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          feedback_comment?: string | null
          id?: string
          image_url?: string | null
          predicted_bin?: Database["public"]["Enums"]["bin_type"] | null
          predicted_category?: string | null
          user_feedback_correct?: boolean | null
          user_id?: string | null
          user_selected_bin?: Database["public"]["Enums"]["bin_type"] | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          feedback_comment?: string | null
          id?: string
          image_url?: string | null
          predicted_bin?: Database["public"]["Enums"]["bin_type"] | null
          predicted_category?: string | null
          user_feedback_correct?: boolean | null
          user_id?: string | null
          user_selected_bin?: Database["public"]["Enums"]["bin_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_image_classifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_emoji: string | null
          created_at: string | null
          data_usage_approved: boolean | null
          gender: string | null
          id: string
          language: Database["public"]["Enums"]["user_language"] | null
          name: string
          nationality: string | null
          registration_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string | null
          data_usage_approved?: boolean | null
          gender?: string | null
          id: string
          language?: Database["public"]["Enums"]["user_language"] | null
          name: string
          nationality?: string | null
          registration_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string | null
          data_usage_approved?: boolean | null
          gender?: string | null
          id?: string
          language?: Database["public"]["Enums"]["user_language"] | null
          name?: string
          nationality?: string | null
          registration_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          id: string
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_achievements_achievement_id"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_achievements_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          best_score: number | null
          best_streak: number | null
          completed_levels: number | null
          created_at: string | null
          current_streak: number | null
          id: string
          level: number | null
          total_attempts: number | null
          total_correct: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          best_score?: number | null
          best_streak?: number | null
          completed_levels?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          level?: number | null
          total_attempts?: number | null
          total_correct?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          best_score?: number | null
          best_streak?: number | null
          completed_levels?: number | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          level?: number | null
          total_attempts?: number | null
          total_correct?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_progress_user_id"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_study_data: {
        Row: {
          additional_notes: string | null
          age: number | null
          consent_timestamp: string | null
          created_at: string | null
          data_usage_approved: boolean
          gender: string | null
          id: string
          nationality: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          age?: number | null
          consent_timestamp?: string | null
          created_at?: string | null
          data_usage_approved?: boolean
          gender?: string | null
          id?: string
          nationality?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          age?: number | null
          consent_timestamp?: string | null
          created_at?: string | null
          data_usage_approved?: boolean
          gender?: string | null
          id?: string
          nationality?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description_de: string | null
          description_en: string | null
          id: string
          item_name_de: string
          item_name_en: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description_de?: string | null
          description_en?: string | null
          id: string
          item_name_de: string
          item_name_en: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description_de?: string | null
          description_en?: string | null
          id?: string
          item_name_de?: string
          item_name_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_waste_items_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_user_registration: {
        Args: {
          p_user_id: string
          p_name: string
          p_age: number
          p_gender: string
          p_nationality: string
          p_data_usage_approved: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      bin_type:
        | "bio"
        | "paper"
        | "plastic"
        | "residual"
        | "glass"
        | "hazardous"
        | "bulky"
      user_language: "EN" | "DE"
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
      bin_type: [
        "bio",
        "paper",
        "plastic",
        "residual",
        "glass",
        "hazardous",
        "bulky",
      ],
      user_language: ["EN", "DE"],
    },
  },
} as const
