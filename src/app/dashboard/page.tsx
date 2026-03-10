export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
         <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
         <p className="text-muted-foreground text-lg">Heres your TOEFL iBT progress overview.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Stat Cards */}
        {[
          { title: "Reading", score: "28/30", color: "text-blue-500" },
          { title: "Listening", score: "29/30", color: "text-green-500" },
          { title: "Speaking", score: "26/30", color: "text-orange-500" },
          { title: "Writing", score: "27/30", color: "text-purple-500" }
        ].map(stat => (
           <div key={stat.title} className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                 <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
              </div>
              <div className="p-6 pt-0">
                 <div className={`text-2xl font-bold ${stat.color}`}>{stat.score}</div>
                 <p className="text-xs text-muted-foreground">Highest mock score</p>
              </div>
           </div>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 h-96">
           <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Recent Progress</h3>
              <p className="text-sm text-muted-foreground">Your scores over the last 30 days.</p>
           </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3 h-96">
           <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Next Study Recommended</h3>
              <p className="text-sm text-muted-foreground">Focus on these areas.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
