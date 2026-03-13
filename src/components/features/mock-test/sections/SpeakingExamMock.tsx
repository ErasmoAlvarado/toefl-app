"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MockSpeakingSection,
  MockTestPhase,
} from "@/types/mocktest.types";
import { Mic, Radio, Users, Volume2, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakingExamMockProps {
  data: MockSpeakingSection;
  startPhase: "speaking_listen_repeat" | "speaking_interview";
  onPhaseChange: (phase: MockTestPhase) => void;
  onComplete: (responses: {
    listenRepeat: { prompt: string; transcript: string }[];
    interview: { question: string; transcript: string }[];
  }) => void;
}

type SpeakingState = "idle" | "playing" | "recording" | "done";

export function SpeakingExamMock({
  data,
  startPhase,
  onPhaseChange,
  onComplete,
}: SpeakingExamMockProps) {
  const [lrIdx, setLrIdx] = useState(0);
  const [lrResults, setLrResults] = useState<{ prompt: string; transcript: string }[]>([]);
  const [ivIdx, setIvIdx] = useState(0);
  const [ivResults, setIvResults] = useState<{ question: string; transcript: string }[]>([]);

  const [speakState, setSpeakState] = useState<SpeakingState>("idle");
  const [currentTranscript, setCurrentTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  /** Speak text aloud using Web Speech API */
  const speakText = useCallback((text: string, onDone: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.onstart = () => setSpeakState("playing");
      utterance.onend = () => {
        setSpeakState("idle");
        onDone();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      onDone();
    }
  }, []);

  /** Start recording and speech recognition */
  const startRecording = useCallback(async () => {
    setCurrentTranscript("");
    setSpeakState("recording");

    // Start speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };
      recognitionRef.current = recognition;
      recognition.start();
    }

    // Start media recorder (for future playback in review)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.start();
    } catch {
      // microphone not available, continue without recording
    }
  }, []);

  /** Stop recording */
  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current.stop();
    }
    setSpeakState("done");
  }, []);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ── LISTEN & REPEAT ──
  if (startPhase === "speaking_listen_repeat") {
    const currentPrompt = data.listenAndRepeat[lrIdx];

    const handlePlayAndRecord = () => {
      speakText(currentPrompt, () => {
        // After playing the prompt, start recording
        startRecording();
      });
    };

    const handleStopAndNext = () => {
      stopRecording();
      const newResults = [...lrResults, { prompt: currentPrompt, transcript: currentTranscript }];
      setLrResults(newResults);
      setCurrentTranscript("");
      setSpeakState("idle");

      if (lrIdx < data.listenAndRepeat.length - 1) {
        setLrIdx(lrIdx + 1);
      } else {
        // Move to interview
        onPhaseChange("speaking_interview");
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-blue-300">Listen & Repeat</span>
          </div>
          <span>Item {lrIdx + 1} of {data.listenAndRepeat.length}</span>
        </div>

        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((lrIdx + 1) / data.listenAndRepeat.length) * 100}%` }}
          />
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
            {speakState === "playing" ? (
              <Volume2 className="w-10 h-10 text-blue-400 animate-pulse" />
            ) : speakState === "recording" ? (
              <Mic className="w-10 h-10 text-red-400 animate-pulse" />
            ) : (
              <Radio className="w-10 h-10 text-blue-400" />
            )}
          </div>

          <div>
            <p className="text-sm text-gray-400">
              {speakState === "idle" && "Click 'Play & Record' to hear the sentence, then repeat it."}
              {speakState === "playing" && "Listen carefully..."}
              {speakState === "recording" && "Now repeat what you heard:"}
              {speakState === "done" && "Recording saved!"}
            </p>
          </div>

          {/* Transcription display */}
          {(speakState === "recording" || speakState === "done") && currentTranscript && (
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Your speech</p>
              <p className="text-sm text-white">{currentTranscript}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {speakState === "idle" && (
              <button
                onClick={handlePlayAndRecord}
                className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Play & Record
              </button>
            )}
            {speakState === "recording" && (
              <button
                onClick={handleStopAndNext}
                className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop & Next
              </button>
            )}
            {speakState === "done" && (
              <button
                onClick={handleStopAndNext}
                className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── INTERVIEW ──
  const currentQuestion = data.interviewQuestions[ivIdx];

  const handlePlayQuestion = () => {
    speakText(currentQuestion, () => {
      startRecording();
    });
  };

  const handleStopInterview = () => {
    stopRecording();
    const newResults = [...ivResults, { question: currentQuestion, transcript: currentTranscript }];
    setIvResults(newResults);
    setCurrentTranscript("");
    setSpeakState("idle");

    if (ivIdx < data.interviewQuestions.length - 1) {
      setIvIdx(ivIdx + 1);
    } else {
      // Complete speaking section
      onComplete({
        listenRepeat: lrResults,
        interview: newResults,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-purple-300">Interview</span>
        </div>
        <span>Question {ivIdx + 1} of {data.interviewQuestions.length}</span>
      </div>

      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${((ivIdx + 1) / data.interviewQuestions.length) * 100}%` }}
        />
      </div>

      <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
          {speakState === "playing" ? (
            <Volume2 className="w-10 h-10 text-purple-400 animate-pulse" />
          ) : speakState === "recording" ? (
            <Mic className="w-10 h-10 text-red-400 animate-pulse" />
          ) : (
            <Users className="w-10 h-10 text-purple-400" />
          )}
        </div>

        <div>
          <p className="text-sm text-gray-400">
            {speakState === "idle" && "Click to hear the interview question, then respond."}
            {speakState === "playing" && "Listening to question..."}
            {speakState === "recording" && "Speak your answer now:"}
            {speakState === "done" && "Response recorded!"}
          </p>
        </div>

        {(speakState === "recording" || speakState === "done") && currentTranscript && (
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Your response</p>
            <p className="text-sm text-white">{currentTranscript}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {speakState === "idle" && (
            <button
              onClick={handlePlayQuestion}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white hover:from-purple-600 hover:to-fuchsia-700 transition-all flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Play Question & Record
            </button>
          )}
          {speakState === "recording" && (
            <button
              onClick={handleStopInterview}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop & Submit
            </button>
          )}
          {speakState === "done" && (
            <button
              onClick={handleStopInterview}
              className="py-3 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              {ivIdx < data.interviewQuestions.length - 1 ? "Next Question →" : "Complete Test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
