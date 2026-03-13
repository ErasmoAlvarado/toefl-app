"use client";

import React from "react";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestRulesProps {
  onAccept: () => void;
  onBack: () => void;
}

const RULES = [
  {
    icon: Clock,
    title: "Timed Sections",
    description:
      "Each section has a strict time limit. Reading ~35 min, Listening ~36 min, Writing ~29 min, Speaking ~16 min.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Ban,
    title: "No Pausing",
    description:
      "Once the test begins you cannot pause. The timer runs continuously through each section.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: ArrowLeft,
    title: "No Going Back",
    description:
      "You cannot return to previous questions within a section or revisit completed sections.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Shield,
    title: "Adaptive Testing (MST)",
    description:
      "Reading and Listening use Multi-Stage Testing. Your performance on the Router module determines whether you receive the Upper or Lower second-stage module.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Unscored Items",
    description:
      "Some items may be unscored tryout items used for test development. You won't know which ones, so treat every question seriously.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

export default function TestRules({ onAccept, onBack }: TestRulesProps) {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Test Rules</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">
          Please review these rules carefully before starting your Full Mock Test.
          This simulates the real TOEFL iBT experience.
        </p>
      </div>

      {/* Rules list */}
      <div className="space-y-4 mb-8">
        {RULES.map((rule, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-start gap-4 p-5 rounded-2xl border backdrop-blur",
              rule.bg
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                rule.bg
              )}
            >
              <rule.icon className={cn("w-5 h-5", rule.color)} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rule.title}</h3>
              <p className="text-slate-600 dark:text-gray-400 text-xs leading-relaxed mt-0.5">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Section order */}
      <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5 mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Section Order</h3>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {["Reading", "Listening", "Writing", "Speaking"].map(
            (section, idx) => (
              <React.Fragment key={section}>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-200 font-medium border border-slate-200 dark:border-gray-700/50">
                  {section}
                </span>
                {idx < 3 && (
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600" />
                )}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
        >
          Go Back
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />I Understand — Continue
        </button>
      </div>
    </div>
  );
}
