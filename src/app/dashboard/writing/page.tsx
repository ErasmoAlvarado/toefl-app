"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModuleDashboardHeader } from "@/components/layout/ModuleDashboardHeader"
import { WritingList } from "@/components/features/writing/WritingList"
import { fetchWritingPrompts, WritingPromptRow } from "@/actions/shared.actions"
import { toast } from "sonner"

export default function WritingPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Partial<WritingPromptRow>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function loadPrompts() {
      const result = await fetchWritingPrompts()
      if (result.success && result.data) {
        setPrompts(result.data)
      } else {
        toast.error("Failed to load writing prompts")
      }
      setIsLoading(false)
    }
    loadPrompts()
  }, [])

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/writing", { method: "POST" })
      const result = await response.json()
      
      if (result.success) {
        toast.success("New writing prompt generated!")
        const updated = await fetchWritingPrompts()
        if (updated.success) setPrompts(updated.data || [])
      } else {
        toast.error(result.error || "Failed to generate prompt")
      }
    } catch (error) {
      toast.error("An error occurred during generation")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartFullTest = () => {
    router.push("/practice/writing/full-test")
  }

  return (
    <div className="flex flex-col space-y-10 max-w-6xl mx-auto pb-20">
      <ModuleDashboardHeader 
        title="Writing Section"
        description="Write academic essays based on reading and listening materials. Demonstrate your ability to synthesize information and support an opinion."
        stats={[
          { label: "Prompts", value: prompts.length },
          { label: "Total Time", value: "29 min" },
          { label: "Tasks", value: "2" }
        ]}
        onGenerateAI={handleGenerateAI}
        onStartFullTest={handleStartFullTest}
        fullTestLabel="Start Full Test (29m)"
        isGenerating={isGenerating}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl border border-border" />
        </div>
      ) : (
        <WritingList initialPrompts={prompts} />
      )}
    </div>
  )
}
