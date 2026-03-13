// ─────────────────────────────────────────────────────────────
// Full Mock Test Types — TOEFL iBT 2026 Updated Format
// ─────────────────────────────────────────────────────────────

import { ToeflQuestion } from "./reading.types";
import { ListeningQuestion } from "./listening.types";

// ── MST (Multi-Stage Testing) Structures ──────────────────

/** IDs referencing items in the router / upper / lower pools */
export interface MSTStructure {
  router: string[];
  upper: string[];
  lower: string[];
}

// ── Section Timing (Approx. Base Time in seconds) ─────────

export const SECTION_TIME_SECONDS = {
  reading: 35 * 60,   // ~35 min
  listening: 36 * 60, // ~36 min
  writing: 29 * 60,   // ~29 min
  speaking: 16 * 60,  // ~16 min
} as const;

export type MockTestSection = "reading" | "listening" | "writing" | "speaking";

// ── Reading Section ───────────────────────────────────────

export interface MockReadingPassage {
  id: string;
  title: string;
  content: string;
  passageType: "academic" | "daily_life" | "complete_words";
  questions: ToeflQuestion[];
  isUnscored?: boolean;
}

export interface MockReadingModule {
  passages: MockReadingPassage[];
}

// ── Listening Section ─────────────────────────────────────

export interface MockListeningItem {
  id: string;
  type: "choose_response" | "conversation" | "announcement" | "academic_talk";
  title: string;
  transcript: string;
  audioPromptText?: string;
  questions: ListeningQuestion[];
  isUnscored?: boolean;
}

export interface MockListeningModule {
  items: MockListeningItem[];
}

// ── Writing Section ───────────────────────────────────────

export interface MockBuildSentenceItem {
  id: number;
  chunks: string[];
  correctSentence: string;
}

export interface MockEmailTask {
  context: string;
  instructions: string;
  recipientName: string;
  recipientRelation: string;
}

export interface MockAcademicDiscussionTask {
  professorPost: string;
  professorQuestion: string;
  studentPosts: { name: string; text: string }[];
}

export interface MockWritingSection {
  buildSentences: MockBuildSentenceItem[];
  email: MockEmailTask;
  academicDiscussion: MockAcademicDiscussionTask;
}

// ── Speaking Section ──────────────────────────────────────

export interface MockSpeakingSection {
  listenAndRepeat: string[];   // 7 sentences
  interviewQuestions: string[]; // 4 questions
}

// ── Full Mock Test Definition ─────────────────────────────

export interface FullMockTestData {
  id: string;
  title: string;
  createdAt: string;
  /** IDs of DB items used (for saving results) */
  contentIds: {
    readingIds: string[];
    listeningIds: string[];
    writingIds: string[];
    speakingIds: string[];
  };
  reading: {
    router: MockReadingModule;
    upper: MockReadingModule;
    lower: MockReadingModule;
  };
  listening: {
    router: MockListeningModule;
    upper: MockListeningModule;
    lower: MockListeningModule;
  };
  writing: MockWritingSection;
  speaking: MockSpeakingSection;
}

// ── Test Engine State ─────────────────────────────────────

export type MockTestPhase =
  | "landing"
  | "rules"
  | "system_check"
  | "ready"
  | "reading_router"
  | "reading_second"
  | "transition_reading_listening"
  | "listening_router"
  | "listening_second"
  | "transition_listening_writing"
  | "writing_build_sentence"
  | "writing_email"
  | "writing_academic_discussion"
  | "transition_writing_speaking"
  | "speaking_listen_repeat"
  | "speaking_interview"
  | "results"
  | "review";

export type MSTPath = "upper" | "lower";

export interface SectionScore {
  section: MockTestSection;
  rawScore: number;
  maxScore: number;
  scaledScore: number; // 0-30 band
  taskBreakdown: {
    taskType: string;
    score: number;
    maxScore: number;
  }[];
}

export interface MockTestAttemptResult {
  id: string;
  mockTestId: string;
  completedAt: string;
  totalScore: number; // 0-120
  readingPath: MSTPath;
  listeningPath: MSTPath;
  sectionScores: SectionScore[];
  recommendations: string[];
  /** Detailed per-item answers for review mode */
  readingAnswers: Record<string, string | string[]>;
  listeningAnswers: Record<string, string>;
  writingResponses: {
    buildSentence: { itemId: number; userOrder: string[]; isCorrect: boolean }[];
    emailText: string;
    discussionText: string;
  };
  speakingResponses: {
    listenRepeat: { prompt: string; transcript: string }[];
    interview: { question: string; transcript: string }[];
  };
}
