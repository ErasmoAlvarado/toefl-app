"use client";

import React from "react";
import {
  MockTestAttemptResult,
  FullMockTestData,
  SectionScore,
} from "@/types/mocktest.types";
import {
  Trophy,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ArrowRight,
  BarChart3,
  Star,
  Target,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MockTestResultsProps {
  result: MockTestAttemptResult;
  testData: FullMockTestData;
  onReview: () => void;
  onExit: () => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
};

const SECTION_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  reading: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  listening: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  writing: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  speaking: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

function getBand(score: number): { label: string; color: string } {
  if (score >= 25) return { label: "Advanced", color: "text-green-400" };
  if (score >= 18) return { label: "Intermediate", color: "text-yellow-400" };
  if (score >= 10) return { label: "Basic", color: "text-orange-400" };
  return { label: "Below Basic", color: "text-red-400" };
}

function getOverallBand(total: number): { label: string; color: string } {
  if (total >= 100) return { label: "C1 – Advanced", color: "text-green-400" };
  if (total >= 72) return { label: "B2 – Upper Intermediate", color: "text-emerald-400" };
  if (total >= 42) return { label: "B1 – Intermediate", color: "text-yellow-400" };
  return { label: "A2/B1 – Basic", color: "text-orange-400" };
}

export default function MockTestResults({
  result,
  testData,
  onReview,
  onExit,
}: MockTestResultsProps) {
  const overallBand = getOverallBand(result.totalScore);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Score */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-1">{result.totalScore}/120</h1>
        <p className={cn("text-lg font-bold", overallBand.color)}>{overallBand.label}</p>
        <p className="text-slate-500 dark:text-gray-500 text-xs mt-1">
          {testData.title} • Completed {new Date(result.completedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Section Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {result.sectionScores.map((sc) => {
          const Icon = SECTION_ICONS[sc.section];
          const colors = SECTION_COLORS[sc.section];
          const band = getBand(sc.scaledScore);
          return (
            <div
              key={sc.section}
              className={cn(
                "rounded-2xl border p-5 backdrop-blur",
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-5 h-5", colors.text)} />
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{sc.section}</span>
              </div>
              <p className={cn("text-3xl font-black", colors.text)}>{sc.scaledScore}<span className="text-lg text-slate-500 dark:text-gray-500">/30</span></p>
              <p className={cn("text-xs font-semibold mt-1", band.color)}>{band.label}</p>
            </div>
          );
        })}
      </div>

      {/* MST Path Info */}
      <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adaptive Test (MST) Paths</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-gray-500 mb-1">Reading</p>
            <p className={cn(
              "text-sm font-bold",
              result.readingPath === "upper" ? "text-green-400" : "text-amber-400"
            )}>
              {result.readingPath === "upper" ? "▲ Upper Module" : "▼ Lower Module"}
            </p>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs text-gray-500 mb-1">Listening</p>
            <p className={cn(
              "text-sm font-bold",
              result.listeningPath === "upper" ? "text-green-400" : "text-amber-400"
            )}>
              {result.listeningPath === "upper" ? "▲ Upper Module" : "▼ Lower Module"}
            </p>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Task Type Breakdown</h3>
        </div>
        <div className="space-y-4">
          {result.sectionScores.map((sc) => (
            <div key={sc.section}>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">{sc.section}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sc.taskBreakdown.map((tb, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700/40"
                  >
                    <span className="text-xs text-slate-600 dark:text-gray-300">{tb.taskType}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {tb.score}/{tb.maxScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-gray-400">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onExit}
          className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
        >
          Back to Dashboard
        </button>
        <button
          onClick={onReview}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> Review Answers
        </button>
      </div>
    </div>
  );
}
