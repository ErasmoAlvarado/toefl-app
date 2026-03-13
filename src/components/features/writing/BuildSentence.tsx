"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Puzzle,
  RotateCcw,
  Delete,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { saveWritingSession } from "@/actions/writing.actions";
import type { BuildSentenceItem, BuildSentenceResponse } from "@/types/writing.types";

// ── Sample items (in production, these come from Gemini generation) ──
const SAMPLE_ITEMS: BuildSentenceItem[] = [
  {
    id: 1,
    chunks: ["the professor", "who specializes", "in marine biology", "announced", "a field trip"],
    correctSentence: "The professor who specializes in marine biology announced a field trip",
  },
  {
    id: 2,
    chunks: ["students", "are required", "to submit", "their research proposals", "by Friday"],
    correctSentence: "Students are required to submit their research proposals by Friday",
  },
  {
    id: 3,
    chunks: ["the library", "which was", "recently renovated", "now offers", "digital resources"],
    correctSentence: "The library which was recently renovated now offers digital resources",
  },
  {
    id: 4,
    chunks: ["having completed", "the experiment", "the students", "began", "analyzing the data"],
    correctSentence: "Having completed the experiment the students began analyzing the data",
  },
  {
    id: 5,
    chunks: ["if the weather", "permits", "the outdoor", "lecture will", "proceed as scheduled"],
    correctSentence: "If the weather permits the outdoor lecture will proceed as scheduled",
  },
  {
    id: 6,
    chunks: ["the dean", "emphasized", "the importance of", "academic integrity", "during orientation"],
    correctSentence: "The dean emphasized the importance of academic integrity during orientation",
  },
  {
    id: 7,
    chunks: ["neither the textbook", "nor the lectures", "covered", "this particular", "topic adequately"],
    correctSentence: "Neither the textbook nor the lectures covered this particular topic adequately",
  },
  {
    id: 8,
    chunks: ["the study abroad", "program", "has been", "expanded to include", "three new countries"],
    correctSentence: "The study abroad program has been expanded to include three new countries",
  },
  {
    id: 9,
    chunks: ["before registering", "for advanced courses", "students must", "complete", "all prerequisites"],
    correctSentence: "Before registering for advanced courses students must complete all prerequisites",
  },
  {
    id: 10,
    chunks: ["the research findings", "suggest that", "collaborative learning", "improves", "critical thinking skills"],
    correctSentence: "The research findings suggest that collaborative learning improves critical thinking skills",
  },
];

/**
 * Build a Sentence Runner — the user reorders word chips to form correct sentences.
 */
