import { Sidebar } from "@/components/layout/sidebar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-6 bg-card">
          <h1 className="text-lg flex-1 font-semibold leading-none tracking-tight">Dashboard Overview</h1>
          <div className="ml-auto flex items-center gap-4">
             <div className="text-sm font-medium">Toefl Prep Simulation</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
