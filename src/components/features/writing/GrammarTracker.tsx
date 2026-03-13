"use client";

import React from "react";
import { Target, ChevronRight } from "lucide-react";

interface GrammarError {
  error: string;
  correction: string;
  why: string;
}

interface GrammarTrackerProps {
  errors: GrammarError[];
  title?: string;
}

/**
 * Displays tracked grammar errors per writing attempt for pattern awareness.
 */
export default function GrammarTracker({
  errors,
  title = "Grammar Error Tracker",
}: GrammarTrackerProps) {
  if (!errors || errors.length === 0) {
    return (
      <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          No grammar errors detected — excellent work!
        </p>
      </div>
    );
  }

  // Count unique error types
  const errorCounts = errors.reduce(
    (acc, err) => {
      const key = err.error.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedErrors = Object.entries(errorCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6 animate-in fade-in duration-300">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-red-400" />
        {title}
      </h3>

      {/* Frequency indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sortedErrors.map(([errorType, count]) => (
          <span
            key={errorType}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20"
          >
            {errorType}{" "}
            {count > 1 && (
              <span className="text-red-400/70">×{count}</span>
            )}
          </span>
        ))}
      </div>

      {/* Detailed list */}
      <ul className="space-y-3">
        {errors.map((g, i) => (
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
  );
}
