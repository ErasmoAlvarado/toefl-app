"use client";

import React from "react";
import {
  Target,
  CheckCircle2,
  ChevronRight,
  XCircle,
  Lightbulb,
  ArrowUpRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EmailEvaluation,
  AcademicDiscussionEvaluation,
} from "@/types/writing.types";

/** Color-coded score badge */
function ScoreBadge({
  score,
  large = false,
}: {
  score: number;
  large?: boolean;
}) {
  const config =
    score >= 4
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : score >= 3
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-red-500/15 text-red-300 border-red-500/30";

  return (
    <div
      className={cn(
        "rounded-full border font-bold flex items-center justify-center",
        config,
        large ? "px-6 py-3 text-2xl" : "px-3 py-1.5 text-sm"
      )}
    >
      {score} / 5
    </div>
  );
}

interface WritingFeedbackProps {
  type: "email" | "academic_discussion";
  result: EmailEvaluation | AcademicDiscussionEvaluation;
  userText: string;
}

/**
 * Displays AI evaluation feedback for Email and Academic Discussion tasks.
 */
export default function WritingFeedback({
  type,
  result,
  userText,
}: WritingFeedbackProps) {
  // ── EMAIL ──
  if (type === "email") {
    const data = result as EmailEvaluation;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Email Evaluation
              </h2>
              <p className="text-gray-400 text-sm">Write an Email Performance</p>
            </div>
            <ScoreBadge score={data.score_0_5} large />
          </div>

          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-sm font-semibold text-emerald-300 mb-1">
              Rationale
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {data.rationale}
            </p>
          </div>
        </div>

        {/* Communicative Purpose */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-400" />
            Communicative Purpose
          </h4>
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border",
              data.communicative_purpose_checklist.met
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            )}
          >
            {data.communicative_purpose_checklist.met ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <p className="text-sm text-gray-300">
              {data.communicative_purpose_checklist.notes}
            </p>
          </div>
        </div>

        {/* Social Conventions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.social_conventions).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-4"
            >
              <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-1">
                {key.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-gray-300">{value}</p>
            </div>
          ))}
        </div>

        {/* Grammar Errors */}
        {data.language.grammar_errors?.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" /> Grammar Errors
            </h3>
            <ul className="space-y-3">
              {data.language.grammar_errors.map((g, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-red-400 bg-red-500/10 px-1 rounded">
                      {g.error}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">
                      {g.correction}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{g.why}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vocabulary Upgrades */}
        {data.language.vocab_upgrades?.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Vocabulary
              Upgrades
            </h3>
            <ul className="space-y-3">
              {data.language.vocab_upgrades.map((v, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-red-400 line-through">{v.from}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-emerald-400 font-bold">{v.to}</span>
                  </div>
                  <p className="text-gray-500 italic text-xs">
                    &quot;{v.example}&quot;
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improved Version */}
        {data.improved_version_full && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              Improved Version
            </h3>
            <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl">
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {data.improved_version_full}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ACADEMIC DISCUSSION ──
  const data = result as AcademicDiscussionEvaluation;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header card */}
      <div className="bg-gradient-to-br from-cyan-900/80 to-teal-900/60 rounded-3xl border border-cyan-500/20 p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            Discussion Evaluated
          </h2>
          <p className="text-cyan-200/80 leading-relaxed">{data.rationale}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center min-w-[140px] border border-white/10">
          <div className="text-5xl font-black text-white mb-1">
            {data.score_0_5}
          </div>
          <div className="text-cyan-200/60 font-medium tracking-wider uppercase text-xs">
            Overall Score
          </div>
        </div>
      </div>

      {/* Relevance & Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4" /> Relevance & Elaboration
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {data.relevance_and_elaboration_notes}
          </p>
        </div>
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4" /> Engagement with Others
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {data.engagement_with_others_notes}
          </p>
        </div>
      </div>

      {/* Grammar Errors */}
      {data.grammar_errors?.length > 0 && (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" /> Grammar Errors
          </h3>
          <ul className="space-y-3">
            {data.grammar_errors.map((g, i) => (
              <li
                key={i}
                className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-red-400 bg-red-500/10 px-1 rounded">
                    {g.error}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    {g.correction}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{g.why}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Idiomaticity Upgrades */}
      {data.idiomaticity_and_precision_upgrades?.length > 0 && (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Idiomaticity &
            Precision
          </h3>
          <ul className="space-y-3">
            {data.idiomaticity_and_precision_upgrades.map((v, i) => (
              <li
                key={i}
                className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-red-400 line-through">{v.from}</span>
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="text-emerald-400 font-bold">{v.to}</span>
                </div>
                <p className="text-gray-500 italic text-xs">
                  &quot;{v.example}&quot;
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Micro-skills */}
      {data["3_micro_skills_to_train_next"]?.length > 0 && (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" /> 3 Micro-Skills to
            Train Next
          </h3>
          <ul className="space-y-2">
            {data["3_micro_skills_to_train_next"].map((skill, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-xl border border-gray-700/30"
              >
                <span className="font-bold text-cyan-400 shrink-0">
                  {idx + 1}.
                </span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Version */}
      {data.improved_version_full && (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            Improved Version
          </h3>
          <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl">
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {data.improved_version_full}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
