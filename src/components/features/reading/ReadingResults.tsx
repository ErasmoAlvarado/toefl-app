"use client"

import React from "react"
import { ToeflQuestion } from "@/types/reading.types"
import { CheckCircle, XCircle } from "lucide-react"

interface ReadingResultsProps {
  questions: ToeflQuestion[]
  answers: Record<string, string | string[]>
  score: number
  maxScore: number
  onBackToMenu: () => void
}

export function ReadingResults({ questions, answers, score, maxScore, onBackToMenu }: ReadingResultsProps) {
  
  const normalizeText = (text: any): string => {
    if (typeof text !== 'string') return String(text || '');
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const isCorrect = (q: ToeflQuestion, ans: string | string[] | undefined): boolean => {
    if (ans === undefined || ans === null) return false;

    if (q.type === 'Prose Summary') {
      // Mirrors calculateScore: green if the user earned ANY points (≥2 of 3 correct)
      const correctArr = (q.correctAnswers || []).map(normalizeText);
      const ansArr = Array.isArray(ans) ? ans : [];
      const correctCount = ansArr.filter(a => correctArr.includes(normalizeText(a))).length;
      return correctCount >= 2; // 2 correct = 1pt, 3 correct = 2pts — both earn points
    }

    if (q.type === 'Insert Text') {
      // ans is stored as a bare letter: 'A' | 'B' | 'C' | 'D'
      const singleAns = Array.isArray(ans) ? ans[0] ?? '' : String(ans);
      return normalizeText(singleAns) === normalizeText(q.correctPosition);
    }

    if (q.type === 'Fill a Table') {
      return false; // Not yet implemented
    }

    if (q.type === 'Complete the Word') {
      // ans is stored as a plain object { blankId: value } cast through `as any`
      const answersObj = ans as unknown as Record<string, string>;
      if (!answersObj || Array.isArray(answersObj) || typeof answersObj !== 'object') return false;
      return q.blanks.every(blank => {
        const userPart = answersObj[blank.id] ?? '';
        return normalizeText(userPart) === normalizeText(blank.missingPart);
      });
    }

    // Multiple Choice (all standard question types with correctAnswer)
    if ('correctAnswer' in q) {
      const singleAns = Array.isArray(ans) ? ans[0] ?? '' : String(ans);
      return normalizeText(singleAns) === normalizeText(q.correctAnswer);
    }

    return false;
  }

  const getPercentage = () => Math.round((score / maxScore) * 100)

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
        <div className="bg-primary/5 p-8 text-center border-b border-border">
          <h2 className="text-2xl font-bold mb-2">Exam Completed</h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="text-center">
              <span className="block text-4xl font-black text-primary">{score} / {maxScore}</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Final Score</span>
            </div>
            <div className="h-12 w-px bg-border mx-2"></div>
            <div className="text-center">
              <span className="block text-4xl font-black text-primary">{getPercentage()}%</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        Detailed Review
      </h3>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const questionKey = q.id || String(idx)
          const ans = answers[questionKey]
          const hasAnswer = ans !== undefined && ans !== null && !(Array.isArray(ans) && ans.length === 0)
          const correct = isCorrect(q, ans)

          // For Prose Summary: compute partial credit info
          const isProseSummary = q.type === 'Prose Summary'
          const proseSummaryCorrectCount = isProseSummary && Array.isArray(ans)
            ? (ans as string[]).filter(a => (q.correctAnswers || []).map(normalizeText).includes(normalizeText(a))).length
            : 0
          const isPartial = isProseSummary && proseSummaryCorrectCount >= 1 && proseSummaryCorrectCount < 3

          // Border/background color
          const cardStyle = correct
            ? 'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
            : isPartial
              ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20'
              : 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'

          // Icon
          const StatusIcon = correct
            ? <CheckCircle className="w-6 h-6 text-green-500" />
            : isPartial
              ? <CheckCircle className="w-6 h-6 text-yellow-500" />
              : <XCircle className="w-6 h-6 text-red-500" />

          // Format "Your Answer" for display
          const formatUserAnswer = (): React.ReactNode => {
            if (!hasAnswer) return <span className="italic opacity-50">No answer provided</span>

            if (q.type === 'Complete the Word') {
              const obj = ans as unknown as Record<string, string>
              if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return <span className="italic opacity-50">Invalid answer</span>
              return (
                <ul className="list-disc list-inside space-y-1">
                  {q.blanks.map(blank => {
                    const userVal = obj[blank.id] ?? ''
                    const isBlankCorrect = normalizeText(userVal) === normalizeText(blank.missingPart)
                    return (
                      <li key={blank.id} className={isBlankCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        <span className="font-mono">…{userVal || '?'}…</span>
                        {!isBlankCorrect && <span className="ml-2 text-xs opacity-70">(correct: {blank.missingPart})</span>}
                      </li>
                    )
                  })}
                </ul>
              )
            }

            if (q.type === 'Prose Summary' && Array.isArray(ans)) {
              const normalizedCorrect = (q.correctAnswers || []).map(normalizeText)
              return (
                <ul className="list-disc list-inside space-y-1">
                  {(ans as string[]).map((a, i) => {
                    const isItemCorrect = normalizedCorrect.includes(normalizeText(a))
                    return (
                      <li key={i} className={isItemCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                        {a}
                      </li>
                    )
                  })}
                </ul>
              )
            }

            if (Array.isArray(ans)) return <span>{(ans as string[]).join(' | ')}</span>
            return <span>{String(ans)}</span>
          }

          /** Strip markdown bold markers (*text*) for clean display */
          const stripMarkdown = (text: string) => text.replace(/\*(.*?)\*/g, '$1')

          // Format "Correct Answer" for display
          const formatCorrectAnswer = (): React.ReactNode => {
            if (q.type === 'Prose Summary') {
              return (q.correctAnswers || []).map(stripMarkdown).join(' | ')
            }
            if (q.type === 'Insert Text') return q.correctPosition
            if (q.type === 'Fill a Table') return 'See explanation'
            if (q.type === 'Complete the Word') {
              return q.blanks.map(b => `${b.fullWord} (…${b.missingPart}…)`).join(', ')
            }
            if ('correctAnswer' in q) return stripMarkdown(q.correctAnswer)
            return ''
          }

          return (
            <div key={q.id || String(idx)} className={`p-6 rounded-lg border ${cardStyle}`}>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">{StatusIcon}</div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
                      Q{idx + 1}
                    </span>
                    <span className="bg-background/80 border border-border text-xs px-2 py-0.5 rounded shadow-sm">
                      {q.type}
                    </span>
                    {isPartial && (
                      <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                        Partial Credit ({proseSummaryCorrectCount}/3)
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-lg mb-4">{q.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-background/60 p-4 rounded-md border border-border/50">
                      <span className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Your Answer:</span>
                      <div className={`font-medium text-sm ${correct ? 'text-green-700 dark:text-green-400' : isPartial ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
                        {formatUserAnswer()}
                      </div>
                    </div>
                    {!correct && (
                      <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800/50">
                        <span className="text-xs font-bold text-green-800 dark:text-green-400 uppercase mb-2 block">Correct Answer:</span>
                        <p className="font-medium text-sm text-green-900 dark:text-green-300">{formatCorrectAnswer()}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-background p-5 rounded-md border border-border shadow-sm space-y-3">
                    <div className="flex gap-2">
                      <div className="shrink-0 w-1.5 rounded-full bg-primary/50"></div>
                      <div>
                        <span className="text-xs font-bold uppercase text-primary mb-1 block">Explanation</span>
                        <p className="text-sm leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>

                    {!correct && !isPartial && hasAnswer && q.wrongExplanations && !Array.isArray(ans) && (q.wrongExplanations[String(ans)] || q.wrongExplanations[String(ans).replace(/^[A-D]\)\s*/, '')]) && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                        <div className="shrink-0 w-1.5 rounded-full bg-destructive/50"></div>
                        <div>
                          <span className="text-xs font-bold uppercase text-destructive mb-1 block">Why your answer is wrong</span>
                          <p className="text-sm leading-relaxed">{q.wrongExplanations[String(ans)] || q.wrongExplanations[String(ans).replace(/^[A-D]\)\s*/, '')]}</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
         <button 
           onClick={onBackToMenu}
           className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors shadow-md"
         >
           Back to Reading Passages
         </button>
      </div>
    </div>
  )
}
