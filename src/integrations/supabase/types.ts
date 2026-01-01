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
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          actor_name: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_name: string | null
          target_type: string
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_name: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type: string
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_name?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled: boolean
          feature_key: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_key: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_key?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      impersonation_sessions: {
        Row: {
          ended_at: string | null
          id: string
          impersonated_user_id: string
          is_active: boolean
          started_at: string
          superadmin_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          impersonated_user_id: string
          is_active?: boolean
          started_at?: string
          superadmin_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          impersonated_user_id?: string
          is_active?: boolean
          started_at?: string
          superadmin_id?: string
        }
        Relationships: []
      }
      instructor_availability: {
        Row: {
          created_at: string
          date: string
          day_of_week: number | null
          end_time: string
          id: string
          instructor_id: string
          is_recurring: boolean
          start_time: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          day_of_week?: number | null
          end_time: string
          id?: string
          instructor_id: string
          is_recurring?: boolean
          start_time: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          instructor_id?: string
          is_recurring?: boolean
          start_time?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_availability_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_credits: {
        Row: {
          created_at: string
          id: string
          student_id: string
          tenant_id: string
          total_credits: number
          updated_at: string
          used_credits: number
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          tenant_id: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          tenant_id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_credits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_credits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_feedback: {
        Row: {
          created_at: string
          id: string
          instructor_id: string
          lesson_id: string
          notes: string | null
          rating: number
          student_id: string
          tenant_id: string
          topics_practiced: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          instructor_id: string
          lesson_id: string
          notes?: string | null
          rating: number
          student_id: string
          tenant_id: string
          topics_practiced?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          instructor_id?: string
          lesson_id?: string
          notes?: string | null
          rating?: number
          student_id?: string
          tenant_id?: string
          topics_practiced?: string[] | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          notes: string | null
          status: string | null
          tenant_id: string | null
          topic_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          status?: string | null
          tenant_id?: string | null
          topic_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          status?: string | null
          tenant_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          created_by: string
          date: string
          duration: number
          id: string
          instructor_id: string
          remarks: string | null
          start_time: string
          status: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          tenant_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          duration?: number
          id?: string
          instructor_id: string
          remarks?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id: string
          tenant_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          duration?: number
          id?: string
          instructor_id?: string
          remarks?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["lesson_status"]
          student_id?: string
          tenant_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at: string | null
          updated_at: string | null
          user_limit: number
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: number
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: number
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          ai_insights: Json | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          pincode: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string | null
          theory_passed: boolean
          theory_passed_at: string | null
          username: string
        }
        Insert: {
          address?: string | null
          ai_insights?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          pincode: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          theory_passed?: boolean
          theory_passed_at?: string | null
          username: string
        }
        Update: {
          address?: string | null
          ai_insights?: Json | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          pincode?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          theory_passed?: boolean
          theory_passed_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          id: string
          instructor_id: string | null
          license_plate: string
          model: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          instructor_id?: string | null
          license_plate: string
          model: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          instructor_id?: string | null
          license_plate?: string
          model?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_reset_pincode_for_user: {
        Args: { _target_user_id: string }
        Returns: boolean
      }
      get_auth_user_role: { Args: never; Returns: string }
      get_auth_user_tenant_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tenant_id: { Args: never; Returns: string }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_admin: { Args: never; Returns: boolean }
      is_tenant_admin_or_instructor: { Args: never; Returns: boolean }
      reset_user_pincode: {
        Args: { _new_pincode: string; _target_user_id: string }
        Returns: undefined
      }
      user_belongs_to_tenant: { Args: { _tenant_id: string }; Returns: boolean }
    }
    Enums: {
      lesson_status: "pending" | "accepted" | "cancelled" | "completed"
      tenant_status: "active" | "trial" | "suspended"
      user_role: "admin" | "instructor" | "student" | "superadmin" | "parent"
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
    Enums: {
      lesson_status: ["pending", "accepted", "cancelled", "completed"],
      tenant_status: ["active", "trial", "suspended"],
      user_role: ["admin", "instructor", "student", "superadmin", "parent"],
    },
  },
} as const
