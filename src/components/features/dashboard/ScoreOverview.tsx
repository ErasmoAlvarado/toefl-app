"use client"

import { OverallScore, SectionName, BAND_TO_SECTION_30 } from "@/types/dashboard.types"
import { BookOpen, Headphones, Mic, PenTool, TrendingUp, Award } from "lucide-react"

interface ScoreOverviewProps {
  scoreData: OverallScore | null
}

const SECTION_CONFIG: Record<SectionName, { label: string; icon: typeof BookOpen; gradient: string; color: string }> = {
  reading: { label: "Reading", icon: BookOpen, gradient: "from-blue-500 to-indigo-600", color: "text-blue-400" },
  listening: { label: "Listening", icon: Headphones, gradient: "from-emerald-500 to-teal-600", color: "text-emerald-400" },
  speaking: { label: "Speaking", icon: Mic, gradient: "from-amber-500 to-orange-600", color: "text-amber-400" },
  writing: { label: "Writing", icon: PenTool, gradient: "from-purple-500 to-fuchsia-600", color: "text-purple-400" },
}

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-red-500/20 text-red-400 border-red-500/30",
  A2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  B1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  B2: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  C1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  C2: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
}

/** Band progress bar – fills to 6 max */
function BandProgressBar({ band, gradient }: { band: number; gradient: string }) {
  const percent = (band / 6) * 100
  return (
    <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function ScoreOverview({ scoreData }: ScoreOverviewProps) {
  if (!scoreData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-20 w-full bg-muted/50 rounded" />
      </div>
    )
  }

  const equivalent30 = (band: number) => BAND_TO_SECTION_30[band] ?? 0

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header with overall score */}
      <div className="relative p-6 pb-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Overall Score</h3>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black tracking-tight text-foreground">
                {scoreData.bandScore}
              </span>
              <span className="text-lg text-muted-foreground font-medium">/ 6</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {scoreData.equivalentTotal120} / 120
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${CEFR_COLORS[scoreData.cefr]}`}>
              {scoreData.cefr}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">CEFR Level</span>
          </div>
        </div>
      </div>

      {/* Per-section scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/50">
        {scoreData.sections.map(sectionScore => {
          const config = SECTION_CONFIG[sectionScore.section]
          const IconComponent = config.icon
          return (
            <div key={sectionScore.section} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className={`text-2xl font-black ${config.color}`}>
                  {sectionScore.bandScore}
                </span>
                <span className="text-xs text-muted-foreground">
                  ≈{equivalent30(sectionScore.bandScore)}/30
                </span>
              </div>
              <BandProgressBar band={sectionScore.bandScore} gradient={config.gradient} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {sectionScore.totalAttempts} attempts
                </span>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {sectionScore.rawPercent}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
