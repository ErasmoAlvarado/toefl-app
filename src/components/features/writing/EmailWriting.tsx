"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Mail,
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import WritingEditor from "./WritingEditor";
import WritingFeedback from "./WritingFeedback";
import { saveWritingSession } from "@/actions/writing.actions";
import type { EmailEvaluation, EmailScenario } from "@/types/writing.types";

/** Sample scenario (in production, this would come from Gemini or a DB) */
const SAMPLE_SCENARIO: EmailScenario = {
  context:
    "You recently moved to a new apartment near campus but discovered that the heating system is not working properly. You have contacted the building management office once before, but the issue was not resolved.",
  instructions:
    "Write an email to the building manager explaining the situation, describing the problem in detail, and requesting that it be fixed as soon as possible.",
  recipientName: "Mr. Henderson",
  recipientRelation: "Building Manager",
};

/** Social conventions checklist items */
const SOCIAL_CHECKLIST = [
  { id: "greeting", label: "Appropriate greeting" },
  { id: "closing", label: "Appropriate closing" },
  { id: "politeness", label: "Polite & respectful tone" },
  { id: "requestClarity", label: "Clear request/purpose" },
];

interface EmailWritingProps {
  initialScenario?: EmailScenario;
}

/**
 * EmailWriting Runner — editor with timer, word count, social conventions checklist.
 */
export default function EmailWriting({ initialScenario }: EmailWritingProps) {
  const router = useRouter();
  const scenario = initialScenario || SAMPLE_SCENARIO;
  const [emailText, setEmailText] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EmailEvaluation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleChecklist = useCallback((id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!emailText.trim()) return;
    stopTimer();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ai/evaluate-writing-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailText,
          scenario: `${scenario.context}\n\nInstructions: ${scenario.instructions}\nRecipient: ${scenario.recipientName} (${scenario.recipientRelation})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        // Clear draft
        localStorage.removeItem("writing_draft_email");
      }
    } catch (err) {
      console.error("Email evaluation error:", err);
    }
    setIsSubmitting(false);
  }, [emailText, stopTimer]);

  const handleSaveAndReturn = useCallback(async () => {
    setIsSaving(true);
    await saveWritingSession({
      taskType: "email",
      score: evaluation?.score_0_5 || 0,
      maxScore: 5,
      timeSpentSeconds: elapsedSeconds,
      details: {
        emailText,
        scenario,
        evaluation,
      },
    });
    setIsSaving(false);
    router.push("/practice/writing");
  }, [evaluation, elapsedSeconds, emailText, router]);

  // ── EVALUATION RESULTS ──
  if (evaluation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <WritingFeedback type="email" result={evaluation} userText={emailText} />
        <button
          onClick={handleSaveAndReturn}
          disabled={isSaving}
          className={cn(
            "w-full py-3.5 rounded-xl font-semibold text-sm",
            "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300",
            "hover:bg-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Save & Return <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  // ── WRITING SCREEN ──
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/practice/writing")}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scenario Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Write an Email</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              {scenario.context}
            </p>
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/30">
              <p className="text-sm text-emerald-300 font-medium">
                {scenario.instructions}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To: {scenario.recipientName} ({scenario.recipientRelation})
              </p>
            </div>
          </div>

          {/* Editor */}
          <WritingEditor
            value={emailText}
            onChange={setEmailText}
            placeholder={`Dear ${scenario.recipientName},\n\nI am writing to...`}
            draftKey="email"
            minHeight={280}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!emailText.trim() || isSubmitting}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
              emailText.trim()
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                : "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating with
                AI…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit for Evaluation
              </>
            )}
          </button>
        </div>

        {/* Sidebar: Checklist */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-700/50 p-6 sticky top-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Social Conventions Checklist
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Make sure your email includes these elements before submitting.
            </p>
            <ul className="space-y-3">
              {SOCIAL_CHECKLIST.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    {checklist[item.id] ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" />
                    )}
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        checklist[item.id]
                          ? "text-emerald-300"
                          : "text-gray-400 group-hover:text-gray-300"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-800">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tips
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li>• Use a formal or semi-formal register</li>
                <li>• Clearly state the purpose in the first paragraph</li>
                <li>• Include specific details about the issue</li>
                <li>• End with a clear request or call to action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
