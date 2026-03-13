"use client"

import { DailyGoalsData } from "@/types/dashboard.types"
import { CheckCircle2, Circle, Sparkles, Target } from "lucide-react"

interface DailyGoalsProps {
  goalsData: DailyGoalsData | null
}

export function DailyGoals({ goalsData }: DailyGoalsProps) {
  if (!goalsData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-full bg-muted/50 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const totalTarget = goalsData.goals.reduce((s, g) => s + g.target, 0)
  const totalProgress = goalsData.goals.reduce((s, g) => s + Math.min(g.progress, g.target), 0)
  const overallPercent = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-foreground">Daily Goals</h3>
          </div>
          {goalsData.isComplete && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase">All Done!</span>
            </div>
          )}
        </div>

        {/* Overall progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{overallPercent}% complete</span>
            <span className="text-xs text-muted-foreground">+{goalsData.xpEarned} XP</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1">
        {goalsData.goals.map(goal => {
          const isDone = goal.progress >= goal.target
          const progressPercent = goal.target > 0 ? Math.min(Math.round((goal.progress / goal.target) * 100), 100) : 0
          return (
            <div
              key={goal.taskType}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                isDone ? "bg-emerald-500/5" : "hover:bg-muted/30"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-medium truncate ${isDone ? "text-emerald-400 line-through" : "text-foreground"}`}>
                    {goal.label}
                  </span>
                  <span className={`text-xs font-mono shrink-0 ml-2 ${isDone ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {goal.progress}/{goal.target}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? "bg-emerald-500" : "bg-indigo-500/60"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
