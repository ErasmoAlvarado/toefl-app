import { BookOpen, Headphones, Mic, PenTool, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

const modules = [
  { 
    title: "Reading", 
    score: "28/30", 
    icon: BookOpen,
    href: "/dashboard/reading",
    gradient: "from-blue-500/15 to-indigo-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/20",
  },
  { 
    title: "Listening", 
    score: "29/30", 
    icon: Headphones,
    href: "/dashboard/listening",
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/20",
  },
  { 
    title: "Speaking", 
    score: "26/30", 
    icon: Mic,
    href: "/dashboard/speaking",
    gradient: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/20",
  },
  { 
    title: "Writing", 
    score: "27/30", 
    icon: PenTool,
    href: "/dashboard/writing",
    gradient: "from-purple-500/15 to-fuchsia-500/15",
    iconColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/20",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
         <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
           Gooooood morning, Tofer!
         </h2>
         <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
           Here&apos;s your TOEFL iBT progress overview. Let&apos;s make that brain sweat today! 🧠💦
         </p>
      </div>
      
      {/* Module cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {modules.map(mod => (
           <Link 
             key={mod.title} 
             href={mod.href}
             className={`group rounded-2xl border ${mod.borderColor} bg-gradient-to-br ${mod.gradient} p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]`}
           >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center ${mod.iconColor} shadow-sm`}>
                  <mod.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="tracking-tight text-sm font-semibold text-foreground">{mod.title}</h3>
              <div className={`text-2xl sm:text-3xl font-black mt-1 ${mod.iconColor}`}>{mod.score}</div>
              <p className="text-xs text-muted-foreground mt-1">Highest mock score</p>
           </Link>
        ))}
      </div>
      
      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-2xl border border-border bg-card shadow-sm col-span-full lg:col-span-4 min-h-[320px]">
           <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-bold leading-none tracking-tight text-base">Recent Progress</h3>
              </div>
              <p className="text-sm text-muted-foreground">Your scores over the last 30 days.</p>
           </div>
           <div className="p-6 flex items-center justify-center min-h-[200px]">
             <p className="text-sm text-muted-foreground/60 italic">Chart coming soon...</p>
           </div>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm col-span-full lg:col-span-3 min-h-[320px]">
           <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
              <h3 className="font-bold leading-none tracking-tight text-base">Next Study Recommended</h3>
              <p className="text-sm text-muted-foreground">Focus on these areas.</p>
           </div>
           <div className="p-6 flex items-center justify-center min-h-[200px]">
             <p className="text-sm text-muted-foreground/60 italic">Recommendations coming soon...</p>
           </div>
        </div>
      </div>
    </div>
  )
}
