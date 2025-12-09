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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      ,
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_applications: {
        Row: {
          applied_on: string
          attachment_url: string | null
          comments: string | null
          end_date: string
          id: string
          is_emergency: boolean | null
          is_reason_invalid: boolean | null
          leave_type: string
          owner_id: string | null
          reason: string
          reviewed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          student_id: string
          student_name: string
          teacher_remarks: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          applied_on?: string
          attachment_url?: string | null
          comments?: string | null
          end_date: string
          id?: string
          is_emergency?: boolean | null
          is_reason_invalid?: boolean | null
          leave_type: string
          owner_id?: string | null
          reason: string
          reviewed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          student_id: string
          student_name: string
          teacher_remarks?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          applied_on?: string
          attachment_url?: string | null
          comments?: string | null
          end_date?: string
          id?: string
          is_emergency?: boolean | null
          is_reason_invalid?: boolean | null
          leave_type?: string
          owner_id?: string | null
          reason?: string
          reviewed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          student_id?: string
          student_name?: string
          teacher_remarks?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ,
      faculty_leave_applications: {
        Row: {
          id: string
          faculty_id: string
          leave_type: string
          reason: string
          start_date: string
          end_date: string
          is_emergency: boolean | null
          attachment_url: string | null
          status: Database["public"]["Enums"]["leave_status"] | null
          admin_remarks: string | null
          reviewed_by: string | null
          applied_on: string
          updated_at: string
          faculty_name: string | null
          faculty_email: string | null
          approved_by_name: string | null
        }
        Insert: {
          id?: string
          faculty_id: string
          leave_type: string
          reason: string
          start_date: string
          end_date: string
          is_emergency?: boolean | null
          attachment_url?: string | null
          status?: Database["public"]["Enums"]["leave_status"] | null
          admin_remarks?: string | null
          reviewed_by?: string | null
          applied_on?: string
          updated_at?: string
          faculty_name?: string | null
          faculty_email?: string | null
          approved_by_name?: string | null
        }
        Update: {
          id?: string
          faculty_id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          end_date?: string
          is_emergency?: boolean | null
          attachment_url?: string | null
          status?: Database["public"]["Enums"]["leave_status"] | null
          admin_remarks?: string | null
          reviewed_by?: string | null
          applied_on?: string
          updated_at?: string
          faculty_name?: string | null
          faculty_email?: string | null
          approved_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_leave_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_leave_applications_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_quota_log: {
        Row: {
          id: string
          new_quota: number | null
          old_quota: number | null
          student_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          new_quota?: number | null
          old_quota?: number | null
          student_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          new_quota?: number | null
          old_quota?: number | null
          student_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_quota_log_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_to: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_to?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_to?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_to_fkey"
            columns: ["related_to"]
            isOneToOne: false
            referencedRelation: "leave_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          leave_quota: number | null
          otp_secret: string | null
          role: Database["public"]["Enums"]["user_role"]
          student_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          leave_quota?: number | null
          otp_secret?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          leave_quota?: number | null
          otp_secret?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ,
      user_roles: {
        Row: {
          user_id: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string | null
        }
        Insert: {
          user_id: string
          role: Database["public"]["Enums"]["user_role"]
          created_at?: string | null
        }
        Update: {
          user_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_notification_count: {
        Args: { user_id: string }
        Returns: number
      },
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"] | null
      },
      has_role: {
        Args: { _user_id: string; _role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      leave_status: "pending" | "approved" | "rejected"
      user_role: "student" | "admin" | "faculty"
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
      leave_status: ["pending", "approved", "rejected"],
      user_role: ["student", "admin", "faculty"],
    },
  },
} as const
