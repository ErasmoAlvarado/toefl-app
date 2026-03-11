"use client"

import { ListeningMaterialRow } from "@/actions/shared.actions"
import { PracticeTable, PracticeTask } from "@/components/ui/PracticeTable"

interface ListeningListProps {
  initialMaterials: Partial<ListeningMaterialRow>[]
  mode?: "practice" | "simulacro"
}

export function ListeningList({ initialMaterials, mode = "practice" }: ListeningListProps) {
  const tasks: PracticeTask[] = initialMaterials.map((material) => ({
    id: material.id!,
    title: material.title!,
    difficulty: material.difficulty || 3,
    category: material.type || "Lecture",
    href: `/practice/listening/${material.id}?mode=${mode}`,
    status: "todo"
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold tracking-tight">Available Materials</h2>
        <span className="text-sm text-muted-foreground font-medium">
          {tasks.length} items
        </span>
      </div>
      <PracticeTable tasks={tasks} />
    </div>
  )
}
