"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  BookOpen, 
  Headphones, 
  Mic, 
  PenTool, 
  PieChart, 
  LogOut,
  LogIn,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth"
import { ToferLogo } from "@/components/ui/ToferLogo"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: PieChart },
  { name: 'Reading', href: '/dashboard/reading', icon: BookOpen },
  { name: 'Listening', href: '/dashboard/listening', icon: Headphones },
  { name: 'Speaking', href: '/dashboard/speaking', icon: Mic },
  { name: 'Writing', href: '/dashboard/writing', icon: PenTool },
]

interface SidebarProps {
  user: any;
  role: string | null;
}

export function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-5 mb-2">
        <Link href="/dashboard" className="group" onClick={() => setMobileOpen(false)}>
          <ToferLogo size="sm" />
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-auto px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm dark:bg-primary/15" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive && "text-primary")} />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto border-t border-border/50 p-4 space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {user.email?.substring(0, 2).toUpperCase() || "TM"}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-semibold truncate" title={user.email}>{user.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{role?.toLowerCase() || 'Student'}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 opacity-60">
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                ?
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Mysterious Stranger</span>
                <span className="text-xs text-muted-foreground">incognito mode activated</span>
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 transition-all duration-200 active:scale-[0.97]"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all active:scale-95"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl transition-transform duration-300 ease-out md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {navContent}
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        {navContent}
      </div>
    </>
  )
}
