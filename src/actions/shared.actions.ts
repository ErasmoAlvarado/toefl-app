"use server"

import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"

export type ListeningMaterialRow = Database["public"]["Tables"]["listening_materials"]["Row"]
export type SpeakingPromptRow = Database["public"]["Tables"]["speaking_prompts"]["Row"]
export type WritingPromptRow = Database["public"]["Tables"]["writing_prompts"]["Row"]

export async function fetchListeningMaterials() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("listening_materials")
      .select("id, title, topic_category, difficulty, type, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchSpeakingPrompts() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("speaking_prompts")
      .select("id, prompt_text, type, difficulty, task_number, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchWritingPrompts() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("writing_prompts")
      .select("id, prompt_text, type, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Fetches a single speaking prompt by its ID.
 */
export async function fetchSpeakingPromptById(promptId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("speaking_prompts")
      .select("*")
      .eq("id", promptId)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
