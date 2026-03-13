"use client";

import React, { useState, useTransition } from "react";
import MockTestEngine from "@/components/features/mock-test/MockTestEngine";
import { FullMockTestData } from "@/types/mocktest.types";
import { assembleMockTest } from "@/actions/mocktest.actions";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Clock,
  Zap,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Shuffle,
} from "lucide-react";

export default function FullTestPage() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<FullMockTestData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [assemblyError, setAssemblyError] = useState<string | null>(null);
  const [contentAvailability, setContentAvailability] = useState<{
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  } | null>(null);

  const handleStartRandomTest = () => {
    setAssemblyError(null);
    startTransition(async () => {
      const result = await assembleMockTest();
      if (result.contentAvailability) {
        setContentAvailability(result.contentAvailability);
      }
      if (result.success && result.data) {
        setSelectedTest(result.data);
      } else {
        setAssemblyError(result.error || "Failed to assemble mock test.");
      }
    });
  };

  if (selectedTest) {
    return (
      <MockTestEngine
        testData={selectedTest}
        onExit={() => setSelectedTest(null)}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Full Mock Test
            </h1>
            <p className="text-muted-foreground text-sm">
              Simulate the complete TOEFL iBT exam — updated January 2026 format
            </p>
          </div>
        </div>
      </div>

      {/* Section info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: "Reading", time: "35 min", color: "text-blue-400" },
          { icon: Headphones, label: "Listening", time: "36 min", color: "text-emerald-400" },
          { icon: PenTool, label: "Writing", time: "29 min", color: "text-purple-400" },
          { icon: Mic, label: "Speaking", time: "16 min", color: "text-amber-400" },
        ].map(({ icon: Icon, label, time, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xs font-bold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content availability */}
      {contentAvailability && (
        <div className="rounded-xl bg-muted/30 border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Content Available</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Reading", count: contentAvailability.reading, icon: BookOpen },
              { label: "Listening", count: contentAvailability.listening, icon: Headphones },
              { label: "Writing", count: contentAvailability.writing, icon: PenTool },
              { label: "Speaking", count: contentAvailability.speaking, icon: Mic },
            ].map(({ label, count, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <Icon className="w-4 h-4 mx-auto text-muted-foreground" />
                <p className="text-lg font-black text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {assemblyError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Cannot assemble test</p>
            <p className="text-xs text-destructive/80 mt-1">{assemblyError}</p>
          </div>
        </div>
      )}

      {/* Start button */}
      <div className="space-y-4">
        <button
          onClick={handleStartRandomTest}
          disabled={isPending}
          className="group w-full text-left p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-pink-500/10 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              {isPending ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <Shuffle className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                {isPending ? "Assembling your test..." : "Start Random Mock Test"}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isPending
                  ? "Randomly selecting content from your question bank..."
                  : "Assembles a unique test from your Supabase content each time"}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              ~2 hrs
            </div>
          </div>
        </button>

        <p className="text-[10px] text-center text-muted-foreground">
          Each test is randomly assembled from your content pool. Add more content in each section for greater variety.
        </p>
      </div>
    </div>
  );
}
