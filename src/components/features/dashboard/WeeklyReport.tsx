"use client"

import { WeeklyReportData, SectionName } from "@/types/dashboard.types"
import { CalendarDays, Clock, Target, Zap, BookOpen, Headphones, Mic, PenTool } from "lucide-react"

interface WeeklyReportProps {
  reportData: WeeklyReportData | null
}

const SECTION_CONFIG: Record<SectionName, { icon: typeof BookOpen; color: string }> = {
  reading: { icon: BookOpen, color: "text-blue-400" },
  listening: { icon: Headphones, color: "text-emerald-400" },
  speaking: { icon: Mic, color: "text-amber-400" },
  writing: { icon: PenTool, color: "text-purple-400" },
}

export function WeeklyReport({ reportData }: WeeklyReportProps) {
  if (!reportData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-32 w-full bg-muted/50 rounded" />
      </div>
    )
  }

  const statCards = [
    {
      icon: CalendarDays,
      label: "Sessions",
      value: reportData.totalSessions.toString(),
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Clock,
      label: "Time",
      value: `${reportData.totalTimeMinutes}m`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Target,
      label: "Accuracy",
      value: `${reportData.averageAccuracy}%`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Zap,
      label: "XP",
      value: `+${reportData.xpEarned}`,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-400" />
          <h3 className="font-bold text-sm text-foreground">This Week</h3>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 divide-x divide-border/30">
        {statCards.map(stat => {
          const IconComp = stat.icon
          return (
            <div key={stat.label} className="p-3 text-center">
              <div className={`h-8 w-8 mx-auto rounded-lg ${stat.bg} flex items-center justify-center mb-1.5`}>
                <IconComp className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Per-section breakdown */}
      <div className="p-4 border-t border-border/30">
        <div className="space-y-2">
          {reportData.sectionBreakdown.map(section => {
            const config = SECTION_CONFIG[section.section]
            const IconComp = config.icon
            return (
              <div key={section.section} className="flex items-center gap-3">
                <IconComp className={`h-4 w-4 ${config.color} shrink-0`} />
                <span className="text-xs font-medium text-foreground w-20 capitalize">{section.section}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      section.accuracy >= 80 ? "bg-emerald-500" : section.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${section.accuracy}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono w-12 text-right">{section.accuracy}%</span>
                <span className="text-[10px] text-muted-foreground/60 w-8 text-right">{section.sessions}x</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
