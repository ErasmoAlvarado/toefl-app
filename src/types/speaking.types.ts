// ─────────────────────────────────────────────────────────────
// Speaking Module Types — TOEFL iBT 2026 Updated Format
// ─────────────────────────────────────────────────────────────

/** Result shape returned by Gemini for Listen & Repeat evaluation */
export interface ListenRepeatEvaluation {
  score_0_5: number;
  rationale: string;
  word_level_diff: {
    missing: string[];
    substitutions: string[];
    extra: string[];
  };
  intelligibility_notes: string;
  "3_drills_to_improve": string[];
}

/** Per-question result for Interview evaluation */
export interface InterviewQuestionEval {
  q: string;
  score_0_5: number;
  strengths: string;
  issues: string;
  suggested_rewrite: string;
}

/** Full result shape returned by Gemini for Interview evaluation */
export interface InterviewEvaluation {
  per_question: InterviewQuestionEval[];
  overall: {
    score_0_5: number;
    summary: string;
  };
  "5_targeted_actions_next_week": string[];
  vocabulary_upgrades: {
    from: string;
    to: string;
    example_sentence: string;
  }[];
  grammar_fixes: {
    error: string;
    correction: string;
    why: string;
  }[];
}

/** A single Listen & Repeat item response captured during the exam */
export interface ListenRepeatResponse {
  prompt: string;
  transcript: string;
  audioBlob: Blob;
}

/** A single Interview response captured during the exam */
export interface InterviewResponse {
  question: string;
  transcript: string;
  audioBlob: Blob;
}

/** Shape used for displaying speaking history entries */
export interface SpeakingHistoryEntry {
  id: string;
  date: string;
  type: "listen_and_repeat" | "interview";
  score: number;
  maxScore: number;
  duration: string;
  details?: Record<string, unknown>;
}

/** Standardized server-action response */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
