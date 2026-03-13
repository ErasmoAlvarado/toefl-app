import { AchievementDefinition } from "@/types/dashboard.types"

/**
 * Master list of all 24 achievements in the gamification system.
 * Icons are Lucide icon names used by the AchievementSystem component.
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ─── Streak Category ───
  { id: "streak_3", title: "Getting Started", description: "Maintain a 3-day study streak", icon: "flame", category: "streak", requirement: 3, xpReward: 50 },
  { id: "streak_7", title: "Week Warrior", description: "7-day study streak", icon: "flame", category: "streak", requirement: 7, xpReward: 100 },
  { id: "streak_14", title: "Fortnight Focus", description: "14-day study streak", icon: "flame", category: "streak", requirement: 14, xpReward: 200 },
  { id: "streak_30", title: "Streak Master", description: "30-day study streak", icon: "flame", category: "streak", requirement: 30, xpReward: 500 },
  { id: "streak_60", title: "Iron Will", description: "60-day study streak", icon: "flame", category: "streak", requirement: 60, xpReward: 1000 },
  { id: "streak_100", title: "Legendary Streak", description: "100-day study streak!", icon: "crown", category: "streak", requirement: 100, xpReward: 2000 },

  // ─── Mastery Category ───
  { id: "reading_band_4", title: "Reader Rising", description: "Reach Band 4 in Reading", icon: "book-open", category: "mastery", requirement: 4, xpReward: 300 },
  { id: "listening_band_4", title: "Sharp Ears", description: "Reach Band 4 in Listening", icon: "headphones", category: "mastery", requirement: 4, xpReward: 300 },
  { id: "speaking_band_4", title: "Voice Found", description: "Reach Band 4 in Speaking", icon: "mic", category: "mastery", requirement: 4, xpReward: 300 },
  { id: "writing_band_4", title: "Pen Master", description: "Reach Band 4 in Writing", icon: "pen-tool", category: "mastery", requirement: 4, xpReward: 300 },
  { id: "overall_band_5", title: "TOEFL Elite", description: "Reach Overall Band 5", icon: "trophy", category: "mastery", requirement: 5, xpReward: 1000 },
  { id: "router_conqueror", title: "Router Conqueror", description: "Win the MST router in Reading or Listening", icon: "git-branch", category: "mastery", requirement: 1, xpReward: 500 },

  // ─── Speed Category ───
  { id: "speed_reading", title: "Speed Reader", description: "Complete a reading passage under 15 minutes", icon: "zap", category: "speed", requirement: 1, xpReward: 150 },
  { id: "speed_listening", title: "Quick Listen", description: "Perfect score on a listening set", icon: "zap", category: "speed", requirement: 1, xpReward: 150 },
  { id: "email_perfect", title: "Email Pro", description: "Score Band 5+ on an email task", icon: "mail", category: "speed", requirement: 1, xpReward: 200 },
  { id: "interview_ace", title: "Interview Ace", description: "Score Band 5+ on an interview exercise", icon: "mic", category: "speed", requirement: 1, xpReward: 200 },

  // ─── Milestone Category ───
  { id: "first_session", title: "First Steps", description: "Complete your first practice session", icon: "footprints", category: "milestone", requirement: 1, xpReward: 25 },
  { id: "sessions_10", title: "Warmup Done", description: "Complete 10 practice sessions", icon: "target", category: "milestone", requirement: 10, xpReward: 100 },
  { id: "sessions_50", title: "Halfway Hero", description: "Complete 50 practice sessions", icon: "medal", category: "milestone", requirement: 50, xpReward: 300 },
  { id: "sessions_100", title: "Century Club", description: "Complete 100 practice sessions", icon: "award", category: "milestone", requirement: 100, xpReward: 500 },
  { id: "sessions_250", title: "TOEFL Veteran", description: "Complete 250 practice sessions", icon: "star", category: "milestone", requirement: 250, xpReward: 1000 },
  { id: "mock_test_1", title: "Test Taker", description: "Complete your first full mock test", icon: "clipboard-check", category: "milestone", requirement: 1, xpReward: 200 },

  // ─── Hidden Category ───
  { id: "midnight_owl", title: "Midnight Owl", description: "Study after midnight 🦉", icon: "moon", category: "hidden", requirement: 1, xpReward: 100 },
  { id: "perfect_day", title: "Perfect Day", description: "Complete all daily goals in one day", icon: "sparkles", category: "hidden", requirement: 1, xpReward: 250 },
]

/** Helper to get achievement definition by ID */
export function getAchievementById(achievementId: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === achievementId)
}

/** Default daily goals template */
export const DEFAULT_DAILY_GOALS: Record<string, { label: string; target: number }> = {
  "reading_passage": { label: "Reading Passages", target: 1 },
  "listening_lecture": { label: "Listening Lectures", target: 1 },
  "build_sentence": { label: "Build-a-Sentence", target: 2 },
  "email": { label: "Email Writing", target: 1 },
  "listen_and_repeat": { label: "Listen & Repeat", target: 2 },
  "interview": { label: "Interview Speaking", target: 1 },
  "vocabulary_review": { label: "Vocabulary Review", target: 5 },
}
