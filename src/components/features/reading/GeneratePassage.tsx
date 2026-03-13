"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function GeneratePassage({ onGenerationSuccess }: { onGenerationSuccess: () => void }) {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/generate/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to generate passage")
      }

      setTopic("")
      onGenerationSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-card-foreground">Generate New Passage with AI</h3>
      <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
        Enter a topic and our AI will create a completely new, university-level TOEFL reading passage with 10 questions.
      </p>
      
      <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Photosynthesis, Campus Maps, Economics (Leave blank for random)"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring transition-all duration-200"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-[0.97] h-11 px-5"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
              Generating...
            </span>
          ) : (
            "Generate Passage"
          )}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3.5 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium">
          {error}
        </div>
      )}
    </div>
  )
}
