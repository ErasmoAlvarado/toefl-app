"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface WritingComparisonProps {
  userText: string;
  improvedText: string;
}

/**
 * Side-by-side comparison of the user's response and the AI-improved version.
 */
export default function WritingComparison({
  userText,
  improvedText,
}: WritingComparisonProps) {
  return (
    <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <ArrowUpRight className="w-4 h-4 text-indigo-400" />
        Compare Your Response
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
          <p className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">
            Your Version
          </p>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {userText}
          </p>
        </div>
        <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/15">
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
            Improved Version
          </p>
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
            {improvedText}
          </p>
        </div>
      </div>
    </div>
  );
}
