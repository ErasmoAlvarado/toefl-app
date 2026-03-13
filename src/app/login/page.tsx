"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, signup } from "@/actions/auth"
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react"
import { ToferLogo } from "@/components/ui/ToferLogo"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccessMessage(null)
    setPending(true)
    
    let res;
    if (isLogin) {
      res = await login(formData)
    } else {
      res = await signup(formData)
    }

    if (res?.success) {
      if (isLogin) {
        // use window.location for a hard redirect to ensure session is picked up
        window.location.href = "/dashboard"
      } else {
        setSuccessMessage("Holy guacamole! You're almost in! 🥑 Check your email to verify your account so we can start crushing those TOEFL goals!")
        setPending(false)
      }
    } else if (res?.error) {
      setError(res.error)
      setPending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Left hero panel — visible on lg+, provides personality & impact */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-primary items-center justify-center p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 max-w-lg space-y-8">
          <ToferLogo size="xl" className="[&_span]:text-white [&_.text-gradient]:bg-none [&_.text-gradient]:text-white" />
          
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Your TOEFL prep 
            <span className="block text-accent"> just got real.</span>
          </h1>
          
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            AI-powered practice that actually feels like practice. Not a boring textbook. Not a generic quiz app. We're talking <span className="font-bold text-white/90">real exam simulation</span> with personality.
          </p>

          <div className="flex items-center gap-3 text-white/50 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </div>

      {/* Right form panel — ALWAYS visible, mobile-first */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-background">
        
        {/* Mobile logo — only on small screens */}
        <div className="lg:hidden mb-10">
          <ToferLogo size="lg" />
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isLogin ? "Welcome back!" : "Let's do this! 🎉"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isLogin 
                ? "Buckle up, buttercup — we're about to crush this exam!" 
                : "Create an account and let's get this party started!"}
            </p>
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 items-center text-destructive animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in-95 duration-300">
                <Sparkles className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{successMessage}</p>
              </div>
            )}
          </div>

          {/* Form */}
          {!successMessage && (
            <form action={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold" htmlFor="fullName">Full Name</label>
                  <input 
                    id="fullName"
                    name="fullName"
                    type="text" 
                    placeholder="John Doe"
                    required={!isLogin}
                    className="w-full h-11 px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring transition-all duration-200 placeholder:text-muted-foreground/50"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="email">Email</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring transition-all duration-200 placeholder:text-muted-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="password">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-3 focus:ring-ring/30 focus:border-ring transition-all duration-200 placeholder:text-muted-foreground/50"
                />
              </div>

              <button 
                type="submit" 
                disabled={pending}
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-3 focus:ring-ring/30 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                {pending ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle login/signup */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setSuccessMessage(null)
              }}
              className="text-primary font-bold hover:underline underline-offset-4 transition-colors"
            >
              {isLogin ? "Sign up" : (successMessage ? "Back to Sign in" : "Sign in")}
            </button>
          </div>
        </div>

        {/* Test mode note */}
        <div className="mt-12 text-center max-w-sm">
          <p className="text-xs text-muted-foreground font-medium border border-border p-3.5 rounded-xl bg-muted/30">
            Hey chief! Just snooping around? No worries! You can browse basic features without logging in by heading straight to the <a href="/dashboard" className="font-bold underline underline-offset-2 hover:text-primary transition-colors">Dashboard</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
