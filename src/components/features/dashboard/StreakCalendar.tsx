"use client"

import { useMemo } from "react"
import { StreakData } from "@/types/dashboard.types"
import { Flame, Calendar, Trophy } from "lucide-react"
import {
  eachDayOfInterval,
  subDays,
  format,
  startOfWeek,
  getDay,
} from "date-fns"

interface StreakCalendarProps {
  streakData: StreakData | null
}

const INTENSITY_CLASSES = [
  "bg-muted/30",           // 0 sessions
  "bg-emerald-500/20",     // 1
  "bg-emerald-500/40",     // 2
  "bg-emerald-500/60",     // 3
  "bg-emerald-500/80",     // 4+
]

function getIntensity(count: number): string {
  if (count === 0) return INTENSITY_CLASSES[0]
  if (count === 1) return INTENSITY_CLASSES[1]
  if (count === 2) return INTENSITY_CLASSES[2]
  if (count === 3) return INTENSITY_CLASSES[3]
  return INTENSITY_CLASSES[4]
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]

export function StreakCalendar({ streakData }: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, 364)
    // Align to start of the week (Sunday)
    const alignedStart = startOfWeek(startDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: alignedStart, end: today })

    // Group by week
    const weeks: { date: Date; count: number; dayOfWeek: number }[][] = []
    let currentWeek: { date: Date; count: number; dayOfWeek: number }[] = []

    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd")
      const count = streakData?.activityMap[key] ?? 0
      const dow = getDay(day)

      if (dow === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push({ date: day, count, dayOfWeek: dow })
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return weeks
  }, [streakData])

  // Extract month labels for header
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = []
    let lastMonth = -1
    calendarData.forEach((week, weekIdx) => {
      const firstDay = week[0]
      const month = firstDay.date.getMonth()
      if (month !== lastMonth) {
        positions.push({ label: MONTH_LABELS[month], col: weekIdx })
        lastMonth = month
      }
    })
    return positions
  }, [calendarData])

  if (!streakData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="h-32 w-full bg-muted/50 rounded" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-foreground">Study Activity</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{streakData.currentStreak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{streakData.longestStreak}</span>
              <span className="text-xs text-muted-foreground">best</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        {/* Month labels */}
        <div className="flex gap-0 ml-8 mb-1">
          {monthPositions.map((mp, idx) => (
            <span
              key={idx}
              className="text-[10px] text-muted-foreground"
              style={{
                position: "relative",
                left: `${mp.col * 14}px`,
                marginLeft: idx === 0 ? 0 : -((monthPositions[idx - 1]?.col ?? 0) * 14 + (monthPositions[idx - 1]?.label.length ?? 0) * 6),
              }}
            >
              {mp.label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((label, idx) => (
              <div key={idx} className="h-[12px] w-6 flex items-center">
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {calendarData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayData = week.find(d => d.dayOfWeek === dayIdx)
                if (!dayData) {
                  return <div key={dayIdx} className="h-[12px] w-[12px]" />
                }
                return (
                  <div
                    key={dayIdx}
                    className={`h-[12px] w-[12px] rounded-[2px] ${getIntensity(dayData.count)} transition-colors hover:ring-1 hover:ring-foreground/20 cursor-default`}
                    title={`${format(dayData.date, "MMM d, yyyy")}: ${dayData.count} session${dayData.count !== 1 ? "s" : ""}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-muted-foreground">
            {streakData.totalActiveDays} active days in the last year
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-1">Less</span>
            {INTENSITY_CLASSES.map((cls, idx) => (
              <div key={idx} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
