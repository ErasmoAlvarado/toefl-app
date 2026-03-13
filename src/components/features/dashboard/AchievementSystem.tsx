"use client"

import { useMemo } from "react"
import { UserAchievement } from "@/types/dashboard.types"
import { ACHIEVEMENTS, getAchievementById } from "@/utils/achievements"
import {
  Trophy,
  Flame,
  Zap,
  Target,
  EyeOff,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Crown,
  Medal,
  Award,
  Star,
  Moon,
  Sparkles,
  GitBranch,
  Footprints,
  Mail,
  ClipboardCheck,
} from "lucide-react"

interface AchievementSystemProps {
  userAchievements: UserAchievement[]
}

/** Map icon string names to Lucide components */
const ICON_MAP: Record<string, typeof Trophy> = {
  flame: Flame,
  crown: Crown,
  "book-open": BookOpen,
  headphones: Headphones,
  mic: Mic,
  "pen-tool": PenTool,
  trophy: Trophy,
  "git-branch": GitBranch,
  zap: Zap,
  mail: Mail,
  footprints: Footprints,
  target: Target,
  medal: Medal,
  award: Award,
  star: Star,
  "clipboard-check": ClipboardCheck,
  moon: Moon,
  sparkles: Sparkles,
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: typeof Trophy }> = {
  streak: { label: "Streak", color: "text-orange-400", icon: Flame },
  mastery: { label: "Mastery", color: "text-indigo-400", icon: Trophy },
  speed: { label: "Speed", color: "text-cyan-400", icon: Zap },
  milestone: { label: "Milestone", color: "text-amber-400", icon: Target },
  hidden: { label: "Hidden", color: "text-fuchsia-400", icon: EyeOff },
}

export function AchievementSystem({ userAchievements }: AchievementSystemProps) {
  const unlockedIds = useMemo(
    () => new Set(userAchievements.map(a => a.achievementId)),
    [userAchievements]
  )

  const categories = useMemo(() => {
    const grouped: Record<string, typeof ACHIEVEMENTS> = {}
    ACHIEVEMENTS.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = []
      grouped[a.category].push(a)
    })
    return grouped
  }, [])

  const totalUnlocked = userAchievements.length
  const totalAchievements = ACHIEVEMENTS.length
  const progressPercent = Math.round((totalUnlocked / totalAchievements) * 100)

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-sm text-foreground">Achievements</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalUnlocked}/{totalAchievements} unlocked
          </span>
        </div>

        {/* Overall progress */}
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto">
        {Object.entries(categories).map(([category, achievements]) => {
          const catConfig = CATEGORY_LABELS[category]
          return (
            <div key={category}>
              <div className="flex items-center gap-1.5 mb-2">
                <catConfig.icon className={`h-3.5 w-3.5 ${catConfig.color}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${catConfig.color}`}>
                  {catConfig.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {achievements.map(achievement => {
                  const isUnlocked = unlockedIds.has(achievement.id)
                  const IconComponent = ICON_MAP[achievement.icon] ?? Star
                  const isHidden = achievement.category === "hidden" && !isUnlocked

                  return (
                    <div
                      key={achievement.id}
                      className={`relative rounded-xl p-3 transition-all ${
                        isUnlocked
                          ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-sm"
                          : "bg-muted/10 border border-border/30 opacity-50 grayscale"
                      }`}
                      title={isHidden ? "???" : `${achievement.title}: ${achievement.description}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className={`h-5 w-5 shrink-0 ${isUnlocked ? "text-amber-400" : "text-muted-foreground/40"}`} />
                        <span className={`text-xs font-bold truncate ${isUnlocked ? "text-foreground" : "text-muted-foreground/60"}`}>
                          {isHidden ? "???" : achievement.title}
                        </span>
                      </div>
                      <p className={`text-[10px] line-clamp-2 ${isUnlocked ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                        {isHidden ? "Keep exploring to discover this!" : achievement.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5 text-amber-400/60" />
                        <span className="text-[9px] text-amber-400/60 font-mono">+{achievement.xpReward} XP</span>
                      </div>

                      {isUnlocked && (
                        <div className="absolute top-1.5 right-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
