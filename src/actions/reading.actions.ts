"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Database } from "@/types/database.types"
import { ToeflQuestion } from "@/types/reading.types"

export type ReadingPassageRow = Database["public"]["Tables"]["reading_passages"]["Row"]

/** Fetch all passages (list view — no questions JSONB to keep payload small) */
export async function fetchReadingPassages() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reading_passages")
      .select("id, title, topic_category, passage_type, difficulty, times_attempted, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching reading passages:", error.message)
    return { success: false, error: error.message, data: null }
  }
}

/** Fetch a single passage with its questions by ID */
export async function fetchPassageById(id: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reading_passages")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    // Cast JSONB questions array to the strongly-typed ToeflQuestion union
    const passage = {
      ...data,
      questions: (data.questions ?? []) as unknown as ToeflQuestion[],
    }

    return { success: true, data: passage }
  } catch (error: any) {
    console.error(`Error fetching passage ${id}:`, error.message)
    return { success: false, error: error.message, data: null }
  }
}

// ---------------------------------------------------------------------------
// Score saving
// ---------------------------------------------------------------------------

interface QuestionAttempt {
  questionId: string
  questionType: string
  userAnswer: string | string[] | Record<string, string> | null
  isCorrect: boolean
}

interface SaveReadingScoreParams {
  userId: string
  passageId: string
  mode: string
  score: number
  maxScore: number
  timeSpent: number
  questionAttempts: QuestionAttempt[]
}

/**
 * Saves a completed reading exam to the database.
 * - Creates a `practice_sessions` header record.
 * - Inserts one `user_question_attempts` row per question answered.
 * - Increments `reading_passages.times_attempted` counter.
 *
 * Uses the admin client for inserts so RLS doesn't block server actions.
 */
export async function saveReadingScore({
  userId,
  passageId,
  mode,
  score,
  maxScore,
  timeSpent,
  questionAttempts,
}: SaveReadingScoreParams) {
  try {
    const supabase = createAdminClient()

    // 1. Insert the session header
    const { data: sessionData, error: sessionError } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: userId,
        section: "reading",
        mode,
        score,
        max_score: maxScore,
        time_spent: timeSpent,
        passage_id: passageId,
      })
      .select("id")
      .single()

    if (sessionError) throw sessionError

    const sessionId = sessionData.id

    // 2. Insert one row per question attempt
    if (questionAttempts.length > 0) {
      const attemptRows = questionAttempts.map((attempt) => ({
        session_id: sessionId,
        user_id: userId,
        passage_id: passageId,
        question_id: attempt.questionId,
        question_type: attempt.questionType,
        user_answer: attempt.userAnswer as any,
        is_correct: attempt.isCorrect,
      }))

      const { error: attemptsError } = await supabase
        .from("user_question_attempts")
        .insert(attemptRows)

      if (attemptsError) {
        // Non-fatal: log but don't fail the whole save
        console.error("Error saving question attempts:", attemptsError.message)
      }
    }

    // 3. Increment times_attempted on the passage
    await supabase.rpc("increment_times_attempted" as any, { passage_id: passageId }).maybeSingle()
    // Note: If this RPC doesn't exist yet we just silently skip it.
    // A simple UPDATE would also work but requires admin perms already set.

    return { success: true, sessionId }
  } catch (error: any) {
    console.error("Error saving reading score:", error.message)
    return { success: false, error: error.message }
  }
}
