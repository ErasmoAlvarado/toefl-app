"use client"

import { ToeflQuestion } from "@/types/reading.types"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

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
          <div className="space-y-3 mt-4">
            <p className="font-semibold">{(question as any).introductorySentence}</p>
            <p className="text-sm text-muted-foreground mb-4">Select 3 answer choices. ({selectedCount}/3 selected)</p>
            {((question as any).options || []).map((opt: any, i: number) => (
              <label
                key={i}
                className={`flex gap-3 p-4 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected(opt) ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected(opt)}
                  onChange={() => handleCheckbox(opt)}
                  className="mt-1 flex-shrink-0"
                />
                <span className="text-sm leading-relaxed">{opt}</span>
              </label>
            ))}
          </div>
        )
      
      case "insert text":
        const positions = ["A", "B", "C", "D"]
        return (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground mb-4">Look at the four squares [A] [B] [C] [D] in the passage. Which position is best for the following sentence?</p>
            <div className="p-4 bg-muted/50 border border-border rounded-md italic font-semibold mb-6 shadow-sm">
              "{(question as any).insertSentence}"
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => onSelectAnswer(pos)}
                  className={`py-4 rounded-md border text-center font-bold text-lg transition-all ${
                    selectedAnswer === pos 
                      ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-[1.02]" 
                      : "bg-card border-border hover:bg-muted text-foreground"
                  }`}
                >
                  Position [{pos}]
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

        // We need to parse the paragraphWithBlanks and replace ___ with input fields
        // Let's assume the blanks are represented as `___` (3 underscores) in order.
        const parts = question.paragraphWithBlanks.split('___');
        
        return (
          <div className="space-y-4 mt-6">
            <div className="p-6 bg-card border border-border shadow-sm rounded-lg text-lg leading-loose font-serif">
              {parts.map((part, idx) => {
                if (idx === parts.length - 1) return <span key={idx}>{part}</span>
                
                const blank = question.blanks[idx];
                if (!blank) return <span key={idx}>{part}___</span> // Fallback if mismatch

                const val = ((selectedAnswer as unknown as Record<string, string>) || {})[blank.id] || ""

                return (
                  <span key={idx}>
                    {part}
                    <input
                      type="text"
                      maxLength={blank.missingPart.length + 2} // allow slight mistake room, but roughly match length
                      value={val}
                      onChange={(e) => handleBlankChange(blank.id, e.target.value)}
                      className="inline-block mx-1 w-20 px-2 py-0.5 text-center text-primary font-bold bg-primary/10 border-b-2 border-primary focus:outline-none focus:bg-primary/20 rounded-t-sm transition-colors"
                      placeholder="?"
                    />
                  </span>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Type the missing letters to complete the words.
            </p>
          </div>
        )

      default:
        // Multiple Choice Standard
        if (!("options" in question)) return null
        return (
          <div className="space-y-3 mt-6">
            {question.options.map((opt, i) => {
              const checked = selectedAnswer === opt
              return (
                <label
                  key={i}
                  className={`flex gap-3 p-4 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors ${
                    checked ? "bg-primary/10 border-primary shadow-sm" : "bg-card border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={checked}
                    onChange={() => onSelectAnswer(opt)}
                    className="mt-1"
                  />
                  <span className="text-md leading-relaxed">{opt}</span>
                </label>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border shadow-sm p-6 lg:p-8">
      
      <div className="flex justify-between items-center pb-4 border-b border-border/50 mb-6">
        <h3 className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
          Question {questionNumber} of {totalQuestions}
        </h3>
        <span className="bg-primary/10 text-primary uppercase text-[10px] font-bold px-2 py-1 rounded">
          {question.type}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <h2 className="text-xl font-bold leading-snug mb-2 text-card-foreground">
          {question.question}
        </h2>
        {question.paragraphNumber && question.type !== 'Prose Summary' && (
           <p className="text-sm text-primary/80 mb-6 bg-primary/5 inline-block px-2 py-0.5 rounded border border-primary/20">
             Refer to Paragraph {question.paragraphNumber} on the left.
           </p>
        )}
        
        {renderOptions()}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-border mt-auto">
        <button
          onClick={onPrev}
          disabled={questionNumber === 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors border border-border"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {questionNumber === totalQuestions ? (
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Submit Exam <CheckCircle className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors shadow-sm"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