export default function BuildSentence({ initialItems }: { initialItems?: BuildSentenceItem[] }) {
  const router = useRouter();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [availableChunks, setAvailableChunks] = useState<string[]>([]);
  const [responses, setResponses] = useState<BuildSentenceResponse[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itemStartTime, setItemStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);

  // Use provided items or fallback to sample data
  const items = useMemo(() => initialItems || SAMPLE_ITEMS, [initialItems]);

  const currentItem = items[currentItemIndex];

  // Shuffle available chunks on item change
  useEffect(() => {
    if (currentItem) {
      const shuffled = [...currentItem.chunks].sort(() => Math.random() - 0.5);
      setAvailableChunks(shuffled);
      setSelectedChunks([]);
      setChecked(null);
      setItemStartTime(Date.now());
    }
  }, [currentItem]);

  const handleSelectChunk = useCallback(
    (chunk: string, idx: number) => {
      if (checked !== null) return;
      setSelectedChunks((prev) => [...prev, chunk]);
      setAvailableChunks((prev) => prev.filter((_, i) => i !== idx));
    },
    [checked]
  );

  const handleRemoveChunk = useCallback(
    (chunk: string, idx: number) => {
      if (checked !== null) return;
      setAvailableChunks((prev) => [...prev, chunk]);
      setSelectedChunks((prev) => prev.filter((_, i) => i !== idx));
    },
    [checked]
  );

  const handleBackspace = useCallback(() => {
    if (checked !== null || selectedChunks.length === 0) return;
    const lastChunk = selectedChunks[selectedChunks.length - 1];
    setSelectedChunks((prev) => prev.slice(0, -1));
    setAvailableChunks((prev) => [...prev, lastChunk]);
  }, [checked, selectedChunks]);

  const handleReset = useCallback(() => {
    if (checked !== null) return;
    const shuffled = [...currentItem.chunks].sort(() => Math.random() - 0.5);
    setAvailableChunks(shuffled);
    setSelectedChunks([]);
  }, [checked, currentItem]);

  const handleCheck = useCallback(() => {
    if (availableChunks.length > 0) return; // not all placed yet
    const userSentence = selectedChunks.join(" ").toLowerCase().trim();
    const correctSentence = currentItem.correctSentence.toLowerCase().trim();
    const isCorrect = userSentence === correctSentence;
    setChecked(isCorrect);

    const timeSpent = Date.now() - itemStartTime;
    setResponses((prev) => [
      ...prev,
      {
        itemId: currentItem.id,
        userOrder: selectedChunks,
        isCorrect,
        timeSpentMs: timeSpent,
      },
    ]);
  }, [availableChunks, selectedChunks, currentItem, itemStartTime]);

  const handleNext = useCallback(() => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else {
      // Finish
      const total = responses.reduce((sum, r) => sum + r.timeSpentMs, 0);
      setTotalTime(total);
      setIsComplete(true);
    }
  }, [currentItemIndex, items.length, responses]);

  const correctCount = responses.filter((r) => r.isCorrect).length;

  const handleSaveAndReturn = useCallback(async () => {
    setIsSaving(true);
    await saveWritingSession({
      taskType: "build_sentence",
      score: correctCount,
      maxScore: items.length,
      timeSpentSeconds: Math.round(totalTime / 1000),
      details: { responses },
    });
    setIsSaving(false);
    router.push("/practice/writing");
  }, [correctCount, items.length, totalTime, responses, router]);

  // ── COMPLETE SCREEN ──
  if (isComplete) {
    const pctCorrect = Math.round((correctCount / items.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700/50 p-8 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <Puzzle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Build a Sentence Complete!
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div
              className={cn(
                "px-6 py-3 rounded-full border text-2xl font-bold",
                pctCorrect >= 80
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : pctCorrect >= 60
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-red-500/15 text-red-300 border-red-500/30"
              )}
            >
              {correctCount} / {items.length}
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            {pctCorrect}% correct •{" "}
            {Math.round(totalTime / 1000)}s total time
          </p>
        </div>

        {/* Per-item breakdown */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6 space-y-3">
          <h3 className="text-sm font-bold text-white mb-3">Item Breakdown</h3>
          {responses.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl border border-gray-700/30"
            >
              {r.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div className="flex-grow">
                <p className="text-sm text-gray-300">{r.userOrder.join(" ")}</p>
                {!r.isCorrect && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ {items[idx].correctSentence}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {(r.timeSpentMs / 1000).toFixed(1)}s
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveAndReturn}
          disabled={isSaving}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold text-sm",
            "bg-teal-500/10 border border-teal-500/20 text-teal-300",
            "hover:bg-teal-500/20 flex items-center justify-center gap-2 transition-all"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Save & Return <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  // ── ITEM RUNNER ──
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/practice/writing")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>
              Item {currentItemIndex + 1} of {items.length}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {correctCount} correct
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${((currentItemIndex + (checked !== null ? 1 : 0)) / items.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sentence area */}
      <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-teal-400" />
          Arrange the chunks to form a correct sentence
        </h3>

        {/* Selected chunks (answer area) */}
        <div
          className={cn(
            "min-h-[80px] bg-gray-800/50 rounded-xl p-4 border-2 border-dashed mb-6 flex flex-wrap gap-2",
            checked === true && "border-emerald-500/30 bg-emerald-500/5",
            checked === false && "border-red-500/30 bg-red-500/5",
            checked === null && "border-gray-700/30"
          )}
        >
          {selectedChunks.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              Click on the chips below to build your sentence…
            </p>
          ) : (
            selectedChunks.map((chunk, idx) => (
              <button
                key={`sel-${idx}`}
                onClick={() => handleRemoveChunk(chunk, idx)}
                disabled={checked !== null}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  checked === null
                    ? "bg-teal-500/20 text-teal-200 border border-teal-500/30 hover:bg-teal-500/30 cursor-pointer"
                    : checked
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-200 border border-red-500/30"
                )}
              >
                {chunk}
              </button>
            ))
          )}
        </div>

        {/* Available chunks */}
        <div className="flex flex-wrap gap-2 min-h-[44px]">
          {availableChunks.map((chunk, idx) => (
            <button
              key={`avail-${idx}`}
              onClick={() => handleSelectChunk(chunk, idx)}
              disabled={checked !== null}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600/40 hover:bg-gray-700 hover:text-white transition-all cursor-pointer"
            >
              {chunk}
            </button>
          ))}
        </div>

        {/* Correct answer reveal */}
        {checked === false && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-in fade-in duration-300">
            <p className="text-xs font-semibold text-emerald-300 mb-1">
              Correct Sentence:
            </p>
            <p className="text-sm text-emerald-200">
              {currentItem.correctSentence}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {checked === null ? (
          <>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleBackspace}
              disabled={selectedChunks.length === 0}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              <Delete className="w-4 h-4" /> Undo
            </button>
            <button
              onClick={handleCheck}
              disabled={availableChunks.length > 0}
              className={cn(
                "flex-grow py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                availableChunks.length > 0
                  ? "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25"
              )}
            >
              <CheckCircle2 className="w-4 h-4" /> Check Answer
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 transition-all flex items-center justify-center gap-2"
          >
            {currentItemIndex < items.length - 1 ? (
              <>
                Next Item <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                See Results <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
