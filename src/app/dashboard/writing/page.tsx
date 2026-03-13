"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModuleDashboardHeader } from "@/components/layout/ModuleDashboardHeader"
import { WritingList } from "@/components/features/writing/WritingList"
import { fetchWritingPrompts, WritingPromptRow } from "@/actions/shared.actions"
import { getUserRole } from "@/actions/auth"
import { toast } from "sonner"
import { GenerationDialog } from "@/components/features/writing/GenerationDialog"

export default function WritingPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Partial<WritingPromptRow>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [{ data: promptsData, success }, roleData] = await Promise.all([
        fetchWritingPrompts(),
        getUserRole()
      ])
      
      if (success && promptsData) {
        setPrompts(promptsData)
      } else {
        toast.error("Failed to load writing prompts")
      }
      setIsAdmin(!!roleData.isAdmin)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleGenerateAI = async (options: { topic: string; taskType: string; difficulty: string }) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      })
      const result = await response.json()

      if (result.success) {
        toast.success("New writing prompt generated!")
        setIsDialogOpen(false)
        const updated = await fetchWritingPrompts()
        if (updated.success) setPrompts(updated.data || [])
      } else {
        toast.error(result.error || "Failed to generate prompt")
      }
    } catch {
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
        description="Master the updated TOEFL iBT 2026 Writing tasks: Build a Sentence, Write an Email, and Academic Discussion. Practice with AI-generated content."
        stats={[
          { label: "Prompts", value: prompts.length },
          { label: "Total Time", value: "29 min" },
          { label: "Tasks", value: "3" }
        ]}
        onGenerateAI={() => setIsDialogOpen(true)}
        onStartFullTest={handleStartFullTest}
        fullTestLabel="Start Full Test (29m)"
        isGenerating={isGenerating}
        isAdmin={isAdmin}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl border border-border" />
        </div>
      ) : (
        <WritingList initialPrompts={prompts} />
      )}

      <GenerationDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onGenerate={handleGenerateAI}
        isGenerating={isGenerating}
      />
    </div>
  )
}
