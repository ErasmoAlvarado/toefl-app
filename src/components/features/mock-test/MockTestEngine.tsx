"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  FullMockTestData,
  MockTestPhase,
  MSTPath,
  SectionScore,
  MockTestAttemptResult,
  SECTION_TIME_SECONDS,
  MockReadingPassage,
  MockListeningItem,
} from "@/types/mocktest.types";
import { ToeflQuestion } from "@/types/reading.types";
import { saveMockTestResult } from "@/actions/mocktest.actions";
import TestRules from "./TestRules";
import SystemCheck from "./SystemCheck";
import SectionTransition from "./SectionTransition";
import MockTestResults from "./MockTestResults";
import MockTestReview from "./MockTestReview";
import { ReadingExamMock } from "./sections/ReadingExamMock";
import { ListeningExamMock } from "./sections/ListeningExamMock";
import { WritingExamMock } from "./sections/WritingExamMock";
import { SpeakingExamMock } from "./sections/SpeakingExamMock";
import { ExamTimer } from "../timer";
import { BookOpen, Headphones, PenTool, Mic, AlertTriangle } from "lucide-react";

// ── MST Threshold: 60% of router score triggers upper path ──
const MST_THRESHOLD = 0.6;

interface MockTestEngineProps {
  testData: FullMockTestData;
  onExit: () => void;
}

const PHASE_SECTION_ICON: Record<string, React.ElementType> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
};

