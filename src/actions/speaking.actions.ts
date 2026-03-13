"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, SpeakingHistoryEntry } from "@/types/speaking.types";

/**
 * Saves a completed speaking session to the `practice_sessions` table.
 * Also stores per-item details inside the `details` JSONB column.
 */
export async function saveSpeakingSession(params: {
  taskType: "listen_and_repeat" | "interview";
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  details: Record<string, unknown>;
}): Promise<ActionResponse<{ sessionId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Allow anonymous usage — store without user_id via service role or skip DB
      return { success: true, data: { sessionId: "anonymous" } };
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: user.id,
        section: "speaking" as const,
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
    const errorMessage = err instanceof Error ? err.message : "Failed to save session";
    console.error("saveSpeakingSession error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches speaking session history for the current user.
 */
export async function fetchSpeakingHistory(): Promise<ActionResponse<SpeakingHistoryEntry[]>> {
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
      .eq("section", "speaking")
      .order("completed_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const entries: SpeakingHistoryEntry[] = (data || []).map((row) => {
      const details = (row.details || {}) as Record<string, unknown>;
      const taskType = (details.task_type as string) || "listen_and_repeat";
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
        type: taskType as "listen_and_repeat" | "interview",
        score: row.score || 0,
        maxScore: row.max_score || 5,
        duration: `${minutes}m ${seconds.toString().padStart(2, "0")}s`,
        details,
      };
    });

    return { success: true, data: entries };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch history";
    console.error("fetchSpeakingHistory error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
