"use client"

import React from "react"
import { Brain, Play, Sparkles, Loader2 } from "lucide-react"

interface ModuleDashboardHeaderProps {
  title: string
  description: string
  stats?: {
    label: string
    value: string | number
  }[]
  onGenerateAI?: () => void
  onStartFullTest?: () => void
  fullTestLabel?: string
  isGenerating?: boolean
}

export function ModuleDashboardHeader({
  title,
  description,
  stats,
  onGenerateAI,
  onStartFullTest,
  fullTestLabel = "Start Full Test",
  isGenerating = false,
  isAdmin = true
}: ModuleDashboardHeaderProps & { isAdmin?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      {/* Decorative background elements */}
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col gap-6">
        {/* Text content */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
            {description}
          </p>
          
          {stats && (
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 pt-4 border-t border-border/50">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="text-lg font-black text-foreground">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onGenerateAI && (
            <button 
              onClick={onGenerateAI}
              disabled={isGenerating || !isAdmin}
              title={!isAdmin ? "Admin access required for AI generation" : ""}
              className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg hover:bg-primary/90 active:scale-[0.97] disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-md"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Generating Content..." : !isAdmin ? "Admin Access Required" : "Generate by AI"}
            </button>
          )}
          
          <button 
            onClick={onStartFullTest}
            className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:bg-muted hover:shadow-md active:scale-[0.97]"
          >
            <Play className="h-4 w-4 fill-current" />
            {fullTestLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
