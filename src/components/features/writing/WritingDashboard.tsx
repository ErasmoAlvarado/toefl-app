"use client";

import React from "react";
import {
  PenLine,
  ArrowRight,
  Sparkles,
  Mail,
  MessageSquare,
  Puzzle,
} from "lucide-react";
import WritingHistory from "./WritingHistory";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Main Writing Dashboard — entry point for all three writing task types.
 */
export default function WritingDashboard() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-cyan-900/30 rounded-3xl p-8 border border-emerald-500/20 shadow-2xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Writing Dojang
              </h1>
              <p className="text-xs text-emerald-300/60 font-medium">
                TOEFL iBT • Updated Jan 2026
              </p>
            </div>
          </div>
          <p className="text-gray-300/80 text-sm max-w-2xl leading-relaxed mt-2">
            Welcome to the Writing Dojang! Time to flex those linguistic muscles. Master the updated TOEFL iBT Writing tasks.{" "}
            <span className="text-teal-300 font-medium">
              Build a Sentence
            </span>{" "}
            to sharpen grammar,{" "}
            <span className="text-emerald-300 font-medium">Write an Email</span>{" "}
            for communicative fluency, or join an{" "}
            <span className="text-cyan-300 font-medium">
              Academic Discussion
            </span>
            .
          </p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 -mb-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Choose a Task
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task 1: Build a Sentence */}
            <div className="group bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:bg-teal-500/25 transition-colors">
                <Puzzle className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Build a Sentence
              </h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">
                10 items. Reorder word chunks to form grammatically correct
                sentences. Tests syntax, clause structure, and word order.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  ~8 min
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  10 items
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  Auto-scored
                </span>
              </div>
              <button
                onClick={() => router.push("/practice/writing/build-sentence")}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                  "bg-teal-500/10 border border-teal-500/20 text-teal-300",
                  "hover:bg-teal-500/20 hover:border-teal-500/30",
                  "flex items-center justify-center gap-2 transition-all"
                )}
              >
                Start Practice <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Task 2: Write an Email */}
            <div className="group bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/25 transition-colors">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Write an Email
              </h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">
                Write a short email in an academic or social context. Focuses on
                communicative purpose, social conventions, and register.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  ~10 min
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  1 email
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  Score 0–5
                </span>
              </div>
              <button
                onClick={() => router.push("/practice/writing/email")}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                  "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300",
                  "hover:bg-emerald-500/20 hover:border-emerald-500/30",
                  "flex items-center justify-center gap-2 transition-all"
                )}
              >
                Start Writing <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Task 3: Academic Discussion */}
            <div className="group bg-gray-900/80 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col h-full md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/25 transition-colors">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Academic Discussion
              </h3>
              <p className="text-sm text-gray-400 mb-5 flex-grow leading-relaxed">
                Read a professor's post and two student responses, then
                contribute your own opinion to the class discussion. Emphasizes
                engagement with peer ideas, elaboration, and academic register.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  ~10 min
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  1 post
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                  Score 0–5
                </span>
              </div>
              <button
                onClick={() =>
                  router.push("/practice/writing/academic-discussion")
                }
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                  "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300",
                  "hover:bg-cyan-500/20 hover:border-cyan-500/30",
                  "flex items-center justify-center gap-2 transition-all"
                )}
              >
                Join Discussion <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: History */}
        <div className="lg:col-span-1">
          <WritingHistory />
        </div>
      </div>
    </div>
  );
}
