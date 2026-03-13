"use client";

import React from "react";
import { Mic, Users, ArrowRight, PlayCircle, Radio, Sparkles } from "lucide-react";
import SpeakingHistory from "./SpeakingHistory";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Main Speaking Dashboard — entry point for both task types.
 */
export default function SpeakingDashboard() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/30 rounded-3xl p-8 border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Speaking Stage</h1>
              <p className="text-xs text-indigo-300/60 font-medium">
                TOEFL iBT • Updated Jan 2026
              </p>
            </div>
          </div>
          <p className="text-gray-300/80 text-sm max-w-2xl leading-relaxed mt-2">
            Mic check, one, two! Ready to dazzle the world with your voice? Master the updated TOEFL iBT Speaking tasks. Practice{" "}
            <span className="text-blue-300 font-medium">Listen &amp; Repeat</span> drills
            to perfect your pronunciation, or take a full{" "}
            <span className="text-purple-300 font-medium">Simulated Interview</span>.
          </p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 -mb-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Start a Session
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task 1: Listen & Repeat */}
            <div className="group bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/25 transition-colors">
                <Radio className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Listen &amp; Repeat</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">
                7 items. Listen to a short sentence and repeat it exactly as you
                hear it. Focuses on intelligibility and pronunciation.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">~5 min</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">7 items</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Score 0–5</span>
              </div>
              <button
                onClick={() => router.push("/practice/speaking/listen_and_repeat")}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                  "bg-blue-500/10 border border-blue-500/20 text-blue-300",
                  "hover:bg-blue-500/20 hover:border-blue-500/30",
                  "flex items-center justify-center gap-2 transition-all"
                )}
              >
                Start Practice <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Task 2: Simulated Interview */}
            <div className="group bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/25 transition-colors">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Simulated Interview</h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">
                4 questions. A conversational AI asks questions progressing from
                factual to opinion-based. Evaluate your fluency, grammar, and vocabulary.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">~8 min</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">4 questions</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Score 0–5</span>
              </div>
              <button
                onClick={() => router.push("/practice/speaking/interview")}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                  "bg-purple-500/10 border border-purple-500/20 text-purple-300",
                  "hover:bg-purple-500/20 hover:border-purple-500/30",
                  "flex items-center justify-center gap-2 transition-all"
                )}
              >
                Start Interview <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: History */}
        <div className="lg:col-span-1">
          <SpeakingHistory />
        </div>
      </div>
    </div>
  );
}
