"use client";

import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShadowModeProps {
  promptText: string;
  transcriptText: string;
}

/**
 * Inline word-level diff visualizer for Listen & Repeat.
 * Shows which words matched, were missed, or were substituted.
 */
export default function ShadowMode({ promptText, transcriptText }: ShadowModeProps) {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const promptWords = normalize(promptText);
  const transcriptWords = normalize(transcriptText);

  const matchedCount = promptWords.filter((w) => transcriptWords.includes(w)).length;
  const accuracy = promptWords.length > 0 ? Math.round((matchedCount / promptWords.length) * 100) : 0;

  const renderedPrompt = promptWords.map((word, index) => {
    const isMatched = transcriptWords.includes(word);
    return (
      <span
        key={`${word}-${index}`}
        className={cn(
          "inline-block mr-1 px-1.5 py-0.5 rounded text-sm font-medium transition-all",
          isMatched
            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
            : "bg-red-500/15 text-red-300 border border-red-500/20 line-through decoration-red-400/50"
        )}
      >
        {word}
      </span>
    );
  });

  return (
    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-5 space-y-4">
      {/* Header with accuracy */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-400" />
          Quick Analysis
        </h3>
        <div
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            accuracy >= 80
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              : accuracy >= 50
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                : "bg-red-500/15 text-red-300 border border-red-500/20"
          )}
        >
          {accuracy}% Match
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Target Sentence
          </h4>
          <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800 leading-relaxed">
            {promptText}
          </p>
        </div>
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            What We Heard
          </h4>
          <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-800 leading-relaxed italic">
            {transcriptText || "No speech detected."}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Word Match
        </h4>
        <div className="text-sm leading-loose break-words">{renderedPrompt}</div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" /> Matched
          </span>
          <span className="flex items-center gap-1">
            <X className="w-3 h-3 text-red-400" /> Missing
          </span>
        </div>
      </div>
    </div>
  );
}
