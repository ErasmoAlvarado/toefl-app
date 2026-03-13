"use client";

import React, { useState, useRef } from "react";
import ListenRepeatRunner from "@/components/features/speaking/ListenRepeatRunner";
import SpeakingFeedback from "@/components/features/speaking/SpeakingFeedback";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveSpeakingSession } from "@/actions/speaking.actions";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListenRepeatEvaluation, ListenRepeatResponse } from "@/types/speaking.types";

export default function ListenRepeatPracticePage() {
  const [result, setResult] = useState<ListenRepeatEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const router = useRouter();
  const startTimeRef = useRef(Date.now());

  const handleComplete = async (responses: ListenRepeatResponse[]) => {
    if (responses.length === 0) {
      toast.error("No responses recorded.");
      return;
    }

    setIsEvaluating(true);

    try {
      toast.loading("Evaluating with AI…", { id: "eval" });

      // Evaluate the first item as a representative sample
      // (For batch evaluation, you'd send all items)
      const firstResponse = responses[0];
      const res = await fetch("/api/ai/evaluate-speaking-listen-repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: firstResponse.prompt,
          transcript: firstResponse.transcript || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `Evaluation failed with status ${res.status}`);
      }

      const data = await res.json();
      toast.dismiss("eval");

      if (data.success && data.evaluation) {
        setResult(data.evaluation);
        toast.success("Evaluation complete!");

        // Save to database
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        await saveSpeakingSession({
          taskType: "listen_and_repeat",
          score: data.evaluation.score_0_5,
          maxScore: 5,
          timeSpentSeconds: elapsed,
          details: {
            totalItems: responses.length,
            transcripts: responses.map((r) => ({
              prompt: r.prompt,
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
      toast.dismiss("eval");
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
                "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300",
                "hover:bg-indigo-500/20 transition-all"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          )}
        </div>

        {/* Runner or Feedback */}
        {!result && !isEvaluating ? (
          <ListenRepeatRunner onComplete={handleComplete} />
        ) : result ? (
          <SpeakingFeedback type="listen_and_repeat" result={result} />
        ) : null}
      </div>
    </div>
  );
}
