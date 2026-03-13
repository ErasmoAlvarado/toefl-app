"use client"

import { useMemo } from "react"
import { Lightbulb, ArrowRight, BookOpen, Headphones, Mic, PenTool } from "lucide-react"
import { AnalyticsData, SectionScore, SectionName } from "@/types/dashboard.types"

interface StudyPlanSuggestionProps {
  analyticsData: AnalyticsData | null
  sectionScores: SectionScore[] | null
  daysUntilExam: number | null
}

const SECTION_ICONS: Record<SectionName, typeof BookOpen> = {
  reading: BookOpen,
  listening: Headphones,
  speaking: Mic,
  writing: PenTool,
}

const SECTION_COLORS: Record<SectionName, string> = {
  reading: "text-blue-400 bg-blue-500/10",
  listening: "text-emerald-400 bg-emerald-500/10",
  speaking: "text-amber-400 bg-amber-500/10",
  writing: "text-purple-400 bg-purple-500/10",
}

interface StudySuggestion {
  section: SectionName
  taskType: string
  reason: string
  priority: "high" | "medium" | "low"
}

export function StudyPlanSuggestion({ analyticsData, sectionScores, daysUntilExam }: StudyPlanSuggestionProps) {
  const suggestions = useMemo<StudySuggestion[]>(() => {
    if (!sectionScores) return []

    const result: StudySuggestion[] = []

    // Find weakest sections
    const sorted = [...sectionScores].sort((a, b) => a.bandScore - b.bandScore)

    sorted.forEach((sec, idx) => {
      if (idx < 2 || sec.bandScore < 3) {
        result.push({
          section: sec.section,
          taskType: `${sec.section}_practice`,
          reason: sec.bandScore < 2
            ? `Band ${sec.bandScore} – needs significant improvement`
            : sec.bandScore < 4
            ? `Band ${sec.bandScore} – room to grow`
            : `Band ${sec.bandScore} – polish for top score`,
          priority: sec.bandScore < 2 ? "high" : sec.bandScore < 4 ? "medium" : "low",
        })
      }
    })

    // Add weak task types from analytics
    if (analyticsData) {
      const weakTasks = analyticsData.taskPerformance
        .filter(tp => tp.accuracy < 70 && tp.totalAttempts >= 3)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3)

      weakTasks.forEach(task => {
        // avoid duplicates
        if (!result.find(r => r.taskType === task.taskType)) {
          result.push({
            section: "writing", // default section
            taskType: task.taskType,
            reason: `${task.label} at ${task.accuracy}% accuracy – focus here`,
            priority: task.accuracy < 50 ? "high" : "medium",
          })
        }
      })
    }

    return result.slice(0, 5)
  }, [analyticsData, sectionScores])

  const priorityColors = {
    high: "border-l-red-400 bg-red-500/5",
    medium: "border-l-amber-400 bg-amber-500/5",
    low: "border-l-emerald-400 bg-emerald-500/5",
  }

  const priorityLabels = {
    high: "text-red-400 bg-red-500/15",
    medium: "text-amber-400 bg-amber-500/15",
    low: "text-emerald-400 bg-emerald-500/15",
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <h3 className="font-bold text-sm text-foreground">Study Plan</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {daysUntilExam
            ? `${daysUntilExam} days until exam – focus on weak areas`
            : "Based on your performance data"}
        </p>
      </div>

      <div className="p-4 space-y-2">
        {suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground/60 italic">
              Complete more practice sessions to get recommendations
            </p>
          </div>
        ) : (
          suggestions.map((suggestion, idx) => {
            const SectionIcon = SECTION_ICONS[suggestion.section]
            return (
              <div
                key={idx}
                className={`border-l-2 ${priorityColors[suggestion.priority]} rounded-lg p-3 flex items-center gap-3 transition-colors hover:bg-muted/20`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${SECTION_COLORS[suggestion.section]} shrink-0`}>
                  <SectionIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {suggestion.section.charAt(0).toUpperCase() + suggestion.section.slice(1)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{suggestion.reason}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${priorityLabels[suggestion.priority]} shrink-0`}>
                  {suggestion.priority}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
