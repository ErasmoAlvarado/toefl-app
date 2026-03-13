"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, transcript: string) => void;
  disabled?: boolean;
  /** Auto-start recording immediately on mount */
  autoStart?: boolean;
  /** Maximum recording time in seconds (auto-stop) */
  maxDuration?: number;
}

/**
 * AudioRecorder with:
 * - Real-time waveform visualization using AnalyserNode
 * - Web Speech API transcription (auto-restarts on silence)
 * - MediaRecorder for audio capture
 * - Graceful stop with transcript finalization delay
 */
export default function AudioRecorder({
  onRecordingComplete,
  disabled,
  autoStart = false,
  maxDuration,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const transcriptRef = useRef("");
  /** Best interim transcript — used as fallback if isFinal never fires for the last segment */
  const lastInterimRef = useRef("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);
  /** Flag: are we still actively recording? Used to auto-restart speech recognition. */
  const isRecordingRef = useRef(false);

  /** Draw the waveform on the canvas */
  const drawWaveform = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Gradient stroke
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#6366f1");
      gradient.addColorStop(0.5, "#8b5cf6");
      gradient.addColorStop(1, "#ec4899");

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
    }
  }, []);

  /** Finalize the transcript: use final transcript + best interim as fallback */
  const getFinalTranscript = useCallback(() => {
    let transcript = transcriptRef.current.trim();
    // If we have no final transcript but had interim results, use the last interim
    if (!transcript && lastInterimRef.current.trim()) {
      transcript = lastInterimRef.current.trim();
    }
    return transcript;
  }, []);

  const startRecording = useCallback(async () => {
    if (hasCompletedRef.current) return;
    transcriptRef.current = "";
    lastInterimRef.current = "";
    setLiveTranscript("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // ── Audio context for waveform ──
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ── MediaRecorder ──
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
        }
        cleanup();

        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          const finalTranscript = getFinalTranscript();
          onRecordingComplete(audioBlob, finalTranscript);
        }
      };

      mediaRecorder.start(250); // collect data every 250ms
      setIsRecording(true);
      isRecordingRef.current = true;
      drawWaveform();

      // ── Web Speech API ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        // Increase max alternatives for better recognition
        recognition.maxAlternatives = 1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          if (finalTranscript) {
            transcriptRef.current += " " + finalTranscript;
            lastInterimRef.current = ""; // Clear interim since we got a final
            setLiveTranscript(transcriptRef.current.trim());
          } else if (interimTranscript) {
            // Keep best interim as fallback
            lastInterimRef.current = interimTranscript;
            setLiveTranscript((transcriptRef.current + " " + interimTranscript).trim());
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (e: any) => {
          console.warn("SpeechRecognition error:", e.error);
          // "no-speech" is not fatal — just means silence was detected
          // "aborted" happens when we intentionally stop
          if (e.error !== "no-speech" && e.error !== "aborted") {
            console.error("Speech recognition fatal error:", e.error);
          }
        };

        // ── KEY FIX: Auto-restart recognition when it stops mid-recording ──
        recognition.onend = () => {
          // If we're still recording, restart speech recognition
          if (isRecordingRef.current && !hasCompletedRef.current) {
            try {
              recognition.start();
            } catch {
              // May fail if already started — that's OK
            }
          }
        };

        recognition.start();
      }

      // ── Auto-stop timer ──
      if (maxDuration && maxDuration > 0) {
        autoStopTimerRef.current = setTimeout(() => {
          stopRecording();
        }, maxDuration * 1000);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawWaveform, maxDuration, cleanup, getFinalTranscript]);

  const stopRecording = useCallback(() => {
    // Mark as no longer recording so speech recognition won't auto-restart
    isRecordingRef.current = false;
    setIsRecording(false);
    cleanup();

    // Stop speech recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
    }

    // Give a small delay for any pending final results from speech recognition
    // before stopping the MediaRecorder
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }, 600);
  }, [cleanup]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isRecording) {
      hasCompletedRef.current = false;
      const timer = setTimeout(startRecording, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      cleanup();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* noop */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [cleanup]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Waveform Canvas */}
      <div
        className={cn(
          "w-full rounded-2xl overflow-hidden transition-all duration-300",
          isRecording
            ? "h-20 bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-pink-950/80 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
            : "h-0"
        )}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={() => {
              hasCompletedRef.current = false;
              startRecording();
            }}
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-full",
              "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
              "text-white shadow-lg shadow-indigo-500/30",
              "transition-all duration-200 active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Mic size={28} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-full",
              "bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
              "text-white shadow-lg shadow-red-500/30",
              "transition-all duration-200 active:scale-95"
            )}
          >
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />
            <Square size={22} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Status text */}
      {isRecording && (
        <p className="text-sm font-medium text-red-400 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Recording…
        </p>
      )}

      {/* Live transcript */}
      {liveTranscript && (
        <div className="w-full max-w-lg bg-gray-900/60 backdrop-blur border border-gray-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Live Transcript
          </p>
          <p className="text-sm text-gray-200 leading-relaxed italic">
            {liveTranscript}
          </p>
        </div>
      )}
    </div>
  );
}
