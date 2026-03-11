"use client"

import { WritingPromptRow } from "@/actions/shared.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface WritingListProps {
  initialPrompts: Partial<WritingPromptRow>[]
}

export function WritingList({ initialPrompts }: WritingListProps) {
  const tasks: PracticeTask[] = initialPrompts.map((prompt) => ({
    id: prompt.id!,
    title: prompt.prompt_text?.substring(0, 50) + "..." || "Writing Task",
    difficulty: "Medium",
    category: prompt.type || "Integrated",
    href: `/practice/writing/${prompt.id}`,
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
