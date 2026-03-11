"use client"

import { SpeakingPromptRow } from "@/actions/shared.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface SpeakingListProps {
  initialPrompts: Partial<SpeakingPromptRow>[]
}

export function SpeakingList({ initialPrompts }: SpeakingListProps) {
  const tasks: PracticeTask[] = initialPrompts.map((prompt) => ({
    id: prompt.id!,
    title: prompt.prompt_text?.substring(0, 50) + "..." || "Independent Task",
    difficulty: "Medium", // Defaults for speaking as it's not in schema yet
    category: prompt.type || "Independent",
    href: `/practice/speaking/${prompt.id}`,
    status: "todo"
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight">Speaking Tasks</h2>
        <span className="text-sm text-muted-foreground font-medium">
          {tasks.length} items
        </span>
      </div>
      <PracticeTable tasks={tasks} />
    </div>
  )
}
