"use client"

import { useMemo } from "react"
import { AnalyticsData } from "@/types/dashboard.types"
import { BarChart3, TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface AnalyticsChartsProps {
  analyticsData: AnalyticsData | null
}

export function AnalyticsCharts({ analyticsData }: AnalyticsChartsProps) {
  const radarData = useMemo(() => {
    if (!analyticsData) return []
    return analyticsData.taskPerformance.map(tp => ({
      subject: tp.label.length > 14 ? tp.label.slice(0, 12) + "…" : tp.label,
      accuracy: tp.accuracy,
      fullMark: 100,
    }))
  }, [analyticsData])

  const trendData = useMemo(() => {
    if (!analyticsData) return []
    return analyticsData.weeklyTrend.map(w => ({
      week: w.week.slice(5), // MM-DD
      accuracy: w.accuracy,
      sessions: w.sessions,
    }))
  }, [analyticsData])

  if (!analyticsData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-60 w-full bg-muted/50 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Performance Radar */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <h3 className="font-bold text-sm text-foreground">Performance by Task Type</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Accuracy % across all task types</p>
        </div>

        <div className="p-4">
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Radar
                  name="Accuracy"
                  dataKey="accuracy"
                  stroke="hsl(270, 80%, 65%)"
                  fill="hsl(270, 80%, 65%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60">
              <p className="text-sm text-muted-foreground/60 italic">No task data yet. Start practicing!</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-foreground">Weekly Accuracy Trend</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Your performance over the last 12 weeks</p>
        </div>

        <div className="p-4">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 80%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 80%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(160, 80%, 55%)"
                  fill="url(#accuracyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52">
              <p className="text-sm text-muted-foreground/60 italic">Not enough data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Type Heatmap Table */}
      {analyticsData.taskPerformance.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-bold text-sm text-foreground">Task Heatmap</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Task</th>
                  <th className="text-center pb-2 font-medium">Attempts</th>
                  <th className="text-center pb-2 font-medium">Accuracy</th>
                  <th className="text-center pb-2 font-medium">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {analyticsData.taskPerformance
                  .sort((a, b) => a.accuracy - b.accuracy) // weakest first
                  .map(tp => (
                    <tr key={tp.taskType} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 font-medium text-foreground">{tp.label}</td>
                      <td className="py-2 text-center text-muted-foreground">{tp.totalAttempts}</td>
                      <td className="py-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tp.accuracy >= 80
                              ? "bg-emerald-500/20 text-emerald-400"
                              : tp.accuracy >= 60
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {tp.accuracy}%
                        </span>
                      </td>
                      <td className="py-2 text-center text-muted-foreground">
                        {tp.avgTimeSeconds > 60
                          ? `${Math.round(tp.avgTimeSeconds / 60)}m`
                          : `${tp.avgTimeSeconds}s`}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
