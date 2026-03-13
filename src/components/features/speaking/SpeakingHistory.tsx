"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Clock, Target, PlayCircle, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSpeakingHistory } from "@/actions/speaking.actions";
import type { SpeakingHistoryEntry } from "@/types/speaking.types";

interface SpeakingHistoryProps {
  /** Pre-loaded history (optional). If not provided, fetches from server. */
  history?: SpeakingHistoryEntry[];
}

/**
 * Displays the user's speaking practice history with scores and types.
 */
export default function SpeakingHistory({ history: initialHistory }: SpeakingHistoryProps) {
  const [historyData, setHistoryData] = useState<SpeakingHistoryEntry[]>(initialHistory || []);
  const [isLoading, setIsLoading] = useState(!initialHistory);

  useEffect(() => {
    if (initialHistory) return;

    async function loadHistory() {
      const result = await fetchSpeakingHistory();
      if (result.success && result.data) {
        setHistoryData(result.data);
      }
      setIsLoading(false);
    }
    loadHistory();
  }, [initialHistory]);

  const data = historyData;

  return (
    <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-700/50 p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Recent Performance
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your speaking scores over time
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      )}

      {/* History Items */}
      {!isLoading && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item) => {
            const isLR = item.type === "listen_and_repeat";
            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 rounded-xl border border-gray-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Score circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border",
                      item.score >= 4
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : item.score >= 3
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-red-500/15 text-red-300 border-red-500/30"
                    )}
                  >
                    {item.score}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                      {isLR ? (
                        <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      {isLR ? "Listen & Repeat" : "Interview"}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> {item.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            No speaking history yet. Start a practice session!
          </p>
        </div>
      )}
    </div>
  );
}
