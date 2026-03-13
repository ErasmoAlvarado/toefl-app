"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModuleDashboardHeader } from "@/components/layout/ModuleDashboardHeader"
import { SpeakingList } from "@/components/features/speaking/SpeakingList"
import { fetchSpeakingPrompts, SpeakingPromptRow } from "@/actions/shared.actions"
import { getUserRole } from "@/actions/auth"
import { toast } from "sonner"
import { GenerationDialog } from "@/components/features/speaking/GenerationDialog"

export default function SpeakingPage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Partial<SpeakingPromptRow>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [{ data: promptsData, success }, roleData] = await Promise.all([
        fetchSpeakingPrompts(),
        getUserRole()
      ])
      
      if (success && promptsData) {
        setPrompts(promptsData)
      } else {
        toast.error("Failed to load speaking prompts")
      }
      setIsAdmin(!!roleData.isAdmin)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleGenerateAI = async (options: { topic: string, taskType: string, difficulty: string }) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/speaking", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options)
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success("New speaking prompt generated!")
        setIsDialogOpen(false)
        const updated = await fetchSpeakingPrompts()
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
    router.push("/practice/speaking/full-test")
  }

  return (
    <div className="flex flex-col space-y-10 max-w-6xl mx-auto pb-20">
      <ModuleDashboardHeader 
        title="Speaking Section"
        description="Record your responses to various prompts. Practice expressing your ideas clearly and coherently in an academic context."
        stats={[
          { label: "Prompts", value: prompts.length },
          { label: "Total Time", value: "16 min" },
          { label: "Tasks", value: "4" }
        ]}
        onGenerateAI={() => setIsDialogOpen(true)}
        onStartFullTest={handleStartFullTest}
        fullTestLabel="Start Full Test (16m)"
        isGenerating={isGenerating}
        isAdmin={isAdmin}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl border border-border" />
        </div>
      ) : (
        <SpeakingList initialPrompts={prompts} />
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
