import { fetchPassageById } from "@/actions/reading.actions"
import { ReadingExam } from "@/components/features/reading/ReadingExam"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ReadingExamPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ mode?: string }>
}) {
  const { id } = await params
  const { mode: searchMode } = await searchParams
  const mode = searchMode === "simulacro" ? "simulacro" : "practice"

  const { data: passage, error } = await fetchPassageById(id)

  if (error || !passage) {
    notFound()
  }

  // Get user profile/id to record the score
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If auth is strictly required for practice, uncomment:
    // redirect("/login")
  }

  return (
    <main className="w-full h-full bg-background overflow-hidden relative">
      <ReadingExam 
        passageId={passage.id}
        title={passage.title}
        userId={user?.id || ""}
        content={passage.content}
        questions={passage.questions}
        mode={mode}
      />
    </main>
  )
}
