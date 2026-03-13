"use client"

import { useState, useEffect } from "react"
import { differenceInDays } from "date-fns"
import Link from "next/link"
import { Zap, TrendingUp, BookOpen, Headphones, Mic, PenTool, Sparkles } from "lucide-react"

import { ScoreOverview } from "./ScoreOverview"
import { StreakCalendar } from "./StreakCalendar"
import { DailyGoals } from "./DailyGoals"
import { AnalyticsCharts } from "./AnalyticsCharts"
import { ExamCountdown } from "./ExamCountdown"
import { StudyPlanSuggestion } from "./StudyPlanSuggestion"
import { AchievementSystem } from "./AchievementSystem"
import { WeeklyReport } from "./WeeklyReport"
import { AdaptiveInsights } from "./AdaptiveInsights"

import type {
  OverallScore,
  StreakData,
  DailyGoalsData,
  AnalyticsData,
  WeeklyReportData,
  UserAchievement,
  MSTInsight,
} from "@/types/dashboard.types"

import {
  fetchScoreOverview,
  fetchStreakData,
  fetchDailyGoals,
  fetchAnalyticsData,
  fetchWeeklyReport,
  fetchUserAchievements,
  fetchDashboardProfile,
} from "@/actions/dashboard.actions"

interface DashboardState {
  profileName: string
  examDate: string | null
  totalXp: number
  scoreData: OverallScore | null
  streakData: StreakData | null
  goalsData: DailyGoalsData | null
  analyticsData: AnalyticsData | null
  weeklyReport: WeeklyReportData | null
  achievements: UserAchievement[]
  mstInsights: MSTInsight[]
  isLoading: boolean
}

const MODULES = [
  { title: "Reading", icon: BookOpen, href: "/dashboard/reading", gradient: "from-blue-500 to-indigo-600", bgGlow: "from-blue-500/15 to-indigo-500/15", border: "border-blue-500/20" },
  { title: "Listening", icon: Headphones, href: "/dashboard/listening", gradient: "from-emerald-500 to-teal-600", bgGlow: "from-emerald-500/15 to-teal-500/15", border: "border-emerald-500/20" },
  { title: "Speaking", icon: Mic, href: "/dashboard/speaking", gradient: "from-amber-500 to-orange-600", bgGlow: "from-amber-500/15 to-orange-500/15", border: "border-amber-500/20" },
  { title: "Writing", icon: PenTool, href: "/dashboard/writing", gradient: "from-purple-500 to-fuchsia-600", bgGlow: "from-purple-500/15 to-fuchsia-500/15", border: "border-purple-500/20" },
]

export function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    profileName: "Student",
    examDate: null,
    totalXp: 0,
    scoreData: null,
    streakData: null,
    goalsData: null,
    analyticsData: null,
    weeklyReport: null,
    achievements: [],
    mstInsights: [],
    isLoading: true,
  })

  useEffect(() => {
    async function loadDashboard() {
      const [profileResult, scoreResult, streakResult, goalsResult, analyticsResult, weeklyResult, achievementsResult] =
        await Promise.all([
          fetchDashboardProfile(),
          fetchScoreOverview(),
          fetchStreakData(),
          fetchDailyGoals(),
          fetchAnalyticsData(),
          fetchWeeklyReport(),
          fetchUserAchievements(),
        ])

      setState({
        profileName: profileResult.data?.fullName ?? "Student",
        examDate: profileResult.data?.examDate ?? null,
        totalXp: profileResult.data?.totalXp ?? 0,
        scoreData: scoreResult.data ?? null,
        streakData: streakResult.data ?? null,
        goalsData: goalsResult.data ?? null,
        analyticsData: analyticsResult.data ?? null,
        weeklyReport: weeklyResult.data ?? null,
        achievements: achievementsResult.data ?? [],
        mstInsights: [], // MST data comes from mock_test_attempts analysis
        isLoading: false,
      })
    }

    loadDashboard()
  }, [])

  const daysUntilExam = state.examDate
    ? differenceInDays(new Date(state.examDate), new Date())
    : null

  const firstName = state.profileName.split(" ")[0]

  // Get current hour for greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-8 pb-16">
      {/* ─── Hero Greeting ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
            Here&apos;s your TOEFL iBT progress. Let&apos;s keep that brain sweating! 🧠💦
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{state.totalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* ─── Full Mock Test CTA ─── */}
      <Link
        href="/dashboard/full-test"
        className="group relative block rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-[0.99] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/15 to-transparent rounded-bl-full" />
        <div className="relative flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              Full Mock Test
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Simulate the complete TOEFL iBT — 4 sections, adaptive MST, ~2 hours
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Start now
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* ─── Module Cards ─── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {MODULES.map(mod => {
          const sectionData = state.scoreData?.sections.find(s => s.section === mod.title.toLowerCase())
          return (
            <Link
              key={mod.title}
              href={mod.href}
              className={`group rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.bgGlow} p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shadow-sm`}>
                  <mod.icon className="h-5 w-5 text-white" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="tracking-tight text-sm font-semibold text-foreground">{mod.title}</h3>
              <div className="text-2xl sm:text-3xl font-black mt-1 text-foreground">
                {sectionData ? `${sectionData.bandScore}/6` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {sectionData ? `${sectionData.totalAttempts} sessions` : "Not started"}
              </p>
            </Link>
          )
        })}
      </div>

      {/* ─── Score Overview ─── */}
      <ScoreOverview scoreData={state.scoreData} />

      {/* ─── Streak + Countdown + Daily Goals Row ─── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreakCalendar streakData={state.streakData} />
        </div>
        <div className="space-y-4">
          <ExamCountdown examDate={state.examDate} />
          <DailyGoals goalsData={state.goalsData} />
        </div>
      </div>

      {/* ─── MST Insights + Weekly Report ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <AdaptiveInsights insights={state.mstInsights} />
        <WeeklyReport reportData={state.weeklyReport} />
      </div>

      {/* ─── Analytics + Study Plan ─── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AnalyticsCharts analyticsData={state.analyticsData} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <StudyPlanSuggestion
            analyticsData={state.analyticsData}
            sectionScores={state.scoreData?.sections ?? null}
            daysUntilExam={daysUntilExam}
          />
          <AchievementSystem userAchievements={state.achievements} />
        </div>
      </div>
    </div>
  )
}
