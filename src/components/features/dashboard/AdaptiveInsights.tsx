"use client"

import { MSTInsight } from "@/types/dashboard.types"
import { GitBranch, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from "lucide-react"

interface AdaptiveInsightsProps {
  insights: MSTInsight[]
}

export function AdaptiveInsights({ insights }: AdaptiveInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="h-4 w-4 text-muted-foreground/40" />
          <h3 className="font-bold text-sm text-muted-foreground">Adaptive (MST) Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 italic">
          Complete mock tests to see your adaptive performance data
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-foreground">Adaptive (MST) Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Win the router → get routed to the upper module → higher score ceiling
        </p>
      </div>

      <div className="divide-y divide-border/30">
        {insights.map(insight => (
          <div key={insight.section} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground capitalize">{insight.section}</span>
              {insight.routerWon ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400">Router Won</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30">
                  <XCircle className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400">Router Lost</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Router</div>
                <div className="text-lg font-black text-cyan-400">{insight.routerAccuracy}%</div>
                <div className="text-[10px] text-muted-foreground">Early Stage</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-0.5">
                  Upper <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="text-lg font-black text-emerald-400">{insight.upperModuleAccuracy}%</div>
                <div className="text-[10px] text-muted-foreground">Harder Qs</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-0.5">
                  Lower <ArrowDownRight className="h-3 w-3 text-amber-400" />
                </div>
                <div className="text-lg font-black text-amber-400">{insight.lowerModuleAccuracy}%</div>
                <div className="text-[10px] text-muted-foreground">Easier Qs</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
