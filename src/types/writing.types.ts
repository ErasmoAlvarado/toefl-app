// ─────────────────────────────────────────────────────────────
// Writing Module Types — TOEFL iBT 2026 Updated Format
// ─────────────────────────────────────────────────────────────

/** The three official writing task types for updated TOEFL 2026 */
export type WritingTaskType = "build_sentence" | "email" | "academic_discussion";

// ── BUILD A SENTENCE ───────────────────────────────────────

/** A single Build a Sentence item */
export interface BuildSentenceItem {
  id: number;
  /** The shuffled word/phrase chunks the user must reorder */
  chunks: string[];
  /** The correct sentence (for checking) */
  correctSentence: string;
}

/** User response for a single Build a Sentence item */
export interface BuildSentenceResponse {
  itemId: number;
  userOrder: string[];
  isCorrect: boolean;
  timeSpentMs: number;
}

// ── WRITE AN EMAIL ─────────────────────────────────────────

/** The scenario data for an Email task */
export interface EmailScenario {
  context: string;
  instructions: string;
  recipientName: string;
  recipientRelation: string;
}

/** Gemini evaluation result for Email */
export interface EmailEvaluation {
  score_0_5: number;
  rationale: string;
  communicative_purpose_checklist: {
    met: boolean;
    notes: string;
  };
  social_conventions: {
    politeness: string;
    register: string;
    organization: string;
    closing: string;
  };
  language: {
    grammar_errors: {
      error: string;
      correction: string;
      why: string;
    }[];
    vocab_upgrades: {
      from: string;
      to: string;
      example: string;
    }[];
  };
  improved_version_full: string;
}

// ── ACADEMIC DISCUSSION ────────────────────────────────────

/** A student post shown in the Academic Discussion */
export interface DiscussionStudentPost {
  name: string;
  text: string;
}

/** The scenario data for an Academic Discussion task */
export interface AcademicDiscussionScenario {
  professorPost: string;
  professorQuestion: string;
  studentPosts: DiscussionStudentPost[];
}

/** Gemini evaluation result for Academic Discussion */
export interface AcademicDiscussionEvaluation {
  score_0_5: number;
  rationale: string;
  relevance_and_elaboration_notes: string;
  engagement_with_others_notes: string;
  grammar_errors: {
    error: string;
    correction: string;
    why: string;
  }[];
  idiomaticity_and_precision_upgrades: {
    from: string;
    to: string;
    example: string;
  }[];
  improved_version_full: string;
  "3_micro_skills_to_train_next": string[];
}

// ── HISTORY ────────────────────────────────────────────────

/** Shape used for displaying writing history entries */
export interface WritingHistoryEntry {
  id: string;
  date: string;
  type: WritingTaskType;
  score: number;
  maxScore: number;
  duration: string;
  details?: Record<string, unknown>;
}

// ── GENERIC ────────────────────────────────────────────────

/** Standardized server-action response */
export interface WritingActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
