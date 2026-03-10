export default function ListeningPage() {
  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Listening Section</h1>
            <p className="text-muted-foreground">3 Lectures • 2 Conversations • 28 questions • 36 minutes</p>
         </div>
       </div>
       <div className="rounded-md border p-8 bg-card text-center min-h-[400px] flex items-center justify-center flex-col gap-4">
           <p className="text-lg">Listening Section Simulation Environment goes here.</p>
           <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-md font-medium">
             Start Practice Test
           </button>
       </div>
    </div>
  )
}
