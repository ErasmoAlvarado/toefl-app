"use client"

import { useMemo } from "react"
import { Timer, CalendarClock } from "lucide-react"
import { differenceInDays, format } from "date-fns"

interface ExamCountdownProps {
  examDate: string | null
}

export function ExamCountdown({ examDate }: ExamCountdownProps) {
  const countdownInfo = useMemo(() => {
    if (!examDate) return null
    const exam = new Date(examDate)
    const today = new Date()
    const daysLeft = differenceInDays(exam, today)
    const weeksLeft = Math.floor(daysLeft / 7)
    const formattedDate = format(exam, "MMMM d, yyyy")
    return { daysLeft, weeksLeft, formattedDate, isPast: daysLeft < 0 }
  }, [examDate])

  if (!countdownInfo) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-5 flex items-center gap-3">
        <CalendarClock className="h-5 w-5 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No exam date set</p>
          <p className="text-xs text-muted-foreground/60">Set your exam date in profile settings</p>
        </div>
      </div>
    )
  }

  const urgencyColor = countdownInfo.daysLeft <= 30
    ? "from-red-500/15 to-orange-500/15 border-red-500/20"
    : countdownInfo.daysLeft <= 90
    ? "from-amber-500/15 to-yellow-500/15 border-amber-500/20"
    : "from-emerald-500/15 to-teal-500/15 border-emerald-500/20"

  const numberColor = countdownInfo.daysLeft <= 30
    ? "text-red-400"
    : countdownInfo.daysLeft <= 90
    ? "text-amber-400"
    : "text-emerald-400"

  if (countdownInfo.isPast) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-bold text-sm text-muted-foreground">Exam Day</h3>
        </div>
        <p className="text-sm text-muted-foreground">Your exam date has passed. Update it in settings!</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${urgencyColor} p-5 shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-bold text-sm text-foreground">Exam Countdown</h3>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black tracking-tight ${numberColor}`}>
          {countdownInfo.daysLeft}
        </span>
        <span className="text-sm text-muted-foreground font-medium">
          days left
        </span>
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>{countdownInfo.weeksLeft} weeks</span>
        <span>•</span>
        <span>{countdownInfo.formattedDate}</span>
      </div>
    </div>
  )
}
