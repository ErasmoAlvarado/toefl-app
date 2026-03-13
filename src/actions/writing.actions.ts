"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  WritingActionResponse,
  WritingHistoryEntry,
  WritingTaskType,
} from "@/types/writing.types";

/**
 * Saves a completed writing session to `practice_sessions`.
 */
export async function saveWritingSession(params: {
  taskType: WritingTaskType;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  details: Record<string, unknown>;
}): Promise<WritingActionResponse<{ sessionId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, data: { sessionId: "anonymous" } };
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: user.id,
        section: "writing" as const,
        mode: "practice",
        score: params.score,
        max_score: params.maxScore,
        time_spent: params.timeSpentSeconds,
        details: {
          task_type: params.taskType,
          ...params.details,
        },
      })
      .select("id")
      .single();

    if (error) throw error;

    return { success: true, data: { sessionId: data.id } };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to save writing session";
    console.error("saveWritingSession error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches writing session history for the current user.
 */
export async function fetchWritingHistory(): Promise<
  WritingActionResponse<WritingHistoryEntry[]>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .select("id, score, max_score, time_spent, details, completed_at")
      .eq("user_id", user.id)
      .eq("section", "writing")
      .order("completed_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const entries: WritingHistoryEntry[] = (data || []).map((row) => {
      const details = (row.details || {}) as Record<string, unknown>;
      const taskType = (details.task_type as WritingTaskType) || "email";
      const minutes = Math.floor((row.time_spent || 0) / 60);
      const seconds = (row.time_spent || 0) % 60;

      return {
        id: row.id,
        date: row.completed_at
          ? new Date(row.completed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "Unknown",
        type: taskType,
        score: row.score || 0,
        maxScore: row.max_score || 5,
        duration: `${minutes}m ${seconds.toString().padStart(2, "0")}s`,
        details,
      };
    });

    return { success: true, data: entries };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch writing history";
    console.error("fetchWritingHistory error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches a single writing prompt by ID including its metadata.
 */
export async function fetchWritingPromptById(
  promptId: string
): Promise<WritingActionResponse<Record<string, unknown>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("writing_prompts")
      .select("*")
      .eq("id", promptId)
      .single();

    if (error) throw error;
    if (!data) return { success: false, error: "Prompt not found" };

    return { success: true, data: data as unknown as Record<string, unknown> };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch writing prompt";
    console.error("fetchWritingPromptById error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
