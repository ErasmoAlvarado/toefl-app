"use client";

import React, { useState } from "react";
import {
  MockWritingSection,
  MockTestPhase,
} from "@/types/mocktest.types";
import { Puzzle, Mail, MessageSquare, ArrowRight, GripVertical, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingExamMockProps {
  data: MockWritingSection;
  startPhase: "writing_build_sentence" | "writing_email" | "writing_academic_discussion";
  onPhaseChange: (phase: MockTestPhase) => void;
  onComplete: (responses: {
    buildSentence: { itemId: number; userOrder: string[]; isCorrect: boolean }[];
    emailText: string;
    discussionText: string;
  }) => void;
  existingResponses: {
    buildSentence: { itemId: number; userOrder: string[]; isCorrect: boolean }[];
    emailText: string;
    discussionText: string;
  };
}

export function WritingExamMock({
  data,
  startPhase,
  onPhaseChange,
  onComplete,
  existingResponses,
}: WritingExamMockProps) {
  // ── Build a Sentence state ──
  const [bsIdx, setBsIdx] = useState(0);
  const [bsResults, setBsResults] = useState<
    { itemId: number; userOrder: string[]; isCorrect: boolean }[]
  >(existingResponses.buildSentence);
  const [currentChunks, setCurrentChunks] = useState<string[]>(
    () => shuffleArray([...data.buildSentences[0].chunks])
  );

  // ── Email state ──
  const [emailText, setEmailText] = useState(existingResponses.emailText);

  // ── Academic Discussion state ──
  const [discussionText, setDiscussionText] = useState(existingResponses.discussionText);

  function shuffleArray(arr: string[]): string[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ── Build a Sentence handlers ──
  const moveChunk = (fromIdx: number, direction: "up" | "down") => {
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= currentChunks.length) return;
    const newChunks = [...currentChunks];
    [newChunks[fromIdx], newChunks[toIdx]] = [newChunks[toIdx], newChunks[fromIdx]];
    setCurrentChunks(newChunks);
  };

  const submitBuildSentence = () => {
    const item = data.buildSentences[bsIdx];
    const userSentence = currentChunks.join(" ") + ".";
    const normalizedUser = currentChunks.join(" ").toLowerCase().replace(/[^\w\s]/g, "").trim();
    const normalizedCorrect = item.correctSentence.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const isCorrect = normalizedUser === normalizedCorrect;

    const newResults = [
      ...bsResults,
      { itemId: item.id, userOrder: [...currentChunks], isCorrect },
    ];
    setBsResults(newResults);

    if (bsIdx < data.buildSentences.length - 1) {
      const nextIdx = bsIdx + 1;
      setBsIdx(nextIdx);
      setCurrentChunks(shuffleArray([...data.buildSentences[nextIdx].chunks]));
    } else {
      // Move to email phase
      onPhaseChange("writing_email");
    }
  };

  const submitEmail = () => {
    onPhaseChange("writing_academic_discussion");
  };

  const submitDiscussion = () => {
    onComplete({
      buildSentence: bsResults,
      emailText,
      discussionText,
    });
  };

  // ── RENDER BUILD A SENTENCE ──
  if (startPhase === "writing_build_sentence") {
    const currentItem = data.buildSentences[bsIdx];
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-teal-300">Build a Sentence</span>
          </div>
          <span>Item {bsIdx + 1} of {data.buildSentences.length}</span>
        </div>

        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all"
            style={{ width: `${((bsIdx + 1) / data.buildSentences.length) * 100}%` }}
          />
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-6 space-y-4">
          <p className="text-sm text-gray-300">
            Arrange the words in the correct order to form a grammatically correct sentence:
          </p>

          <div className="space-y-2">
            {currentChunks.map((chunk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/40"
              >
                <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-sm text-white font-medium flex-1">{chunk}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveChunk(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-30 transition-all text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveChunk(idx, "down")}
                    disabled={idx === currentChunks.length - 1}
                    className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-30 transition-all text-xs"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Preview</p>
            <p className="text-sm text-gray-300">
              {currentChunks.join(" ")}.
            </p>
          </div>

          <button
            onClick={submitBuildSentence}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all"
          >
            {bsIdx < data.buildSentences.length - 1 ? "Submit & Next →" : "Submit & Continue to Email"}
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER EMAIL ──
  if (startPhase === "writing_email") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <Mail className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-emerald-300">Write an Email</span>
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-6 space-y-4">
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Scenario</p>
            <p className="text-xs text-gray-300 leading-relaxed">{data.email.context}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Instructions</p>
            <p className="text-xs text-gray-300 leading-relaxed">{data.email.instructions}</p>
          </div>
          <div className="text-xs text-gray-500">
            To: <span className="text-white font-medium">{data.email.recipientName}</span>{" "}
            ({data.email.recipientRelation})
          </div>

          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full h-48 p-4 rounded-xl bg-gray-800/50 border border-gray-700/40 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/30 transition-colors"
            placeholder="Dear..."
          />

          <button
            onClick={submitEmail}
            disabled={!emailText.trim()}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-bold text-sm transition-all",
              emailText.trim()
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                : "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
            )}
          >
            Submit & Continue to Discussion
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER ACADEMIC DISCUSSION ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2 text-xs">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-cyan-300">Academic Discussion</span>
      </div>

      <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-6 space-y-4">
        {/* Professor post */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Professor</p>
          <p className="text-xs text-gray-300 leading-relaxed">{data.academicDiscussion.professorPost}</p>
          <p className="text-xs text-white font-semibold mt-2">{data.academicDiscussion.professorQuestion}</p>
        </div>

        {/* Student posts */}
        {data.academicDiscussion.studentPosts.map((sp, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{sp.name}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{sp.text}</p>
          </div>
        ))}

        <textarea
          value={discussionText}
          onChange={(e) => setDiscussionText(e.target.value)}
          className="w-full h-40 p-4 rounded-xl bg-gray-800/50 border border-gray-700/40 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-500/30 transition-colors"
          placeholder="I think that..."
        />

        <button
          onClick={submitDiscussion}
          disabled={!discussionText.trim()}
          className={cn(
            "w-full py-3 px-6 rounded-xl font-bold text-sm transition-all",
            discussionText.trim()
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
              : "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
          )}
        >
          Submit Writing Section
        </button>
      </div>
    </div>
  );
}
