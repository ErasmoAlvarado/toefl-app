import { Sidebar } from "@/components/layout/sidebar"
import { ReactNode } from "react"
import { getUserRole } from "@/actions/auth"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role } = await getUserRole()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar user={user} role={role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border/50 px-6 bg-card/80 backdrop-blur-sm shrink-0">
          {/* Empty left space for mobile hamburger clearance */}
          <div className="w-10 md:hidden" />
          <h1 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase hidden md:block">Tofer Dashboard</h1>
          <div className="ml-auto flex items-center gap-4">
             <div className="text-xs font-bold text-primary/70 bg-primary/8 px-3 py-1.5 rounded-lg">TOEFL iBT 2026</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
