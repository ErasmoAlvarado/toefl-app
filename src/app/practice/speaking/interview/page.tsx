"use client";

import React, { useState, useRef } from "react";
import InterviewRunner from "@/components/features/speaking/InterviewRunner";
import SpeakingFeedback from "@/components/features/speaking/SpeakingFeedback";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveSpeakingSession } from "@/actions/speaking.actions";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewEvaluation, InterviewResponse } from "@/types/speaking.types";

export default function InterviewPracticePage() {
  const [result, setResult] = useState<InterviewEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionResponses, setSessionResponses] = useState<InterviewResponse[]>([]);
  const router = useRouter();
  const startTimeRef = useRef(Date.now());

  const handleComplete = async (responses: InterviewResponse[]) => {
    if (responses.length === 0) {
      toast.error("No responses recorded.");
      return;
    }

    setSessionResponses(responses);
    setIsEvaluating(true);

    const questions = responses.map((r) => r.question);
    const transcripts = responses.map((r) => r.transcript);

    try {
      toast.loading("Evaluating your interview…", { id: "eval-interview" });

      const res = await fetch("/api/ai/evaluate-speaking-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, transcripts }),
      });

      const data = await res.json();
      toast.dismiss("eval-interview");

      if (data.success && data.evaluation) {
        setResult(data.evaluation);
        toast.success("Evaluation complete!");

        // Save to database
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        await saveSpeakingSession({
          taskType: "interview",
          score: data.evaluation.overall.score_0_5,
          maxScore: 5,
          timeSpentSeconds: elapsed,
          details: {
            totalQuestions: responses.length,
            transcripts: responses.map((r) => ({
              question: r.question,
              transcript: r.transcript,
            })),
            evaluation: data.evaluation,
          },
        });
      } else {
        toast.error("Evaluation failed: " + (data.error || "Unknown error"));
        setIsEvaluating(false);
      }
    } catch {
      toast.dismiss("eval-interview");
      toast.error("Network error during evaluation");
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setIsEvaluating(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/speaking")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          {result && (
            <button
              onClick={handleRetry}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl",
                "bg-purple-500/10 border border-purple-500/20 text-purple-300",
                "hover:bg-purple-500/20 transition-all"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          )}
        </div>

        {/* Runner or Feedback */}
        {!result && !isEvaluating ? (
          <InterviewRunner onComplete={handleComplete} />
        ) : isEvaluating && !result ? (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] animate-in fade-in duration-500 bg-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 shadow-2xl">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Generating Feedback…</h2>
            <p className="text-gray-400">Evaluating your interview responses and compiling actionable tips.</p>
          </div>
        ) : result ? (
          <SpeakingFeedback type="interview" result={result} responses={sessionResponses} />
        ) : null}
      </div>
    </div>
  );
}
