"use client"

import { useEffect, useRef } from "react"

interface PassageViewerProps {
  content: string
  activeParagraphIndex?: number // 1-indexed according to TOEFL (Para 1, Para 2...)
}

export function PassageViewer({ content, activeParagraphIndex }: PassageViewerProps) {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim() !== "")
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (activeParagraphIndex && containerRef.current) {
      // Find the element for the active paragraph
      const element = containerRef.current.querySelector(`[data-paragraph="${activeParagraphIndex}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [activeParagraphIndex])

  // Replace [A], [B], [C], [D] markers with bold spans if they exist
  const formatText = (text: string) => {
    const parts = text.split(/(\[[A-D]\])/g)
    return parts.map((part, index) => {
      if (part.match(/\[[A-D]\]/)) {
        return (
          <span key={index} className="font-bold text-lg bg-primary/20 px-1 rounded mx-1">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div 
      className="h-full overflow-y-auto w-full pb-24"
      ref={containerRef}
    >
      <div className="max-w-prose mx-auto space-y-5 text-card-foreground text-base sm:text-lg leading-[1.8]">
        {paragraphs.map((para, idx) => {
          const paraNum = idx + 1
          const isActive = paraNum === activeParagraphIndex
          
          return (
            <div 
              key={idx}
              data-paragraph={paraNum}
              className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 ${
                isActive ? "bg-primary/8 border-l-[3px] border-primary" : "hover:bg-muted/20"
              }`}
            >
              {/* Paragraph marker as used in real TOEFL */}
              <div 
                className="shrink-0 font-bold select-none text-muted-foreground w-6 flex justify-end 
                group-hover:text-primary transition-colors"
              >
                {isActive ? (
                  <span className="text-primary text-2xl font-black leading-none translate-y-1">›</span>
                ) : (
                  paraNum
                )}
              </div>
              <p className="flex-1">
                {formatText(para)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
