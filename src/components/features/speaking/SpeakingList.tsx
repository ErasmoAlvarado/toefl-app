"use client"

import { SpeakingPromptRow } from "@/actions/shared.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface SpeakingListProps {
  initialPrompts: Partial<SpeakingPromptRow>[]
}

export function SpeakingList({ initialPrompts }: SpeakingListProps) {
  const difficultyMapping: Record<number, string> = {
    1: "Beginner",
    2: "Easy",
    3: "Medium",
    4: "Hard",
    5: "Expert"
  };

  const tasks: PracticeTask[] = initialPrompts.map((prompt) => ({
    id: prompt.id!,
    title: prompt.type === 'listen_and_repeat' ? "Listen & Repeat Task" : prompt.prompt_text?.substring(0, 50) + "..." || "Speaking Task",
    difficulty: prompt.difficulty ? difficultyMapping[prompt.difficulty] || "Medium" : "Medium",
    category: prompt.type === 'listen_and_repeat' ? "Listen & Repeat" : prompt.type === 'interview' ? "Interview" : prompt.type || "Speaking",
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
