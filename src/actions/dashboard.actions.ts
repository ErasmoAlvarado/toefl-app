"use server"

import { createClient } from "@/lib/supabase/server"
import {
  OverallScore,
  SectionScore,
  SectionName,
  StreakData,
  DailyGoalsData,
  TaskGoal,
  WeeklyReportData,
  AnalyticsData,
  TaskTypePerformance,
  MSTInsight,
  UserAchievement,
  roundToHalf,
  bandToCEFR,
  bandToTotal120,
} from "@/types/dashboard.types"
import { DEFAULT_DAILY_GOALS } from "@/utils/achievements"

/* ─── Score Overview ─── */
export async function fetchScoreOverview(): Promise<{ success: boolean; data?: OverallScore; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const sections: SectionName[] = ["reading", "listening", "speaking", "writing"]
    const sectionScores: SectionScore[] = []

    for (const section of sections) {
      const { data: sessions } = await supabase
        .from("practice_sessions")
        .select("score, max_score")
        .eq("user_id", user.id)
        .eq("section", section)
        .not("score", "is", null)

      const totalAttempts = sessions?.length ?? 0
      let rawPercent = 0
      let correctAttempts = 0

      if (sessions && sessions.length > 0) {
        const totalScore = sessions.reduce((sum, s) => sum + (s.score ?? 0), 0)
        const totalMax = sessions.reduce((sum, s) => sum + (s.max_score ?? 1), 0)
        rawPercent = totalMax > 0 ? (totalScore / totalMax) * 100 : 0
        correctAttempts = sessions.filter(s => (s.score ?? 0) / (s.max_score ?? 1) >= 0.5).length
      }

      // Map percentage to 1-6 band: 0%=0, 100%=6
      const bandScore = roundToHalf((rawPercent / 100) * 6)

      sectionScores.push({
        section,
        bandScore,
        rawPercent: Math.round(rawPercent * 10) / 10,
        totalAttempts,
        correctAttempts,
      })
    }

    const avgBand = sectionScores.reduce((sum, s) => sum + s.bandScore, 0) / 4
    const overallBand = roundToHalf(avgBand)

    return {
      success: true,
      data: {
        bandScore: overallBand,
        cefr: bandToCEFR(overallBand),
        equivalentTotal120: bandToTotal120(overallBand),
        sections: sectionScores,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── Streak Data ─── */
export async function fetchStreakData(): Promise<{ success: boolean; data?: StreakData; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // Get all completed sessions in last 365 days
    const yearAgo = new Date()
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)

    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .gte("completed_at", yearAgo.toISOString())
      .order("completed_at", { ascending: true })

    const activityMap: Record<string, number> = {}

    sessions?.forEach(session => {
      if (session.completed_at) {
        const dateKey = session.completed_at.split("T")[0]
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 1
      }
    })

    // Calculate current streak
    const activeDates = Object.keys(activityMap).sort().reverse()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    // Current streak from today/yesterday backward
    if (activityMap[today] || activityMap[yesterday]) {
      const startDate = activityMap[today] ? new Date() : new Date(Date.now() - 86400000)
      const checkDate = new Date(startDate)
      while (true) {
        const key = checkDate.toISOString().split("T")[0]
        if (activityMap[key]) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Longest streak
    const sortedDates = Object.keys(activityMap).sort()
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(sortedDates[i])
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
        tempStreak = diffDays === 1 ? tempStreak + 1 : 1
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return {
      success: true,
      data: {
        currentStreak,
        longestStreak,
        activityMap,
        totalActiveDays: Object.keys(activityMap).length,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── Daily Goals ─── */
export async function fetchDailyGoals(): Promise<{ success: boolean; data?: DailyGoalsData; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const today = new Date().toISOString().split("T")[0]

    const { data: goalRow } = await supabase
      .from("daily_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    const tasksTarget = (goalRow?.tasks_target as Record<string, number>) ?? {}
    const tasksProgress = (goalRow?.tasks_progress as Record<string, number>) ?? {}

    // Build goals list from target or defaults
    const targetToUse = Object.keys(tasksTarget).length > 0 ? tasksTarget : 
      Object.fromEntries(Object.entries(DEFAULT_DAILY_GOALS).map(([k, v]) => [k, v.target]))

    const goals: TaskGoal[] = Object.entries(targetToUse).map(([taskType, target]) => ({
      taskType,
      label: DEFAULT_DAILY_GOALS[taskType]?.label ?? taskType,
      target: target as number,
      progress: (tasksProgress[taskType] as number) ?? 0,
    }))

    const isComplete = goals.every(g => g.progress >= g.target)

    return {
      success: true,
      data: {
        date: today,
        goals,
        xpEarned: (goalRow?.xp_earned as number) ?? 0,
        isComplete,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── User Achievements ─── */
export async function fetchUserAchievements(): Promise<{ success: boolean; data?: UserAchievement[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data, error } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id)

    if (error) throw error

    return {
      success: true,
      data: (data ?? []).map(row => ({
        achievementId: row.achievement_id,
        unlockedAt: row.unlocked_at ?? "",
      })),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── Weekly Report ─── */
export async function fetchWeeklyReport(): Promise<{ success: boolean; data?: WeeklyReportData; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("section, score, max_score, time_spent, completed_at")
      .eq("user_id", user.id)
      .gte("completed_at", weekAgo.toISOString())

    const totalSessions = sessions?.length ?? 0
    const totalTimeMinutes = Math.round((sessions?.reduce((sum, s) => sum + (s.time_spent ?? 0), 0) ?? 0) / 60)

    const sectionsMap: Record<string, { sessions: number; totalScore: number; totalMax: number }> = {}
    const allSections: SectionName[] = ["reading", "listening", "speaking", "writing"]

    allSections.forEach(sec => {
      sectionsMap[sec] = { sessions: 0, totalScore: 0, totalMax: 0 }
    })

    sessions?.forEach(s => {
      const sec = s.section as SectionName
      if (sectionsMap[sec]) {
        sectionsMap[sec].sessions++
        sectionsMap[sec].totalScore += s.score ?? 0
        sectionsMap[sec].totalMax += s.max_score ?? 1
      }
    })

    const sectionBreakdown = allSections.map(sec => ({
      section: sec,
      sessions: sectionsMap[sec].sessions,
      accuracy: sectionsMap[sec].totalMax > 0
        ? Math.round((sectionsMap[sec].totalScore / sectionsMap[sec].totalMax) * 100)
        : 0,
    }))

    const totalScore = Object.values(sectionsMap).reduce((s, v) => s + v.totalScore, 0)
    const totalMax = Object.values(sectionsMap).reduce((s, v) => s + v.totalMax, 0)
    const averageAccuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

    return {
      success: true,
      data: {
        totalSessions,
        totalTimeMinutes,
        averageAccuracy,
        sectionBreakdown,
        xpEarned: totalSessions * 10,
        streakMaintained: totalSessions > 0,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── Analytics ─── */
export async function fetchAnalyticsData(): Promise<{ success: boolean; data?: AnalyticsData; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // Get question attempts for task type breakdown
    const { data: attempts } = await supabase
      .from("user_question_attempts")
      .select("question_type, is_correct, time_spent_seconds, attempted_at")
      .eq("user_id", user.id)

    const typeMap: Record<string, { correct: number; total: number; totalTime: number }> = {}

    attempts?.forEach(a => {
      const qt = a.question_type
      if (!typeMap[qt]) typeMap[qt] = { correct: 0, total: 0, totalTime: 0 }
      typeMap[qt].total++
      if (a.is_correct) typeMap[qt].correct++
      typeMap[qt].totalTime += a.time_spent_seconds ?? 0
    })

    const taskPerformance: TaskTypePerformance[] = Object.entries(typeMap).map(([taskType, stats]) => ({
      taskType,
      label: taskType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      totalAttempts: stats.total,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      avgTimeSeconds: stats.total > 0 ? Math.round(stats.totalTime / stats.total) : 0,
    }))

    // Weekly trends from sessions
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("score, max_score, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: true })

    const weeklyMap: Record<string, { totalScore: number; totalMax: number; count: number }> = {}

    sessions?.forEach(s => {
      if (s.completed_at) {
        const date = new Date(s.completed_at)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split("T")[0]
        if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { totalScore: 0, totalMax: 0, count: 0 }
        weeklyMap[weekKey].totalScore += s.score ?? 0
        weeklyMap[weekKey].totalMax += s.max_score ?? 1
        weeklyMap[weekKey].count++
      }
    })

    const weeklyTrend = Object.entries(weeklyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // last 12 weeks
      .map(([week, s]) => ({
        week,
        accuracy: s.totalMax > 0 ? Math.round((s.totalScore / s.totalMax) * 100) : 0,
        sessions: s.count,
      }))

    return {
      success: true,
      data: {
        taskPerformance,
        commonErrors: [], // Populated by specific analysis later
        weeklyTrend,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}

/* ─── Profile (exam date, XP, etc.) ─── */
export async function fetchDashboardProfile(): Promise<{
  success: boolean
  data?: {
    fullName: string
    examDate: string | null
    totalXp: number
    streakDays: number
    targetScore: number | null
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, exam_date, total_xp, streak_days, target_score")
      .eq("id", user.id)
      .single()

    if (error) throw error

    return {
      success: true,
      data: {
        fullName: profile?.full_name ?? "Student",
        examDate: profile?.exam_date ?? null,
        totalXp: profile?.total_xp ?? 0,
        streakDays: profile?.streak_days ?? 0,
        targetScore: profile?.target_score ?? null,
      },
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}
