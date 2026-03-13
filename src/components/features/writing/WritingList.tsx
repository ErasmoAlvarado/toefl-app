"use client"

import { WritingPromptRow } from "@/actions/shared.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface WritingListProps {
  initialPrompts: Partial<WritingPromptRow>[]
}

/** Maps a discussion_posts JSON to the real writing task type */
function getWritingTaskType(prompt: Partial<WritingPromptRow>): string {
  const posts = prompt.discussion_posts as Record<string, unknown> | null
  if (posts && typeof posts === "object" && "writing_task_type" in posts) {
    const taskType = posts.writing_task_type as string
    switch (taskType) {
      case "build_sentence":
        return "Build a Sentence"
      case "email":
        return "Write an Email"
      case "academic_discussion":
        return "Discussion"
      default:
        return taskType
    }
  }
  // Fallback to DB type
  if (prompt.type === "academic_discussion") return "Discussion"
  return "Integrated"
}

/** Get the correct practice route based on task type */
function getWritingHref(prompt: Partial<WritingPromptRow>): string {
  const posts = prompt.discussion_posts as Record<string, unknown> | null
  if (posts && typeof posts === "object" && "writing_task_type" in posts) {
    const taskType = posts.writing_task_type as string
    switch (taskType) {
      case "build_sentence":
        return `/practice/writing/build-sentence?promptId=${prompt.id}`
      case "email":
        return `/practice/writing/email?promptId=${prompt.id}`
      case "academic_discussion":
        return `/practice/writing/academic-discussion?promptId=${prompt.id}`
    }
  }
  // Fallback based on DB type
  if (prompt.type === "academic_discussion") {
    return `/practice/writing/academic-discussion?promptId=${prompt.id}`
  }
  return `/practice/writing/email?promptId=${prompt.id}`
}

/** Extract difficulty from the discussion_posts metadata or default */
function getWritingDifficulty(prompt: Partial<WritingPromptRow>): number | string {
  const posts = prompt.discussion_posts as Record<string, unknown> | null
  if (posts && typeof posts === "object" && "difficulty" in posts) {
    return posts.difficulty as number
  }
  // Check if there's difficulty in the raw discussion_posts from Gemini
  return 3 // Default to intermediate if not found
}

export function WritingList({ initialPrompts }: WritingListProps) {
  const tasks: PracticeTask[] = initialPrompts.map((prompt) => ({
    id: prompt.id!,
    title: prompt.prompt_text?.substring(0, 60) + "..." || "Writing Task",
    difficulty: getWritingDifficulty(prompt),
    category: getWritingTaskType(prompt),
    href: getWritingHref(prompt),
    status: "todo"
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight">Writing Prompts</h2>
        <span className="text-sm text-muted-foreground font-medium">
          {tasks.length} items
        </span>
      </div>
      <PracticeTable tasks={tasks} />
    </div>
  )
}
