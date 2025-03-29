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
      portfolios: {
        Row: {
          archived: boolean
          auth_user_id: string | null
          color: string
          created_at: string | null
          description: string | null
          id: string
          last_updated: string | null
          name: string
          project_count: number
          total_hours: number
          user_id: string | null
        }
        Insert: {
          archived?: boolean
          auth_user_id?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          name: string
          project_count?: number
          total_hours?: number
          user_id?: string | null
        }
        Update: {
          archived?: boolean
          auth_user_id?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          project_count?: number
          total_hours?: number
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          portfolio_id: string | null
          progress: number | null
          status: string | null
          tasks_completed: number | null
          tasks_count: number | null
          total_hours: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          portfolio_id?: string | null
          progress?: number | null
          status?: string | null
          tasks_completed?: number | null
          tasks_count?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          portfolio_id?: string | null
          progress?: number | null
          status?: string | null
          tasks_completed?: number | null
          tasks_count?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      task_screenshots: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          id: string
          task_id: string
          thumbnail_url: string | null
          timestamp: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          task_id: string
          thumbnail_url?: string | null
          timestamp?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          task_id?: string
          thumbnail_url?: string | null
          timestamp?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_screenshots_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          hours_logged: number | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string | null
          url_mapping: string | null
          user_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          hours_logged?: number | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
          url_mapping?: string | null
          user_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          hours_logged?: number | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          url_mapping?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          subscription_id: number | null
          subscription_next_payment: string | null
          subscription_status: string | null
          subscription_subtotal: string | null
          token: string | null
          updated_at: string | null
          wordpress_user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_id?: number | null
          subscription_next_payment?: string | null
          subscription_status?: string | null
          subscription_subtotal?: string | null
          token?: string | null
          updated_at?: string | null
          wordpress_user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_id?: number | null
          subscription_next_payment?: string | null
          subscription_status?: string | null
          subscription_subtotal?: string | null
          token?: string | null
          updated_at?: string | null
          wordpress_user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_own_profile: {
        Args: {
          profile_wordpress_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
