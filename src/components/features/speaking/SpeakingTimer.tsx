"use client";

import React, { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakingTimerProps {
  /** Total seconds for this timer */
  seconds: number;
  /** Visual mode label */
  mode: "preparation" | "response" | "section";
  /** Callback when timer reaches 0 */
  onComplete?: () => void;
  /** Whether the timer is actively counting */
  isActive: boolean;
  /** Compact mode (no label, smaller) */
  compact?: boolean;
}

/**
 * Countdown timer with progress bar, warning animation, and optional mm:ss format.
 */
export default function SpeakingTimer({
  seconds,
  mode,
  onComplete,
  isActive,
  compact = false,
}: SpeakingTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset on prop change
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds, isActive]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (isActive && timeLeft <= 0 && onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const percentage = seconds > 0 ? (timeLeft / seconds) * 100 : 0;
  const isWarning = timeLeft <= 5 && timeLeft > 0;
  const isCritical = timeLeft <= 3 && timeLeft > 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const modeLabel =
    mode === "preparation"
      ? "Preparation"
      : mode === "section"
        ? "Section"
        : "Response";

  const barColor =
    isCritical
      ? "bg-red-500"
      : isWarning
        ? "bg-amber-500"
        : mode === "preparation"
          ? "bg-sky-500"
          : mode === "section"
            ? "bg-indigo-500"
            : "bg-emerald-500";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Clock
          className={cn(
            "w-4 h-4",
            isCritical ? "text-red-500 animate-pulse" : "text-gray-400"
          )}
        />
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            isCritical ? "text-red-500" : isWarning ? "text-amber-500" : "text-gray-300"
          )}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Clock
          className={cn(
            "w-4 h-4",
            isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-amber-500" : "text-gray-400"
          )}
        />
        <span className="text-gray-400">{modeLabel}:</span>
        <span
          className={cn(
            "font-mono text-base",
            isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-gray-200"
          )}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            barColor,
            isCritical && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
