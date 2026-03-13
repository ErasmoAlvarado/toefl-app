"use client"

import React from "react"
import Link from "next/link"
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  BarChart2,
  Tag
} from "lucide-react"

export interface PracticeTask {
  id: string
  title: string
  difficulty: number | string
  category: string
  status?: "todo" | "solved" | "attempted"
  href: string
}

interface PracticeTableProps {
  tasks: PracticeTask[]
  isLoading?: boolean
}

export function PracticeTable({ tasks, isLoading }: PracticeTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 w-full bg-muted/30 rounded-xl shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-6 py-3 w-12 text-center">Status</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3 w-32">Difficulty</th>
              <th className="px-6 py-3 w-40">Category</th>
              <th className="px-6 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground/60">
                  <p className="text-sm italic">No tasks found. Generate some content to get started!</p>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="group hover:bg-muted/20 transition-all duration-200 cursor-pointer"
                >
                  <td className="px-6 py-4 text-center">
                    {task.status === "solved" ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
                    ) : task.status === "attempted" ? (
                      <Circle className="mx-auto h-5 w-5 text-amber-500 fill-amber-500/20" />
                    ) : (
                      <Circle className="mx-auto h-5 w-5 text-muted-foreground/30" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={task.href} 
                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                      <BarChart2 className="h-3 w-3" />
                      {typeof task.difficulty === 'number' ? `Level ${task.difficulty}` : task.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                      <Tag className="h-3 w-3" />
                      {task.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getDifficultyColor(difficulty: number | string) {
  if (typeof difficulty === 'string') {
    const d = difficulty.toLowerCase()
    if (d.includes('easy')) return 'text-green-500'
    if (d.includes('medium')) return 'text-amber-500'
    if (d.includes('hard')) return 'text-red-500'
    return 'text-muted-foreground'
  }
  
  if (difficulty <= 2) return "text-green-500"
  if (difficulty <= 4) return "text-amber-500"
  return "text-red-500"
}
