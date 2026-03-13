/**
 * Dashboard-specific types for the gamified TOEFL iBT progress system.
 */

/** Band score on the 1-6 scale (0.5 steps) */
export type BandScore = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5 | 5.5 | 6

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export type SectionName = "reading" | "listening" | "speaking" | "writing"

export interface SectionScore {
  section: SectionName
  bandScore: BandScore
  rawPercent: number
  totalAttempts: number
  correctAttempts: number
}

export interface OverallScore {
  bandScore: BandScore
  cefr: CEFRLevel
  equivalentTotal120: number
  sections: SectionScore[]
}

/** Mapping from band score to 0-30 per section equivalent */
export const BAND_TO_SECTION_30: Record<number, number> = {
  0: 0,
  0.5: 2,
  1: 5,
  1.5: 7,
  2: 10,
  2.5: 13,
  3: 15,
  3.5: 18,
  4: 20,
  4.5: 23,
  5: 25,
  5.5: 28,
  6: 30,
}

/** Mapping from band score to CEFR */
export function bandToCEFR(band: number): CEFRLevel {
  if (band <= 1) return "A1"
  if (band <= 2) return "A2"
  if (band <= 3) return "B1"
  if (band <= 4) return "B2"
  if (band <= 5) return "C1"
  return "C2"
}

/** Round to nearest 0.5 */
export function roundToHalf(num: number): BandScore {
  const rounded = Math.round(num * 2) / 2
  return Math.min(6, Math.max(0, rounded)) as BandScore
}

/** Convert overall band (avg of 4 sections) to 0-120 equivalent */
export function bandToTotal120(band: number): number {
  const perSection = BAND_TO_SECTION_30[roundToHalf(band)] ?? 0
  return perSection * 4
}

/* ─── Streak ─── */
export interface StreakData {
  currentStreak: number
  longestStreak: number
  /** Map of date string (YYYY-MM-DD) to activity count */
  activityMap: Record<string, number>
  totalActiveDays: number
}

/* ─── Daily Goals ─── */
export interface TaskGoal {
  taskType: string
  label: string
  target: number
  progress: number
}

export interface DailyGoalsData {
  date: string
  goals: TaskGoal[]
  xpEarned: number
  isComplete: boolean
}

/* ─── Achievements ─── */
export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: "streak" | "mastery" | "speed" | "milestone" | "hidden"
  requirement: number
  xpReward: number
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: string
}

/* ─── Weekly Report ─── */
export interface WeeklyReportData {
  totalSessions: number
  totalTimeMinutes: number
  averageAccuracy: number
  sectionBreakdown: {
    section: SectionName
    sessions: number
    accuracy: number
  }[]
  xpEarned: number
  streakMaintained: boolean
}

/* ─── Analytics ─── */
export interface TaskTypePerformance {
  taskType: string
  label: string
  totalAttempts: number
  accuracy: number
  avgTimeSeconds: number
}

export interface AnalyticsData {
  taskPerformance: TaskTypePerformance[]
  commonErrors: {
    category: string
    errors: { label: string; count: number }[]
  }[]
  weeklyTrend: {
    week: string
    accuracy: number
    sessions: number
  }[]
}

/* ─── MST Adaptive Insights ─── */
export interface MSTInsight {
  section: "reading" | "listening"
  routerAccuracy: number
  upperModuleAccuracy: number
  lowerModuleAccuracy: number
  routerWon: boolean
  earlyStageAccuracy: number
}
