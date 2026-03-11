"use client"

import { ReadingPassageRow } from "@/actions/reading.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface ReadingListProps {
  initialPassages: Partial<ReadingPassageRow>[]
  mode?: "practice" | "simulacro"
}

export function ReadingList({ initialPassages, mode = "practice" }: ReadingListProps) {
  const tasks: PracticeTask[] = initialPassages.map((passage) => ({
    id: passage.id!,
    title: passage.title!,
    difficulty: passage.difficulty || 3,
    category: passage.topic_category || "General",
    href: `/practice/reading/${passage.id}?mode=${mode}`,
    status: "todo" // TODO: Fetch actual status from session history
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight">Available Passages</h2>
        <span className="text-sm text-muted-foreground font-medium">
          {tasks.length} items
        </span>
      </div>
      <PracticeTable tasks={tasks} />
    </div>
  )
}
