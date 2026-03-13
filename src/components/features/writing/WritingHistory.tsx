"use client";

import React, { useEffect, useState } from "react";
import { Clock, PenLine, Puzzle, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWritingHistory } from "@/actions/writing.actions";
import type { WritingHistoryEntry } from "@/types/writing.types";

const typeConfig = {
  build_sentence: {
    label: "Build a Sentence",
    icon: Puzzle,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  academic_discussion: {
    label: "Discussion",
    icon: MessageSquare,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
};

/**
 * Sidebar component showing recent writing session history.
 */
export default function WritingHistory() {
  const [entries, setEntries] = useState<WritingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWritingHistory().then((res) => {
      if (res.success && res.data) setEntries(res.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-700/50 p-6">
      <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-emerald-400" />
        Recent Sessions
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <div
              key={k}
              className="h-16 bg-gray-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8">
          <PenLine className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No sessions yet. Start writing!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const config = typeConfig[entry.type] || typeConfig.email;
            const Icon = config.icon;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-gray-800/40 p-3 rounded-xl border border-gray-700/30 hover:border-gray-600/40 transition-colors"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    config.bg
                  )}
                >
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.date} • {entry.duration}
                  </p>
                </div>
                <div className="text-sm font-bold text-white">
                  {entry.score}/{entry.maxScore}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
