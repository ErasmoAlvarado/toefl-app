import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl font-display">TOEFL Max 2026</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <button className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Sign In
          </button>
        </nav>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center text-center px-4 md:px-6">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Master the <span className="text-primary">New TOEFL iBT</span> Format
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Prepare for the 2026 exam changes with adaptive mock tests, AI-scored speaking/writing, and detailed performance analytics.
            </p>
            <div className="space-x-4">
              <Link href="/dashboard">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium text-lg inline-flex items-center gap-2">
                  Start Practicing <ArrowRight className="h-5 w-5"/>
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/50 flex flex-col items-center justify-center px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">2026 Format Strict</h2>
              <p className="text-muted-foreground">Practice under the exact timing and structure of the updated TOEFL exam format.</p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">AI Guided Scoring</h2>
              <p className="text-muted-foreground">Get instant feedback on your Speaking and Writing tasks powered by Gemini AI.</p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Adaptive Practice</h2>
              <p className="text-muted-foreground">Target your weak points with our intelligent MST (Multi-Stage Testing) routing.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2026 TOEFL Max. Non-official preparation platform.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Terms
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
