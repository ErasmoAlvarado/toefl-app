"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AudioRecorder from "./AudioRecorder";
import SpeakingTimer from "./SpeakingTimer";
import { Loader2, MessageSquare, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewResponse } from "@/types/speaking.types";

interface InterviewRunnerProps {
  questions?: string[];
  onComplete: (results: InterviewResponse[]) => void;
}

const DEFAULT_QUESTIONS = [
  "Can you tell me about the town or city where you grew up?",
  "Describe an experience where you had to lead a group or a project. What did you learn?",
  "If you could change one thing about the educational system in your country, what would it be and why?",
  "Some people believe technology has made us more isolated, while others argue it has connected us more than ever. What is your opinion?",
];

const QUESTION_CATEGORIES = ["Factual", "Experience", "Hypothetical", "Opinion"];

const PREPARATION_TIME = 15;
const RESPONSE_TIME = 45;
const SECTION_TIME = 480; // ~8 minutes total

/**
 * Take an Interview runner — simulates a TOEFL iBT interview with 4 questions.
 * Plays TTS question → preparation countdown → recording with timer → saves.
 */
export default function InterviewRunner({
  questions = DEFAULT_QUESTIONS,
  onComplete,
}: InterviewRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<InterviewResponse[]>([]);
  const resultsRef = useRef<InterviewResponse[]>([]);
  const [phase, setPhase] = useState<
    "pre_start" | "playing_tts" | "preparation" | "recording" | "transition"
  >("pre_start");
  const [transcript, setTranscript] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const playQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    setPhase("playing_tts");
    try {
      const url = "/api/tts?text=" + encodeURIComponent(currentQuestion);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setPhase("preparation");
      audio.onerror = () => setPhase("preparation");
      await audio.play();
    } catch {
      setPhase("preparation");
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (isFinished) {
      onComplete(resultsRef.current);
      return;
    }
    if (phase === "pre_start") return;
    if (phase === "playing_tts") return; // already triggered

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFinished]);

  const handleStart = () => {
    playQuestion();
  };

  const handlePrepComplete = () => {
    setPhase("recording");
  };

  const handleRecordingComplete = (blob: Blob, text: string) => {
    setTranscript(text);
    const newResult: InterviewResponse = {
      question: currentQuestion,
      transcript: text,
      audioBlob: blob,
    };
    resultsRef.current = [...resultsRef.current, newResult];
    setResults(resultsRef.current);
    setPhase("transition");

    setTimeout(() => {
      setTranscript("");
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex < questions.length) {
        // Auto-play next question after a brief pause
        setTimeout(() => {
          setPhase("playing_tts");
          const url =
            "/api/tts?text=" + encodeURIComponent(questions[nextIndex]);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setPhase("preparation");
          audio.onerror = () => setPhase("preparation");
          audio.play().catch(() => setPhase("preparation"));
        }, 500);
      }
    }, 2000);
  };

  const handleSectionTimeUp = () => {
    onComplete(resultsRef.current);
  };

  // ── Pre-start ──
  if (phase === "pre_start") {
    return (
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-[420px] p-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-center border border-gray-700/50 shadow-2xl w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Task 2: Take an Interview
          </h1>
          <p className="text-gray-400 mb-2 max-w-md mx-auto leading-relaxed">
            An AI interviewer will ask you{" "}
            <span className="text-white font-semibold">{questions.length} questions</span>{" "}
            progressing from factual to opinion-based. You&apos;ll have{" "}
            <span className="text-white font-semibold">{PREPARATION_TIME}s</span> to
            prepare and{" "}
            <span className="text-white font-semibold">{RESPONSE_TIME}s</span> to
            respond.
          </p>
          <div className="flex flex-wrap gap-2 justify-center my-6">
            {QUESTION_CATEGORIES.map((cat, i) => (
              <span
                key={cat}
                className="text-xs px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400"
              >
                Q{i + 1}: {cat}
              </span>
            ))}
          </div>
          <button
            onClick={handleStart}
            className={cn(
              "px-8 py-3 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-purple-500 to-pink-600",
              "hover:from-purple-600 hover:to-pink-700",
              "shadow-lg shadow-purple-500/25 transition-all active:scale-95"
            )}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // ── Finished ──
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Generating Feedback…
        </h2>
        <p className="text-gray-400">
          Evaluating your interview responses and compiling actionable tips.
        </p>
      </div>
    );
  }

  const phaseConfig = {
    playing_tts: { bg: "bg-blue-500/20", text: "text-blue-300", label: "🔊 Interviewer Speaking…" },
    preparation: { bg: "bg-amber-500/20", text: "text-amber-300", label: "📝 Preparation Time" },
    recording: { bg: "bg-red-500/20", text: "text-red-300", label: "🎙️ Recording — Speak Now" },
    transition: { bg: "bg-emerald-500/20", text: "text-emerald-300", label: "✓ Response Saved" },
    pre_start: { bg: "bg-gray-800", text: "text-gray-500", label: "" },
  };

  const currentPhaseConfig = phaseConfig[phase];

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Interview</h1>
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
            Q{currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700">
            {QUESTION_CATEGORIES[currentIndex] || "General"}
          </span>
        </div>
        <SpeakingTimer
          seconds={SECTION_TIME}
          mode="section"
          isActive={true}
          onComplete={handleSectionTimeUp}
          compact
        />
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Main card */}
      <div className="bg-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
        {/* Phase banner */}
        <div
          className={cn(
            "px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase transition-colors duration-300",
            currentPhaseConfig.bg,
            currentPhaseConfig.text
          )}
        >
          {currentPhaseConfig.label}
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center gap-6">
          {/* Question display */}
          {(phase === "preparation" || phase === "recording") && (
            <div className="text-center space-y-4 w-full animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                <MessageSquare className="w-3 h-3" />
                Interviewer asked:
              </div>
              <h2 className="text-xl font-semibold text-gray-100 leading-relaxed max-w-xl mx-auto">
                &quot;{currentQuestion}&quot;
              </h2>
            </div>
          )}

          {/* Preparation timer */}
          {phase === "preparation" && (
            <div className="animate-in fade-in duration-300">
              <SpeakingTimer
                seconds={PREPARATION_TIME}
                mode="preparation"
                isActive={true}
                onComplete={handlePrepComplete}
              />
              <p className="text-center text-xs text-gray-500 mt-3">
                Organize your thoughts before speaking
              </p>
            </div>
          )}

          {/* Recording */}
          {phase === "recording" && (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in duration-300">
              <SpeakingTimer
                seconds={RESPONSE_TIME}
                mode="response"
                isActive={true}
              />
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                autoStart
                maxDuration={RESPONSE_TIME}
              />
            </div>
          )}

          {/* TTS playing */}
          {phase === "playing_tts" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center animate-pulse">
                <Users className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">
                Listen to the interviewer&apos;s question…
              </p>
            </div>
          )}

          {/* Transition */}
          {phase === "transition" && (
            <div className="text-center animate-in fade-in duration-300">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-200">Response Saved</p>
              {transcript && (
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto italic">
                  &quot;{transcript.slice(0, 100)}{transcript.length > 100 ? "…" : ""}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
