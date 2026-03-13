"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModuleDashboardHeader } from "@/components/layout/ModuleDashboardHeader"
import { ListeningList } from "@/components/features/listening/ListeningList"
import { fetchListeningMaterials, ListeningMaterialRow } from "@/actions/shared.actions"
import { getUserRole } from "@/actions/auth"
import { toast } from "sonner"
import { GenerationDialog } from "@/components/features/listening/GenerationDialog"

export default function ListeningPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<Partial<ListeningMaterialRow>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [{ data: materialsData, success }, roleData] = await Promise.all([
        fetchListeningMaterials(),
        getUserRole()
      ])
      
      if (success && materialsData) {
        setMaterials(materialsData)
      } else {
        toast.error("Failed to load materials")
      }
      setIsAdmin(!!roleData.isAdmin)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleGenerateAI = async (options: { topic: string, listeningType: string, difficulty: string }) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/listening", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options)
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success("New listening material generated!")
        setIsDialogOpen(false)
        const updated = await fetchListeningMaterials()
        if (updated.success) setMaterials(updated.data || [])
      } else {
        toast.error(result.error || "Failed to generate material")
      }
    } catch (error) {
      toast.error("An error occurred during generation")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStartFullTest = () => {
    router.push("/practice/listening/full-test")
  }

  return (
    <div className="flex flex-col space-y-10 max-w-6xl mx-auto pb-20">
      <ModuleDashboardHeader 
        title="Listening Section"
        description="Listen to lectures and conversations in an academic environment. Test your ability to understand main ideas, details, and speaker purpose."
        stats={[
          { label: "Materials", value: materials.length },
          { label: "Total Time", value: "36 min" },
          { label: "Questions", value: "28" }
        ]}
        onGenerateAI={() => setIsDialogOpen(true)}
        onStartFullTest={handleStartFullTest}
        fullTestLabel="Start Full Test (36m)"
        isGenerating={isGenerating}
        isAdmin={isAdmin}
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl border border-border" />
        </div>
      ) : (
        <ListeningList initialMaterials={materials} />
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
