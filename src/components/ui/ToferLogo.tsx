import React from "react"

interface ToferLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: "h-8 w-8", text: "text-lg", emoji: "text-base" },
  md: { icon: "h-10 w-10", text: "text-xl", emoji: "text-lg" },
  lg: { icon: "h-12 w-12", text: "text-2xl", emoji: "text-xl" },
  xl: { icon: "h-16 w-16", text: "text-4xl", emoji: "text-2xl" },
}

/**
 * The Tofer brand logo.
 * A playful brain + graduation cap mashup that screams
 * "smart but doesn't take itself too seriously."
 */
export function ToferLogo({ size = "md", showText = true, className = "" }: ToferLogoProps) {
  const s = sizeMap[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — layered brain/cap with personality */}
      <div className={`${s.icon} relative group`}>
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main container */}
        <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden">
          {/* Subtle inner pattern — gives texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,white_0%,transparent_50%)]" />
          </div>
          
          {/* The icon — a brain emoji rendered as text for maximum personality */}
          <span className={`${s.emoji} select-none relative z-10`} role="img" aria-label="Tofer brain logo">
            🧠
          </span>
          
          {/* Tiny graduation cap overlay in the corner */}
          <span className="absolute -top-0.5 -right-0.5 text-[10px] select-none rotate-12 drop-shadow-sm">🎓</span>
        </div>
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-black tracking-tighter font-display text-gradient`}>
            Tofer
          </span>
          {size !== "sm" && (
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
              TOEFL Prep
            </span>
          )}
        </div>
      )}
    </div>
  )
}
