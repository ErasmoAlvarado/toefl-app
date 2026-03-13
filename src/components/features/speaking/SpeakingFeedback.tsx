"use client";

import React from "react";
import {
  Target,
  CheckCircle2,
  ChevronRight,
  XCircle,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  ArrowUpRight,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ListenRepeatEvaluation,
  InterviewEvaluation,
  ListenRepeatResponse,
  InterviewResponse,
} from "@/types/speaking.types";

interface SpeakingFeedbackProps {
  type: "listen_and_repeat" | "interview";
  result: ListenRepeatEvaluation | InterviewEvaluation;
  responses?: (ListenRepeatResponse | InterviewResponse)[];
}

/** Local audio player to preview blob */
function AudioPlayer({ blob }: { blob: Blob }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return null;

  return (
    <audio controls src={url} className="mt-2 h-10 w-full max-w-sm rounded" />
  );
}

/** Color-coded score badge */
function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
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

/**
 * Displays AI evaluation feedback for both Listen & Repeat and Interview tasks.
 */
export default function SpeakingFeedback({ type, result, responses }: SpeakingFeedbackProps) {
  // ── LISTEN & REPEAT ──
  if (type === "listen_and_repeat") {
    const data = result as ListenRepeatEvaluation;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Evaluation Result
              </h2>
              <p className="text-gray-400 text-sm">Listen &amp; Repeat Performance</p>
            </div>
            <ScoreBadge score={data.score_0_5} large />
          </div>

          <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-sm font-semibold text-indigo-300 mb-1">Rationale</p>
            <p className="text-gray-300 text-sm leading-relaxed">{data.rationale}</p>
          </div>
        </div>

        {/* Word-level diff */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-400" /> Missing Words
            </h4>
            <ul className="space-y-1">
              {data.word_level_diff.missing.length > 0
                ? data.word_level_diff.missing.map((w, i) => (
                    <li key={i} className="text-sm text-red-300 bg-red-500/10 px-2 py-1 rounded">
                      {w}
                    </li>
                  ))
                : <li className="text-sm text-gray-500">None — great!</li>}
            </ul>
          </div>

          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-amber-400" /> Substitutions
            </h4>
            <ul className="space-y-1">
              {data.word_level_diff.substitutions.length > 0
                ? data.word_level_diff.substitutions.map((w, i) => (
                    <li key={i} className="text-sm text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                      {w}
                    </li>
                  ))
                : <li className="text-sm text-gray-500">None</li>}
            </ul>
          </div>

          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Extra Words
            </h4>
            <ul className="space-y-1">
              {data.word_level_diff.extra.length > 0
                ? data.word_level_diff.extra.map((w, i) => (
                    <li key={i} className="text-sm text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                      {w}
                    </li>
                  ))
                : <li className="text-sm text-gray-500">None</li>}
            </ul>
          </div>
        </div>

        {/* Intelligibility */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-400" /> Intelligibility Notes
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {data.intelligibility_notes}
          </p>
        </div>

        {/* Drills */}
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-5">
          <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" /> 3 Drills to Improve
          </h3>
          <ul className="space-y-2">
            {data["3_drills_to_improve"].map((drill, idx) => (
              <li
                key={idx}
                className="flex gap-3 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-xl border border-gray-700/30"
              >
                <span className="font-bold text-indigo-400 shrink-0">{idx + 1}.</span>
                {drill}
              </li>
            ))}
          </ul>
        </div>

        {/* User Recordings */}
        {responses && responses.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
            <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" /> Your Recordings
            </h3>
            <div className="space-y-4">
              {responses.map((r, idx) => {
                const lrResponse = r as ListenRepeatResponse;
                return (
                  <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                    <p className="text-sm font-medium text-gray-300 mb-2">"{lrResponse.prompt}"</p>
                    <AudioPlayer blob={r.audioBlob} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── INTERVIEW ──
  const data = result as InterviewEvaluation;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overall score card */}
      <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/60 rounded-3xl border border-purple-500/20 p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-2">Interview Complete</h2>
          <p className="text-purple-200/80 leading-relaxed">{data.overall.summary}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center min-w-[140px] border border-white/10">
          <div className="text-5xl font-black text-white mb-1">
            {data.overall.score_0_5}
          </div>
          <div className="text-purple-200/60 font-medium tracking-wider uppercase text-xs">
            Overall Score
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Response Breakdown</h3>
        {data.per_question.map((q, idx) => (
          <div
            key={idx}
            className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <h4 className="font-semibold text-gray-200">
                Q{idx + 1}: {q.q}
              </h4>
              <ScoreBadge score={q.score_0_5} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl">
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </p>
                <p className="text-sm text-gray-300">{q.strengths}</p>
              </div>
              <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-xl">
                <p className="text-xs font-semibold text-red-300 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Issues
                </p>
                <p className="text-sm text-gray-300">{q.issues}</p>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl">
              <p className="text-xs font-semibold text-blue-300 mb-1">Suggested Rewrite:</p>
              <p className="text-sm text-gray-200 italic">{q.suggested_rewrite}</p>
            </div>

            {/* Audio player embed */}
            {responses && responses[idx] && (
              <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4">
                 <p className="text-xs font-semibold text-gray-400">Your Response:</p>
                 <AudioPlayer blob={responses[idx].audioBlob} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action items */}
      {data["5_targeted_actions_next_week"]?.length > 0 && (
        <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-400" /> 5 Targeted Actions This Week
          </h3>
          <ul className="space-y-2">
            {data["5_targeted_actions_next_week"].map((action, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-xl border border-gray-700/30"
              >
                <span className="font-bold text-indigo-400 shrink-0">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary + Grammar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.vocabulary_upgrades?.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Vocabulary Upgrades
            </h3>
            <ul className="space-y-3">
              {data.vocabulary_upgrades.map((v, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-red-400 line-through">{v.from}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-emerald-400 font-bold">{v.to}</span>
                  </div>
                  <p className="text-gray-500 italic text-xs">&quot;{v.example_sentence}&quot;</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.grammar_fixes?.length > 0 && (
          <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> Grammar Fixes
            </h3>
            <ul className="space-y-3">
              {data.grammar_fixes.map((g, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 text-sm border-b border-gray-800 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-red-400 bg-red-500/10 px-1 rounded">{g.error}</span>
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
      </div>
    </div>
  );
}
