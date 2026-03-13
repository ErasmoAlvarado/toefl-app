"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ListenRepeatRunner from "@/components/features/speaking/ListenRepeatRunner";
import InterviewRunner from "@/components/features/speaking/InterviewRunner";
import SpeakingFeedback from "@/components/features/speaking/SpeakingFeedback";
import { toast } from "sonner";
import { saveSpeakingSession } from "@/actions/speaking.actions";
import { fetchSpeakingPromptById } from "@/actions/shared.actions";
import { ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ListenRepeatEvaluation,
  InterviewEvaluation,
  ListenRepeatResponse,
  InterviewResponse,
} from "@/types/speaking.types";

type EvaluationResult = ListenRepeatEvaluation | InterviewEvaluation | null;

export default function SpeakingPracticeByIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const startTimeRef = useRef(Date.now());

  const [prompt, setPrompt] = useState<{ prompt_text: string; type: string } | null>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionResponses, setSessionResponses] = useState<(ListenRepeatResponse | InterviewResponse)[]>([]);

  useEffect(() => {
    async function loadPrompt() {
      const res = await fetchSpeakingPromptById(id);
      if (res.success && res.data) {
        setPrompt(res.data);
      } else {
        setLoadError(res.error || "Prompt not found.");
      }
      setIsLoadingPrompt(false);
    }
    loadPrompt();
  }, [id]);

  /** Determine task type based on the prompt's `type` field */
  const taskType: "listen_and_repeat" | "interview" =
    prompt?.type === "interview" ? "interview" : "listen_and_repeat";

  const getPromptsArray = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Ignore parse error, return as single item array
    }
    return [text];
  };

  // ── Listen & Repeat handler ──
  const handleListenRepeatComplete = async (responses: ListenRepeatResponse[]) => {
    if (responses.length === 0) { toast.error("No responses recorded."); return; }
    setSessionResponses(responses);
    setIsEvaluating(true);
    try {
      toast.loading("Evaluating with AI…", { id: "eval" });
      const firstResponse = responses[0];
      const res = await fetch("/api/ai/evaluate-speaking-listen-repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: firstResponse.prompt, transcript: firstResponse.transcript || "" }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `Evaluation failed with status ${res.status}`);
      }
      const data = await res.json();
      toast.dismiss("eval");
      if (data.success && data.evaluation) {
        setResult(data.evaluation as ListenRepeatEvaluation);
        toast.success("Evaluation complete!");
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        await saveSpeakingSession({
          taskType: "listen_and_repeat", score: data.evaluation.score_0_5, maxScore: 5,
          timeSpentSeconds: elapsed,
          details: { totalItems: responses.length, transcripts: responses.map(r => ({ prompt: r.prompt, transcript: r.transcript })), evaluation: data.evaluation },
        });
      } else {
        toast.error("Evaluation failed: " + (data.error || "Unknown error"));
        setIsEvaluating(false);
      }
    } catch { toast.dismiss("eval"); toast.error("Network error during evaluation"); setIsEvaluating(false); }
  };

  // ── Interview handler ──
  const handleInterviewComplete = async (responses: InterviewResponse[]) => {
    if (responses.length === 0) { toast.error("No responses recorded."); return; }
    setSessionResponses(responses);
    setIsEvaluating(true);
    try {
      toast.loading("Evaluating your interview…", { id: "eval-interview" });
      const res = await fetch("/api/ai/evaluate-speaking-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: responses.map(r => r.question), transcripts: responses.map(r => r.transcript) }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `Interview eval failed with status ${res.status}`);
      }
      const data = await res.json();
      toast.dismiss("eval-interview");
      if (data.success && data.evaluation) {
        setResult(data.evaluation as InterviewEvaluation);
        toast.success("Evaluation complete!");
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        await saveSpeakingSession({
          taskType: "interview", score: data.evaluation.overall.score_0_5, maxScore: 5,
          timeSpentSeconds: elapsed,
          details: { totalQuestions: responses.length, transcripts: responses.map(r => ({ question: r.question, transcript: r.transcript })), evaluation: data.evaluation },
        });
      } else {
        toast.error("Evaluation failed: " + (data.error || "Unknown error"));
        setIsEvaluating(false);
      }
    } catch { toast.dismiss("eval-interview"); toast.error("Network error during evaluation"); setIsEvaluating(false); }
  };

  const handleRetry = () => {
    setResult(null);
    setIsEvaluating(false);
    startTimeRef.current = Date.now();
  };

  // ── Loading state ──
  if (isLoadingPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-gray-400">Loading prompt…</p>
        </div>
      </div>
    );
  }

  // ── Error state / Not Found ──
  if (loadError || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="bg-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 p-10 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Prompt Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">{loadError || "The speaking prompt you are looking for does not exist."}</p>
          <button
            onClick={() => router.push("/dashboard/speaking")}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all"
          >
            ← Back to Speaking Dashboard
          </button>
        </div>
      </div>
    );
  }

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

        {/* Render the appropriate runner or feedback */}
        {!result && !isEvaluating ? (
          taskType === "listen_and_repeat" ? (
            <ListenRepeatRunner
              prompts={getPromptsArray(prompt.prompt_text)}
              onComplete={handleListenRepeatComplete}
            />
          ) : (
            <InterviewRunner onComplete={handleInterviewComplete} />
          )
        ) : isEvaluating && !result ? (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] animate-in fade-in duration-500 bg-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 shadow-2xl">
            <Loader2 className={cn("w-12 h-12 animate-spin mb-4", taskType === "interview" ? "text-purple-400" : "text-indigo-400")} />
            <h2 className="text-2xl font-bold text-white mb-2">
              {taskType === "interview" ? "Generating Feedback…" : "Analyzing your responses…"}
            </h2>
            <p className="text-gray-400">
              {taskType === "interview"
                ? "Evaluating your interview responses and compiling actionable tips."
                : "Please wait while the AI evaluates your pronunciation and intelligibility."}
            </p>
          </div>
        ) : result ? (
          <SpeakingFeedback type={taskType} result={result} responses={sessionResponses} />
        ) : null}
      </div>
    </div>
  );
}
