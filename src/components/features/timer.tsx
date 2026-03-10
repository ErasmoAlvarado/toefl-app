"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface ExamTimerProps {
  initialSeconds: number
  onTimeUp?: () => void
  paused?: boolean
}

export function ExamTimer({ initialSeconds, onTimeUp, paused = false }: ExamTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (paused || secondsRemaining <= 0) return

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId)
          if (onTimeUp) onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [paused, secondsRemaining, onTimeUp])

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isLowTime = secondsRemaining < 60 // Less than 1 minute

  return (
    <div className={`flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-xl shadow-sm bg-card
      ${isLowTime ? 'text-destructive border-destructive' : 'text-foreground'}`}
    >
      <Clock className={`h-5 w-5 ${isLowTime ? 'animate-pulse' : ''}`} />
      <span>{formatTime(secondsRemaining)}</span>
    </div>
  )
}
