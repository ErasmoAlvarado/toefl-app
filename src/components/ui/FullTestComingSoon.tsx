"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Construction, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullTestComingSoonProps {
  /** The module name, e.g. "Reading", "Listening" */
  moduleName: string;
  /** The route to go back to, e.g. "/dashboard/reading" */
  backHref: string;
  /** Accent color class for the gradient, e.g. "from-blue-500 to-cyan-500" */
  accentGradient: string;
  /** Accent border/text class, e.g. "border-blue-500/20 text-blue-300" */
  accentStyle: string;
  /** Icon color */
  iconColor: string;
}

/**
 * Polished "Coming Soon" placeholder for Full Test routes.
 */
export function FullTestComingSoon({
  moduleName,
  backHref,
  accentGradient,
  accentStyle,
  iconColor,
}: FullTestComingSoonProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Decorative icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className={cn("absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 blur-xl", accentGradient)} />
          <div className={cn("relative w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-2xl", accentGradient)}>
            <Construction className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Full {moduleName} Test
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">Coming Soon</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
          The full timed {moduleName.toLowerCase()} test experience is being developed.
          You&apos;ll be able to simulate a complete TOEFL iBT {moduleName.toLowerCase()} section
          with realistic timing and conditions.
        </p>

        {/* Feature preview */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { icon: Clock, label: "Real timing" },
            { icon: Sparkles, label: "AI scoring" },
            { icon: Construction, label: "Full section" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-gray-900/80 backdrop-blur rounded-xl border border-gray-700/50 p-3 flex flex-col items-center gap-1.5"
            >
              <feature.icon className={cn("w-5 h-5", iconColor)} />
              <span className="text-xs text-gray-400 font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push(backHref)}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
            `bg-opacity-10 border ${accentStyle} hover:bg-opacity-20`
          )}
        >
          <ArrowLeft className="w-4 h-4" /> Back to {moduleName} Dashboard
        </button>
      </div>
    </div>
  );
}
