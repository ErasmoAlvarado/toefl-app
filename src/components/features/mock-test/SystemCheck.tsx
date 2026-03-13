"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Mic, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemCheckProps {
  onComplete: () => void;
  onBack: () => void;
}

type CheckStatus = "pending" | "checking" | "pass" | "fail";

export default function SystemCheck({ onComplete, onBack }: SystemCheckProps) {
  const [audioStatus, setAudioStatus] = useState<CheckStatus>("pending");
  const [micStatus, setMicStatus] = useState<CheckStatus>("pending");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allPassed = audioStatus === "pass" && micStatus === "pass";

  /** Step 1: Play a test tone to check audio output */
  const checkAudio = () => {
    setAudioStatus("checking");
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 440; // A4 note
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
        setAudioStatus("pass");
      }, 1500);
    } catch {
      setAudioStatus("fail");
    }
  };

  /** Step 2: Record a short mic sample */
  const startMicCheck = async () => {
    setMicStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        setMicStatus("pass");
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (mr.state === "recording") mr.stop();
      }, 3000);
    } catch {
      setMicStatus("fail");
    }
  };

  const playRecording = () => {
    if (recordedUrl && audioRef.current) {
      audioRef.current.src = recordedUrl;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const StatusIcon = ({ status }: { status: CheckStatus }) => {
    if (status === "checking") return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    if (status === "pass") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (status === "fail") return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />;
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <audio ref={audioRef} hidden />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
          <Volume2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">System Check</h1>
        <p className="text-slate-600 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">
          We need to verify your audio and microphone before starting.
        </p>
      </div>

      {/* Check cards */}
      <div className="space-y-5 mb-8">
        {/* Audio Check */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Audio Output</h3>
            </div>
            <StatusIcon status={audioStatus} />
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-xs mb-4">
            Click the button below. You should hear a short tone.
          </p>
          <button
            onClick={checkAudio}
            disabled={audioStatus === "checking" || audioStatus === "pass"}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all",
              audioStatus === "pass"
                ? "bg-green-500/10 border border-green-500/20 text-green-300 cursor-default"
                : "bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
            )}
          >
            {audioStatus === "pass"
              ? "✓ Audio Working"
              : audioStatus === "checking"
              ? "Playing tone..."
              : "Play Test Tone"}
          </button>
        </div>

        {/* Mic Check */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Microphone</h3>
            </div>
            <StatusIcon status={micStatus} />
          </div>
          <p className="text-slate-600 dark:text-gray-400 text-xs mb-4">
            Click the button, say &quot;Hello, testing one two three,&quot; and verify playback.
          </p>
          <div className="flex gap-3">
            <button
              onClick={startMicCheck}
              disabled={micStatus === "checking" || micStatus === "pass" || isRecording}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all",
                micStatus === "pass"
                  ? "bg-green-500/10 border border-green-500/20 text-green-300 cursor-default"
                  : isRecording
                  ? "bg-red-500/10 border border-red-500/30 text-red-300"
                  : "bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
              )}
            >
              {micStatus === "pass"
                ? "✓ Mic Working"
                : isRecording
                ? "Recording (3s)..."
                : "Record Sample"}
            </button>
            {recordedUrl && (
              <button
                onClick={playRecording}
                className="py-3 px-5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
              >
                ▶ Play Back
              </button>
            )}
          </div>
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
          onClick={onComplete}
          disabled={!allPassed}
          className={cn(
            "flex-1 py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
            allPassed
              ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/20"
              : "bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500 cursor-not-allowed"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {allPassed ? "Ready to Begin" : "Complete checks above"}
        </button>
      </div>
    </div>
  );
}
