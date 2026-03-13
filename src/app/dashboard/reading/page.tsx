"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModuleDashboardHeader } from "@/components/layout/ModuleDashboardHeader"
import { ReadingList } from "@/components/features/reading/ReadingList"
import { fetchReadingPassages, ReadingPassageRow } from "@/actions/reading.actions"
import { getUserRole } from "@/actions/auth"
import { toast } from "sonner"
import { GenerationDialog } from "@/components/features/reading/GenerationDialog"

export default function ReadingPage() {
  const router = useRouter()
  const [passages, setPassages] = useState<Partial<ReadingPassageRow>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [{ data: passagesData, success }, roleData] = await Promise.all([
        fetchReadingPassages(),
        getUserRole()
      ])
      
      if (success && passagesData) {
        setPassages(passagesData)
      } else {
        toast.error("Failed to load passages")
      }
      setIsAdmin(!!roleData.isAdmin)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleGenerateAI = async (options: { topic: string, passageType: string, difficulty: string }) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/reading", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options)
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success("New passage generated!")
        setIsDialogOpen(false)
        // Refresh list
        const updated = await fetchReadingPassages()
        if (updated.success) setPassages(updated.data || [])
      } else {
        toast.error(result.error || "Failed to generate passage")
      }
    } catch (error) {
      toast.error("An error occurred during generation")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartFullTest = () => {
    // In a real app, this might create a new session with multiple passages
    router.push("/practice/reading/full-test")
  }

  return (
    <div className="flex flex-col space-y-10 max-w-6xl mx-auto pb-20">
      <ModuleDashboardHeader 
        title="Reading Section"
        description="Read academic passages and answer questions to test your comprehension. This section simulates the actual TOEFL iBT reading experience."
        stats={[
          { label: "Passages", value: passages.length },
          { label: "Total Time", value: "35 min" },
          { label: "Questions", value: "20" }
        ]}
        onGenerateAI={() => setIsDialogOpen(true)}
        onStartFullTest={handleStartFullTest}
        fullTestLabel="Start Full Test (35m)"
        isGenerating={isGenerating}
        isAdmin={isAdmin}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl border border-border" />
        </div>
      ) : (
        <ReadingList initialPassages={passages} />
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
