import { fetchReadingPassages } from "@/actions/reading.actions"
import { ReadingList } from "@/components/features/reading/ReadingList"
import { GeneratePassage } from "@/components/features/reading/GeneratePassage"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ReadingDashboardPage() {
  const { data: passages, error } = await fetchReadingPassages()

  // Server action to trigger revalidation after generating a new passage
  async function refreshPassages() {
    "use server"
    revalidatePath("/practice/reading")
    redirect("/practice/reading")
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reading Practice</h1>
        <p className="text-muted-foreground">
          Prepare for the TOEFL iBT Reading section. Read passages and answer questions.
        </p>
      </div>

      <GeneratePassage onGenerationSuccess={refreshPassages} />

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 font-medium text-sm">
          Failed to load passages: {error}
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-5">Available Passages</h2>
          <ReadingList initialPassages={passages || []} />
        </div>
      )}
    </div>
  )
}
