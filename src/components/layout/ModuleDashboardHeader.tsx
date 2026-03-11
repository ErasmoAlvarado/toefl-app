"use client"

import React from "react"
import { Brain, Play, Sparkles } from "lucide-react"

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
  isGenerating = false
}: ModuleDashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            {description}
          </p>
          
          {stats && (
            <div className="flex flex-wrap gap-4 mt-4">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onGenerateAI}
            disabled={isGenerating}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-primary to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating Content..." : "Generate by AI"}
          </button>
          
          <button 
            onClick={onStartFullTest}
            className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-sm font-bold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            {fullTestLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
