"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AudioRecorder from "./AudioRecorder";
import ShadowMode from "./ShadowMode";
import SpeakingTimer from "./SpeakingTimer";
import { ChevronRight, Volume2, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListenRepeatResponse } from "@/types/speaking.types";

interface ListenRepeatRunnerProps {
  prompts?: string[];
  onComplete: (results: ListenRepeatResponse[]) => void;
}

const DEFAULT_PROMPTS = [
  "The quickly shifting weather patterns made planning the outdoor event difficult.",
  "Advances in artificial intelligence are transforming modern medicine.",
  "She realized too late that she had left her essential documents on the kitchen counter.",
  "Despite the heavy rain, the marathon runners maintained an impressive pace.",
  "Understanding complex grammatical structures requires consistent practice and exposure.",
  "The professor explained the intricate relationship between economics and environmental policy.",
  "He argued that public transportation should be fully subsidized by the local government.",
];

/** Approx. base time for the L&R section (seconds) */
const SECTION_TIME = 300; // 5 minutes
const RESPONSE_TIME_PER_ITEM = 20; // seconds to record each item

/**
 * Listen & Repeat runner — plays prompts via TTS, records user repetition,
 * shows real-time ShadowMode diff, and advances automatically.
 */
export default function ListenRepeatRunner({
  prompts = DEFAULT_PROMPTS,
  onComplete,
}: ListenRepeatRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ListenRepeatResponse[]>([]);
  const [phase, setPhase] = useState<"idle" | "playing" | "recording" | "review">("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [sectionStarted, setSectionStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultsRef = useRef<ListenRepeatResponse[]>([]);

  const currentPrompt = prompts[currentIndex];
  const isFinished = currentIndex >= prompts.length;

  const playPrompt = useCallback(async () => {
    if (!currentPrompt) return;
    setPhase("playing");

    try {
      const url = "/api/tts?text=" + encodeURIComponent(currentPrompt);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPhase("recording");
      };

      audio.onerror = () => {
        // Fallback: proceed to recording anyway
        setPhase("recording");
      };

      await audio.play();
    } catch {
      setPhase("recording");
    }
  }, [currentPrompt]);

  // Auto-play on mount or index change
  useEffect(() => {
    if (isFinished) {
      onComplete(resultsRef.current);
      return;
    }
    if (!sectionStarted) return;

    const timer = setTimeout(playPrompt, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFinished, sectionStarted]);

  const handleRecordingComplete = (blob: Blob, transcript: string) => {
    setLastTranscript(transcript);
    setPhase("review");

    const newResult: ListenRepeatResponse = {
      prompt: currentPrompt,
      transcript,
      audioBlob: blob,
    };
    resultsRef.current = [...resultsRef.current, newResult];
    setResults(resultsRef.current);

    // Brief review then advance
    // Extended review phase so the user can see the result
    setTimeout(() => {
      setLastTranscript("");
      setPhase("idle");
      setCurrentIndex((prev) => prev + 1);
    }, 3500);
  };

  const handleTimerComplete = () => {
    // Section timer expired — finish with whatever we have
    onComplete(resultsRef.current);
  };

  // ── Pre-start screen ──
  if (!sectionStarted) {
    return (
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center min-h-[420px] p-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-center border border-gray-700/50 shadow-2xl w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Task 1: Listen &amp; Repeat
          </h1>
          <p className="text-gray-400 mb-2 max-w-md mx-auto leading-relaxed">
            You will hear <span className="text-white font-semibold">{prompts.length} sentences</span>.
            After each one, repeat exactly what you heard. Speak clearly.
          </p>
          <p className="text-xs text-gray-500 mb-8">
            Approx. {Math.ceil(SECTION_TIME / 60)} min • {RESPONSE_TIME_PER_ITEM}s per item
          </p>
          <button
            onClick={() => setSectionStarted(true)}
            className={cn(
              "px-8 py-3 rounded-xl font-semibold text-white",
              "bg-gradient-to-r from-blue-500 to-indigo-600",
              "hover:from-blue-600 hover:to-indigo-700",
              "shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            )}
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // ── Finished / Analyzing ──
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Analyzing your responses…
        </h2>
        <p className="text-gray-400">
          Please wait while the AI evaluates your pronunciation and intelligibility.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
      {/* Top bar: progress + section timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">Listen &amp; Repeat</h1>
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
            {currentIndex + 1} / {prompts.length}
          </span>
        </div>
        <SpeakingTimer
          seconds={SECTION_TIME}
          mode="section"
          isActive={true}
          onComplete={handleTimerComplete}
          compact
        />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / prompts.length) * 100}%` }}
        />
      </div>

      {/* Main area */}
      <div className="bg-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden min-h-[340px] flex flex-col">
        {/* Phase indicator strip */}
        <div
          className={cn(
            "px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase transition-colors duration-300",
            phase === "playing" && "bg-blue-500/20 text-blue-300",
            phase === "recording" && "bg-red-500/20 text-red-300",
            phase === "review" && "bg-emerald-500/20 text-emerald-300",
            phase === "idle" && "bg-gray-800/50 text-gray-500"
          )}
        >
          {phase === "idle" && "Get Ready…"}
          {phase === "playing" && "🔊 Listen carefully"}
          {phase === "recording" && "🎙️ Your turn — Repeat now"}
          {phase === "review" && "✓ Response captured"}
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          
          {/* Target Sentence Display - Always show during playing and recording so student can read */}
          {(phase === "playing" || phase === "recording") && (
            <div className="w-full max-w-2xl text-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 shadow-inner">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Sentence to Read &amp; Repeat
                </h3>
                <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
                  "{currentPrompt}"
                </p>
              </div>
            </div>
          )}

          {/* Playing phase */}
          {phase === "playing" && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center animate-pulse">
                <Volume2 className="w-10 h-10 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">Listening to prompt…</p>
            </div>
          )}

          {/* Recording phase */}
          {phase === "recording" && (
            <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
              <SpeakingTimer
                seconds={RESPONSE_TIME_PER_ITEM}
                mode="response"
                isActive={true}
              />
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                autoStart
                maxDuration={RESPONSE_TIME_PER_ITEM}
              />
            </div>
          )}

          {/* Review phase */}
          {phase === "review" && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ShadowMode promptText={currentPrompt} transcriptText={lastTranscript} />
              <div className="flex justify-center mt-4">
                <span className="flex items-center text-xs font-medium text-gray-500 gap-1">
                  Advancing <ChevronRight className="w-3 h-3 animate-bounce" />
                </span>
              </div>
            </div>
          )}

          {/* Idle */}
          {phase === "idle" && (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700" />
              <p className="text-sm text-gray-500">Preparing next prompt…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
