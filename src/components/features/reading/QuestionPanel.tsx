"use client"

import { ToeflQuestion } from "@/types/reading.types"
import { ArrowLeft, ArrowRight, CheckCircle, BookMarked } from "lucide-react"

interface QuestionPanelProps {
  question: ToeflQuestion
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string | string[] | undefined
  onSelectAnswer: (answer: string | string[]) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
}

export function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrev,
  onSubmit,
}: QuestionPanelProps) {

  const renderOptions = () => {
    switch (question.type?.toLowerCase()) {
      case "prose summary":
        const selectedCount = Array.isArray(selectedAnswer) ? selectedAnswer.length : 0
        const isSelected = (opt: string) => Array.isArray(selectedAnswer) && selectedAnswer.includes(opt)

        const handleCheckbox = (opt: string) => {
          let current = Array.isArray(selectedAnswer) ? [...selectedAnswer] : []
          if (current.includes(opt)) {
            current = current.filter((a) => a !== opt)
          } else {
            if (current.length >= 3) return // Max 3 options
            current.push(opt)
          }
          onSelectAnswer(current)
        }

        return (
          <div className="space-y-3 mt-5">
            <p className="font-bold text-sm leading-relaxed">{(question as any).introductorySentence}</p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-lg">
              <span>{selectedCount}/3 selected</span>
            </div>
            <div className="space-y-2.5">
              {((question as any).options || []).map((opt: any, i: number) => (
                <label
                  key={i}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                    isSelected(opt) 
                      ? "bg-primary/8 border-primary/40 shadow-sm" 
                      : "bg-card border-border hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected(opt) ? "bg-primary border-primary" : "border-muted-foreground/30"
                  }`}>
                    {isSelected(opt) && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      case "insert text":
        const positions = ["A", "B", "C", "D"]
        return (
          <div className="space-y-4 mt-5">
            <p className="text-sm text-muted-foreground leading-relaxed">Look at the four squares [A] [B] [C] [D] in the passage. Which position is best for the following sentence?</p>
            <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl italic font-semibold text-sm leading-relaxed">
              &ldquo;{(question as any).insertSentence}&rdquo;
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => onSelectAnswer(pos)}
                  className={`py-4 rounded-xl border-2 text-center font-black text-lg transition-all duration-200 active:scale-[0.97] ${
                    selectedAnswer === pos 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-card border-border hover:bg-muted/50 hover:border-primary/30 text-foreground"
                  }`}
                >
                  [{pos}]
                </button>
              ))}
            </div>
          </div>
        )

      case "complete the word":
        if (!('paragraphWithBlanks' in question)) return null;

        const handleBlankChange = (blankId: string, value: string) => {
          const currentAnswers = (selectedAnswer as unknown as Record<string, string>) || {}
          onSelectAnswer({
            ...currentAnswers,
            [blankId]: value
          } as any)
        }

        const parts = question.paragraphWithBlanks.split('___');
        
        return (
          <div className="space-y-4 mt-5">
            <div className="p-5 sm:p-6 bg-muted/30 border border-border rounded-xl text-base sm:text-lg leading-loose">
              {parts.map((part, idx) => {
                if (idx === parts.length - 1) return <span key={idx}>{part}</span>
                
                const blank = question.blanks[idx];
                if (!blank) return <span key={idx}>{part}___</span>

                const val = ((selectedAnswer as unknown as Record<string, string>) || {})[blank.id] || ""

                return (
                  <span key={idx}>
                    {part}
                    <input
                      type="text"
                      maxLength={blank.missingPart.length + 2}
                      value={val}
                      onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                      className="inline-block mx-1 w-20 px-2 py-1 text-center text-primary font-bold bg-primary/8 border-b-2 border-primary focus:outline-none focus:bg-primary/15 rounded-t-md transition-all duration-200"
                      placeholder="?"
                    />
                  </span>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Type the missing letters to complete the words.
            </p>
          </div>
        )

      default:
        // Multiple Choice Standard
        if (!("options" in question)) return null
        return (
          <div className="space-y-2.5 mt-5">
            {question.options.map((opt, i) => {
              const checked = selectedAnswer === opt
              const letter = String.fromCharCode(65 + i) // A, B, C, D
              return (
                <label
                  key={i}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                    checked 
                      ? "bg-primary/8 border-primary/40 shadow-sm" 
                      : "bg-card border-border hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <div className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                    checked 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}>
                    {letter}
                  </div>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </label>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* Question header */}
      <div className="flex justify-between items-center pb-4 border-b border-border/50 mb-5">
        <div className="flex items-center gap-2">
          {/* Question number dots for quick nav on mobile */}
          <span className="text-sm font-bold text-foreground">
            Q{questionNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            of {totalQuestions}
          </span>
        </div>
        <span className="bg-primary/8 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
          {question.type}
        </span>
      </div>

      {/* Question text + options — scrollable */}
      <div className="flex-1 overflow-y-auto pb-4">
        <h2 className="text-base sm:text-lg font-bold leading-snug text-card-foreground">
          {question.question}
        </h2>
        {question.paragraphNumber && question.type !== 'Prose Summary' && (
           <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1.5 rounded-lg">
             <BookMarked className="h-3 w-3" />
             Paragraph {question.paragraphNumber}
           </div>
        )}
        
        {renderOptions()}
      </div>

      {/* Navigation — sticky bottom */}
      <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-auto gap-3">
        <button
          onClick={onPrev}
          disabled={questionNumber === 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 border border-border active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4" /> 
          <span className="hidden sm:inline">Previous</span>
        </button>

        {questionNumber === totalQuestions ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-200 active:scale-[0.97]"
          >
            Submit <CheckCircle className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-secondary text-secondary-foreground rounded-xl shadow-sm hover:shadow-md hover:bg-secondary/80 transition-all duration-200 active:scale-[0.97]"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
