import { fetchListeningMaterialById } from "@/actions/listening.actions"
import { ListeningExam } from "@/components/features/listening/ListeningExam"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ListeningExamPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode: searchMode } = await searchParams
  const mode = searchMode === "simulacro" ? "simulacro" : "practice"

  const { data: material, error } = await fetchListeningMaterialById(id)

  if (error || !material) {
    notFound()
  }

  // Get user profile/id to record the score
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="w-full h-full bg-background overflow-hidden relative">
      <ListeningExam 
        material={material}
        userId={user?.id}
        mode={mode}
      />
    </main>
  )
}
