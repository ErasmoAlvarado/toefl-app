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
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">Generate New Passage with AI</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Enter a topic and our AI will create a completely new, university-level TOEFL reading passage with 10 questions.
      </p>
      
      <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Photosynthesis, Campus Maps, Economics (Leave blank for random)"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
        <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  )
}
