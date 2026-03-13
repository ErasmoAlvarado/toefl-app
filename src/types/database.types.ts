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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      daily_goals: {
        Row: {
          created_at: string | null
          date: string
          id: string
          listening_done: boolean | null
          notes: string | null
          reading_done: boolean | null
          speaking_done: boolean | null
          user_id: string
          vocabulary_reviewed: number | null
          writing_done: boolean | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          listening_done?: boolean | null
          notes?: string | null
          reading_done?: boolean | null
          speaking_done?: boolean | null
          user_id: string
          vocabulary_reviewed?: number | null
          writing_done?: boolean | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          listening_done?: boolean | null
          notes?: string | null
          reading_done?: boolean | null
          speaking_done?: boolean | null
          user_id?: string
          vocabulary_reviewed?: number | null
          writing_done?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listening_materials: {
        Row: {
          audio_url: string | null
          created_at: string | null
          difficulty: number | null
          duration_seconds: number | null
          id: string
          is_ai_generated: boolean | null
          questions: Json | null
          title: string
          topic_category: string | null
          transcript: string | null
          type: Database["public"]["Enums"]["listening_type"]
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          id?: string
          is_ai_generated?: boolean | null
          questions?: Json | null
          title: string
          topic_category?: string | null
          transcript?: string | null
          type: Database["public"]["Enums"]["listening_type"]
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          id?: string
          is_ai_generated?: boolean | null
          questions?: Json | null
          title?: string
          topic_category?: string | null
          transcript?: string | null
          type?: Database["public"]["Enums"]["listening_type"]
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          completed_at: string | null
          details: Json | null
          id: string
          max_score: number | null
          mode: string | null
          passage_id: string | null
          score: number | null
          section: Database["public"]["Enums"]["practice_section"]
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          id?: string
          max_score?: number | null
          mode?: string | null
          passage_id?: string | null
          score?: number | null
          section: Database["public"]["Enums"]["practice_section"]
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          id?: string
          max_score?: number | null
          mode?: string | null
          passage_id?: string | null
          score?: number | null
          section?: Database["public"]["Enums"]["practice_section"]
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "reading_passages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_level: Database["public"]["Enums"]["user_level"] | null
          exam_date: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          streak_days: number | null
          target_score: number | null
          total_xp: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["user_level"] | null
          exam_date?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          streak_days?: number | null
          target_score?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: Database["public"]["Enums"]["user_level"] | null
          exam_date?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          streak_days?: number | null
          target_score?: number | null
          total_xp?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reading_passages: {
        Row: {
          content: string
          created_at: string | null
          difficulty: number | null
          id: string
          is_ai_generated: boolean | null
          passage_type: Database["public"]["Enums"]["passage_type"] | null
          questions: Json | null
          times_attempted: number | null
          title: string
          topic_category: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_ai_generated?: boolean | null
          passage_type?: Database["public"]["Enums"]["passage_type"] | null
          questions?: Json | null
          times_attempted?: number | null
          title: string
          topic_category?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_ai_generated?: boolean | null
          passage_type?: Database["public"]["Enums"]["passage_type"] | null
          questions?: Json | null
          times_attempted?: number | null
          title?: string
          topic_category?: string | null
        }
        Relationships: []
      }
      speaking_prompts: {
        Row: {
          created_at: string | null
          difficulty: number | null
          id: string
          is_ai_generated: boolean | null
          listening_transcript: string | null
          preparation_time: number | null
          prompt_text: string
          reading_passage: string | null
          response_time: number | null
          sample_response: string | null
          scoring_rubric: Json | null
          task_number: number | null
          type: Database["public"]["Enums"]["speaking_task_type"]
        }
        Insert: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_ai_generated?: boolean | null
          listening_transcript?: string | null
          preparation_time?: number | null
          prompt_text: string
          reading_passage?: string | null
          response_time?: number | null
          sample_response?: string | null
          scoring_rubric?: Json | null
          task_number?: number | null
          type: Database["public"]["Enums"]["speaking_task_type"]
        }
        Update: {
          created_at?: string | null
          difficulty?: number | null
          id?: string
          is_ai_generated?: boolean | null
          listening_transcript?: string | null
          preparation_time?: number | null
          prompt_text?: string
          reading_passage?: string | null
          response_time?: number | null
          sample_response?: string | null
          scoring_rubric?: Json | null
          task_number?: number | null
          type?: Database["public"]["Enums"]["speaking_task_type"]
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          passage_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passage_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passage_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "reading_passages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          is_correct: boolean | null
          passage_id: string | null
          question_id: string
          question_type: string
          session_id: string
          time_spent_seconds: number | null
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          passage_id?: string | null
          question_id: string
          question_type: string
          session_id: string
          time_spent_seconds?: number | null
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          passage_id?: string | null
          question_id?: string
          question_type?: string
          session_id?: string
          time_spent_seconds?: number | null
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_attempts_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "reading_passages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_bank: {
        Row: {
          category: string | null
          created_at: string | null
          definition: string
          example_sentence: string | null
          id: string
          mastered: boolean | null
          next_review_at: string | null
          review_count: number | null
          toefl_frequency: Database["public"]["Enums"]["vocab_frequency"] | null
          user_id: string | null
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          definition: string
          example_sentence?: string | null
          id?: string
          mastered?: boolean | null
          next_review_at?: string | null
          review_count?: number | null
          toefl_frequency?:
            | Database["public"]["Enums"]["vocab_frequency"]
            | null
          user_id?: string | null
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          definition?: string
          example_sentence?: string | null
          id?: string
          mastered?: boolean | null
          next_review_at?: string | null
          review_count?: number | null
          toefl_frequency?:
            | Database["public"]["Enums"]["vocab_frequency"]
            | null
          user_id?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_bank_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      writing_prompts: {
        Row: {
          created_at: string | null
          discussion_posts: Json | null
          id: string
          is_ai_generated: boolean | null
          listening_transcript: string | null
          prompt_text: string
          reading_passage: string | null
          sample_response: string | null
          scoring_rubric: Json | null
          time_limit: number | null
          type: Database["public"]["Enums"]["writing_task_type"]
        }
        Insert: {
          created_at?: string | null
          discussion_posts?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          listening_transcript?: string | null
          prompt_text: string
          reading_passage?: string | null
          sample_response?: string | null
          scoring_rubric?: Json | null
          time_limit?: number | null
          type: Database["public"]["Enums"]["writing_task_type"]
        }
        Update: {
          created_at?: string | null
          discussion_posts?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          listening_transcript?: string | null
          prompt_text?: string
          reading_passage?: string | null
          sample_response?: string | null
          scoring_rubric?: Json | null
          time_limit?: number | null
          type?: Database["public"]["Enums"]["writing_task_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      listening_type: "lecture" | "conversation" | "response" | "announcement"
      passage_type: "academic" | "daily_life"
      practice_section: "reading" | "listening" | "speaking" | "writing"
      speaking_task_type: "independent" | "integrated" | "listen_and_repeat" | "interview"
      user_level: "beginner" | "intermediate" | "advanced"
      user_role: "NORMAL" | "ADMIN"
      vocab_frequency: "high" | "medium" | "low"
      writing_task_type: "integrated" | "academic_discussion"
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
      listening_type: ["lecture", "conversation", "response", "announcement"],
      passage_type: ["academic", "daily_life"],
      practice_section: ["reading", "listening", "speaking", "writing"],
      speaking_task_type: ["independent", "integrated", "listen_and_repeat", "interview"],
      user_level: ["beginner", "intermediate", "advanced"],
      user_role: ["NORMAL", "ADMIN"],
      vocab_frequency: ["high", "medium", "low"],
      writing_task_type: ["integrated", "academic_discussion"],
    },
  },
} as const
