"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MockTestSection } from "@/types/mocktest.types";

interface SectionTransitionProps {
  fromSection: MockTestSection | "pre-test";
  toSection: MockTestSection;
  onContinue: () => void;
}

const SECTION_META: Record<
  MockTestSection,
  { name: string; color: string; gradient: string; time: string; description: string }
> = {
  reading: {
    name: "Reading",
    color: "text-blue-400",
    gradient: "from-blue-500 to-indigo-600",
    time: "~35 minutes",
    description: "Academic passages, daily-life texts, and Complete the Words items. Adaptive MST routing.",
  },
  listening: {
    name: "Listening",
    color: "text-emerald-400",
    gradient: "from-emerald-500 to-teal-600",
    time: "~36 minutes",
    description: "Choose a Response, Conversations, Announcements, and Academic Talks. Adaptive MST routing.",
  },
  writing: {
    name: "Writing",
    color: "text-purple-400",
    gradient: "from-purple-500 to-fuchsia-600",
    time: "~29 minutes",
    description: "Build a Sentence (10 items), Write an Email (1), and Academic Discussion (1).",
  },
  speaking: {
    name: "Speaking",
    color: "text-amber-400",
    gradient: "from-amber-500 to-orange-600",
    time: "~16 minutes",
    description: "Listen & Repeat (7 items) and Simulated Interview (4 questions).",
  },
};

export default function SectionTransition({
  fromSection,
  toSection,
  onContinue,
}: SectionTransitionProps) {
  const meta = SECTION_META[toSection];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500 text-center px-4">
      {fromSection !== "pre-test" && (
        <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
          {SECTION_META[fromSection].name} section complete
        </p>
      )}

      <div
        className={cn(
          "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-2xl",
          meta.gradient
        )}
      >
        <span className="text-3xl font-black text-white">
          {meta.name[0]}
        </span>
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
        {meta.name} Section
      </h1>
      <p className={cn("text-sm font-semibold mb-1", meta.color)}>
        {meta.time}
      </p>
      <p className="text-slate-600 dark:text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
        {meta.description}
      </p>

      <button
        onClick={onContinue}
        className={cn(
          "py-4 px-10 rounded-2xl font-bold text-sm bg-gradient-to-r text-white",
          "hover:shadow-xl transition-all flex items-center gap-2",
          meta.gradient
        )}
      >
        Begin {meta.name}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
