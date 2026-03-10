"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookOpen, 
  Headphones, 
  Mic, 
  PenTool, 
  PieChart, 
  GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: PieChart },
  { name: 'Reading', href: '/dashboard/reading', icon: BookOpen },
  { name: 'Listening', href: '/dashboard/listening', icon: Headphones },
  { name: 'Speaking', href: '/dashboard/speaking', icon: Mic },
  { name: 'Writing', href: '/dashboard/writing', icon: PenTool },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r bg-card h-screen p-4 sticky top-0">
      <div className="flex h-14 items-center border-b px-2 mb-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg">TOEFL Max 2026</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-2 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50",
                  isActive 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            TM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Student</span>
            <span className="text-xs text-muted-foreground">Free Tier</span>
          </div>
        </div>
      </div>
    </div>
  )
}