export default function MockTestEngine({ testData, onExit }: MockTestEngineProps) {
  // ── Phase & Navigation ──
  const [phase, setPhase] = useState<MockTestPhase>("landing");

  // ── MST Paths ──
  const [readingPath, setReadingPath] = useState<MSTPath | null>(null);
  const [listeningPath, setListeningPath] = useState<MSTPath | null>(null);

  // ── Collected Answers ──
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string | string[]>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [writingResponses, setWritingResponses] = useState<{
    buildSentence: { itemId: number; userOrder: string[]; isCorrect: boolean }[];
    emailText: string;
    discussionText: string;
  }>({ buildSentence: [], emailText: "", discussionText: "" });
  const [speakingResponses, setSpeakingResponses] = useState<{
    listenRepeat: { prompt: string; transcript: string }[];
    interview: { question: string; transcript: string }[];
  }>({ listenRepeat: [], interview: [] });

  // ── Scoring ──
  const [readingRouterScore, setReadingRouterScore] = useState(0);
  const [readingRouterMax, setReadingRouterMax] = useState(0);
  const [readingSecondScore, setReadingSecondScore] = useState(0);
  const [readingSecondMax, setReadingSecondMax] = useState(0);
  const [listeningRouterScore, setListeningRouterScore] = useState(0);
  const [listeningRouterMax, setListeningRouterMax] = useState(0);
  const [listeningSecondScore, setListeningSecondScore] = useState(0);
  const [listeningSecondMax, setListeningSecondMax] = useState(0);

  // ── Final Results ──
  const [attemptResult, setAttemptResult] = useState<MockTestAttemptResult | null>(null);

  // ── Helper: scale raw score to 0-30 band ──
  const scaleTo30 = (raw: number, max: number): number => {
    if (max === 0) return 0;
    return Math.round((raw / max) * 30);
  };

  // ─────────────────────────────────────────
  // Phase handlers
  // ─────────────────────────────────────────

  const handleRulesAccept = () => setPhase("system_check");
  const handleSystemCheckComplete = () => setPhase("ready");
  const handleReadyBegin = () => setPhase("transition_reading_listening"); // first show reading transition
  const goBackToLanding = () => setPhase("landing");

  // ── Reading Router Complete ──
  const handleReadingRouterComplete = useCallback(
    (score: number, maxScore: number, answers: Record<string, string | string[]>) => {
      setReadingRouterScore(score);
      setReadingRouterMax(maxScore);
      setReadingAnswers((prev) => ({ ...prev, ...answers }));
      const isUpper = score >= maxScore * MST_THRESHOLD;
      setReadingPath(isUpper ? "upper" : "lower");
      setPhase("reading_second");
    },
    []
  );

  // ── Reading Second Complete ──
  const handleReadingSecondComplete = useCallback(
    (score: number, maxScore: number, answers: Record<string, string | string[]>) => {
      setReadingSecondScore(score);
      setReadingSecondMax(maxScore);
      setReadingAnswers((prev) => ({ ...prev, ...answers }));
      setPhase("transition_reading_listening");
    },
    []
  );

  // ── Listening Router Complete ──
  const handleListeningRouterComplete = useCallback(
    (score: number, maxScore: number, answers: Record<string, string>) => {
      setListeningRouterScore(score);
      setListeningRouterMax(maxScore);
      setListeningAnswers((prev) => ({ ...prev, ...answers }));
      const isUpper = score >= maxScore * MST_THRESHOLD;
      setListeningPath(isUpper ? "upper" : "lower");
      setPhase("listening_second");
    },
    []
  );

  // ── Listening Second Complete ──
  const handleListeningSecondComplete = useCallback(
    (score: number, maxScore: number, answers: Record<string, string>) => {
      setListeningSecondScore(score);
      setListeningSecondMax(maxScore);
      setListeningAnswers((prev) => ({ ...prev, ...answers }));
      setPhase("transition_listening_writing");
    },
    []
  );

  // ── Writing Complete ──
  const handleWritingComplete = useCallback(
    (responses: typeof writingResponses) => {
      setWritingResponses(responses);
      setPhase("transition_writing_speaking");
    },
    []
  );

  // ── Speaking Complete — also compute final results ──
  const handleSpeakingComplete = useCallback(
    (responses: typeof speakingResponses) => {
      setSpeakingResponses(responses);

      // ── Compute section scores ──
      const readingRaw = readingRouterScore + readingSecondScore;
      const readingMax = readingRouterMax + readingSecondMax;
      const listeningRaw = listeningRouterScore + listeningSecondScore;
      const listeningMax = listeningRouterMax + listeningSecondMax;

      // Writing: build-sentence auto-graded, others get placeholder 3/5
      const bsCorrect = writingResponses.buildSentence.filter((b) => b.isCorrect).length;
      const writingRaw = bsCorrect + 3 + 3; // bs + email(3/5) + discussion(3/5)
      const writingMax = 10 + 5 + 5;

      // Speaking: placeholder 3/5 for each sub-task
      const speakingRaw = 3 + 3;
      const speakingMax = 5 + 5;

      const sectionScores: SectionScore[] = [
        {
          section: "reading",
          rawScore: readingRaw,
          maxScore: readingMax,
          scaledScore: scaleTo30(readingRaw, readingMax),
          taskBreakdown: [
            { taskType: "Router", score: readingRouterScore, maxScore: readingRouterMax },
            { taskType: readingPath === "upper" ? "Upper" : "Lower", score: readingSecondScore, maxScore: readingSecondMax },
          ],
        },
        {
          section: "listening",
          rawScore: listeningRaw,
          maxScore: listeningMax,
          scaledScore: scaleTo30(listeningRaw, listeningMax),
          taskBreakdown: [
            { taskType: "Router", score: listeningRouterScore, maxScore: listeningRouterMax },
            { taskType: listeningPath === "upper" ? "Upper" : "Lower", score: listeningSecondScore, maxScore: listeningSecondMax },
          ],
        },
        {
          section: "writing",
          rawScore: writingRaw,
          maxScore: writingMax,
          scaledScore: scaleTo30(writingRaw, writingMax),
          taskBreakdown: [
            { taskType: "Build a Sentence", score: bsCorrect, maxScore: 10 },
            { taskType: "Write an Email", score: 3, maxScore: 5 },
            { taskType: "Academic Discussion", score: 3, maxScore: 5 },
          ],
        },
        {
          section: "speaking",
          rawScore: speakingRaw,
          maxScore: speakingMax,
          scaledScore: scaleTo30(speakingRaw, speakingMax),
          taskBreakdown: [
            { taskType: "Listen & Repeat", score: 3, maxScore: 5 },
            { taskType: "Take an Interview", score: 3, maxScore: 5 },
          ],
        },
      ];

      const totalScore = sectionScores.reduce((s, sc) => s + sc.scaledScore, 0);

      const result: MockTestAttemptResult = {
        id: `attempt-${Date.now()}`,
        mockTestId: testData.id,
        completedAt: new Date().toISOString(),
        totalScore,
        readingPath: readingPath || "lower",
        listeningPath: listeningPath || "lower",
        sectionScores,
        recommendations: generateRecommendations(sectionScores),
        readingAnswers,
        listeningAnswers,
        writingResponses,
        speakingResponses: responses,
      };
      setAttemptResult(result);
      setPhase("results");

      // Fire-and-forget save to Supabase
      saveMockTestResult(result, testData).catch((saveErr) =>
        console.error("Failed to save mock test result:", saveErr)
      );
    },
    [
      readingRouterScore,
      readingRouterMax,
      readingSecondScore,
      readingSecondMax,
      readingPath,
      listeningRouterScore,
      listeningRouterMax,
      listeningSecondScore,
      listeningSecondMax,
      listeningPath,
      writingResponses,
      readingAnswers,
      listeningAnswers,
      testData.id,
    ]
  );

  // ── Recommendation generator ──
  function generateRecommendations(scores: SectionScore[]): string[] {
    const recs: string[] = [];
    scores.forEach((s) => {
      if (s.scaledScore < 15) {
        recs.push(`Focus intensively on ${s.section} — your score is below average.`);
      } else if (s.scaledScore < 22) {
        recs.push(`Practice more ${s.section} exercises to move from intermediate to advanced.`);
      } else {
        recs.push(`Great work on ${s.section}! Maintain your level with regular practice.`);
      }
    });
    return recs;
  }

  // ── Current timer section ──
  const getCurrentSectionTime = (): number | null => {
    if (phase.startsWith("reading")) return SECTION_TIME_SECONDS.reading;
    if (phase.startsWith("listening")) return SECTION_TIME_SECONDS.listening;
    if (phase.startsWith("writing")) return SECTION_TIME_SECONDS.writing;
    if (phase.startsWith("speaking")) return SECTION_TIME_SECONDS.speaking;
    return null;
  };

  const getCurrentSectionName = (): string | null => {
    if (phase.startsWith("reading")) return "reading";
    if (phase.startsWith("listening")) return "listening";
    if (phase.startsWith("writing")) return "writing";
    if (phase.startsWith("speaking")) return "speaking";
    return null;
  };

  const sectionTime = getCurrentSectionTime();
  const sectionName = getCurrentSectionName();
  const SectionIcon = sectionName ? PHASE_SECTION_ICON[sectionName] : null;

  // ─────────────────────────────────────────
  // Render phase
  // ─────────────────────────────────────────

  // Landing
  if (phase === "landing") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30">
          <span className="text-4xl font-black text-white">T</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">{testData.title}</h1>
        <p className="text-gray-400 text-sm mb-1">TOEFL iBT Full Mock Test • Updated Jan 2026</p>
        <p className="text-gray-500 text-xs mb-8">~2 hours • 4 sections • Adaptive MST</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setPhase("rules")}
            className="py-4 px-8 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Start Full Test
          </button>
          <button
            onClick={onExit}
            className="py-3 px-8 rounded-2xl font-semibold text-sm bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (phase === "rules") {
    return <TestRules onAccept={handleRulesAccept} onBack={goBackToLanding} />;
  }

  if (phase === "system_check") {
    return <SystemCheck onComplete={handleSystemCheckComplete} onBack={() => setPhase("rules")} />;
  }

  if (phase === "ready") {
    return (
      <SectionTransition
        fromSection="pre-test"
        toSection="reading"
        onContinue={() => setPhase("reading_router")}
      />
    );
  }

  // ── Transitions ──
  if (phase === "transition_reading_listening") {
    return (
      <SectionTransition
        fromSection="reading"
        toSection="listening"
        onContinue={() => setPhase("listening_router")}
      />
    );
  }
  if (phase === "transition_listening_writing") {
    return (
      <SectionTransition
        fromSection="listening"
        toSection="writing"
        onContinue={() => setPhase("writing_build_sentence")}
      />
    );
  }
  if (phase === "transition_writing_speaking") {
    return (
      <SectionTransition
        fromSection="writing"
        toSection="speaking"
        onContinue={() => setPhase("speaking_listen_repeat")}
      />
    );
  }

  // ── Results ──
  if (phase === "results" && attemptResult) {
    return (
      <MockTestResults
        result={attemptResult}
        testData={testData}
        onReview={() => setPhase("review")}
        onExit={onExit}
      />
    );
  }

  // ── Review ──
  if (phase === "review" && attemptResult) {
    return (
      <MockTestReview
        result={attemptResult}
        testData={testData}
        onBack={() => setPhase("results")}
      />
    );
  }

  // ── Section Runners (wrapped with top bar + timer) ──
  const renderSectionContent = () => {
    if (phase === "reading_router") {
      return (
        <ReadingExamMock
          passages={testData.reading.router.passages}
          onComplete={handleReadingRouterComplete}
        />
      );
    }
    if (phase === "reading_second") {
      const module = readingPath === "upper" ? testData.reading.upper : testData.reading.lower;
      return (
        <ReadingExamMock
          passages={module.passages}
          onComplete={handleReadingSecondComplete}
        />
      );
    }
    if (phase === "listening_router") {
      return (
        <ListeningExamMock
          items={testData.listening.router.items}
          onComplete={handleListeningRouterComplete}
        />
      );
    }
    if (phase === "listening_second") {
      const module = listeningPath === "upper" ? testData.listening.upper : testData.listening.lower;
      return (
        <ListeningExamMock
          items={module.items}
          onComplete={handleListeningSecondComplete}
        />
      );
    }
    if (phase.startsWith("writing")) {
      return (
        <WritingExamMock
          data={testData.writing}
          startPhase={phase as "writing_build_sentence" | "writing_email" | "writing_academic_discussion"}
          onPhaseChange={(p: MockTestPhase) => setPhase(p)}
          onComplete={handleWritingComplete}
          existingResponses={writingResponses}
        />
      );
    }
    if (phase.startsWith("speaking")) {
      return (
        <SpeakingExamMock
          data={testData.speaking}
          startPhase={phase as "speaking_listen_repeat" | "speaking_interview"}
          onPhaseChange={(p: MockTestPhase) => setPhase(p)}
          onComplete={handleSpeakingComplete}
        />
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar with timer */}
      {sectionTime && sectionName && SectionIcon && (
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-card border-b border-border/50 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SectionIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-card-foreground capitalize">{sectionName}</p>
              <p className="text-[10px] text-muted-foreground">
                {phase.includes("router") ? "Router Module" : phase.includes("second") ? `${readingPath || listeningPath || ""} Module` : ""}
              </p>
            </div>
          </div>
          <ExamTimer initialSeconds={sectionTime} paused={false} />
        </div>
      )}

      {/* Section content */}
      <div className="flex-1 overflow-auto">
        {renderSectionContent()}
      </div>
    </div>
  );
}
