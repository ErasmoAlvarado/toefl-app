"use client"

import { useState } from "react"
import { ToeflQuestion } from "@/types/reading.types"
import { PassageViewer } from "./PassageViewer"
import { QuestionPanel } from "./QuestionPanel"
import { ReadingResults } from "./ReadingResults"
import { ExamTimer } from "../timer"
import { saveReadingScore } from "@/actions/reading.actions"

interface ReadingExamProps {
  passageId: string
  title: string
  content: string
  questions: ToeflQuestion[]
  mode: "practice" | "simulacro"
  userId: string
}

export function ReadingExam({ passageId, title, content, questions, mode, userId }: ReadingExamProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [scoreData, setScoreData] = useState<{ score: number; maxScore: number } | null>(null)

  // 35 minutes for simulacro
  const initialSeconds = 35 * 60

  /** Key used to store/retrieve answer — uses q.id if available, else index */
  const getQuestionKey = (q: ToeflQuestion, idx: number) => q.id || String(idx)

  const handleSelectAnswer = (questionKey: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: answer,
    }))
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1)
  }

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  const normalizeText = (text: any): string => {
    if (typeof text !== "string") return String(text || "")
    return text.trim().toLowerCase().replace(/\s+/g, " ")
  }

  const calculateScore = () => {
    let score = 0
    let maxScore = questions.length

    questions.forEach((q, idx) => {
      const questionKey = getQuestionKey(q, idx)
      const ans = answers[questionKey]
      if (!ans) return

      const qType = q.type?.toLowerCase() || ""

      if (qType === "prose summary") {
        maxScore += 1 // prose summary is worth 2 total
        const correctArr = ((q as any).correctAnswers || []) as string[]
        const ansArr = Array.isArray(ans) ? ans : []
        const normalizedCorrect = correctArr.map(normalizeText)
        let correctCount = 0
        ansArr.forEach(a => { if (normalizedCorrect.includes(normalizeText(a))) correctCount++ })
        if (correctCount === 3) score += 2
        else if (correctCount === 2) score += 1
      } else if (qType === "insert text") {
        const correctPos = (q as any).correctPosition || ""
        if (normalizeText(ans) === normalizeText(correctPos)) score += 1
      } else if (qType === "complete the word") {
        const answersObj = ans as unknown as Record<string, string>
        if (answersObj && typeof answersObj === "object") {
          const blanks = ((q as any).blanks || []) as any[]
          blanks.forEach((blank: any) => {
            maxScore += 1
            const submittedPart = answersObj[blank.id] || ""
            if (normalizeText(submittedPart) === normalizeText(blank.missingPart)) score += 1
          })
          maxScore -= 1 // remove the base count already added
        }
      } else {
        if ("correctAnswer" in q) {
          const singleAns = Array.isArray(ans) ? ans[0] : ans
          if (normalizeText(singleAns) === normalizeText(q.correctAnswer)) score += 1
        }
      }
    })

    return { score, maxScore }
  }

  /**
   * Determines if a single question answer is correct (mirrors calculateScore logic).
   * Used for building the per-question attempt payload.
   */
  const isQuestionCorrect = (q: ToeflQuestion, ans: string | string[] | undefined): boolean => {
    if (!ans) return false
    const qType = q.type?.toLowerCase() || ""
    if (qType === "prose summary") {
      const correctArr = ((q as any).correctAnswers || []) as string[]
      const ansArr = Array.isArray(ans) ? ans : []
      const correctCount = ansArr.filter(a => correctArr.map(normalizeText).includes(normalizeText(a))).length
      return correctCount >= 2
    }
    if (qType === "insert text") {
      return normalizeText(ans) === normalizeText((q as any).correctPosition || "")
    }
    if (qType === "complete the word") {
      const answersObj = ans as unknown as Record<string, string>
      if (!answersObj || typeof answersObj !== "object" || Array.isArray(answersObj)) return false
      return ((q as any).blanks || []).every((blank: any) =>
        normalizeText(answersObj[blank.id] ?? "") === normalizeText(blank.missingPart)
      )
    }
    if ("correctAnswer" in q) {
      const singleAns = Array.isArray(ans) ? ans[0] : ans
      return normalizeText(singleAns) === normalizeText(q.correctAnswer)
    }
    return false
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    const { score, maxScore } = calculateScore()

    if (userId) {
      // Build per-question attempt records
      const questionAttempts = questions.map((q, idx) => {
        const questionKey = getQuestionKey(q, idx)
        const ans = answers[questionKey] ?? null
        return {
          questionId: questionKey,
          questionType: q.type,
          userAnswer: ans as any,
          isCorrect: isQuestionCorrect(q, ans ?? undefined),
        }
      })

      await saveReadingScore({
        userId,
        passageId,
        mode,
        score,
        maxScore,
        timeSpent: initialSeconds,
        questionAttempts,
      })
    }

    setScoreData({ score, maxScore })
    setIsSubmitted(true)
    setIsSaving(false)
  }

  if (isSubmitted && scoreData) {
    return (
      <ReadingResults
        questions={questions}
        answers={answers}
        score={scoreData.score}
        maxScore={scoreData.maxScore}
        onBackToMenu={() => (window.location.href = "/practice/reading")}
      />
    )
  }

  const currentQuestion = questions[currentIdx]
  const currentQuestionKey = getQuestionKey(currentQuestion, currentIdx)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">

      {/* Top Bar */}
      <div className="flex shrink-0 items-center justify-between p-4 bg-card border-b border-border shadow-sm z-10">
        <h1 className="text-xl font-bold truncate pr-4 text-card-foreground">
          {title}
        </h1>
        {mode === "simulacro" && !isSubmitted && (
          <ExamTimer
            initialSeconds={initialSeconds}
            onTimeUp={handleSubmit}
            paused={isSaving}
          />
        )}
      </div>

      {isSaving ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="font-medium animate-pulse">Calculating Score & Saving Results...</p>
        </div>
      ) : (
        /* Split Screen Content */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* Left: Passage */}
          <div className="w-full md:w-1/2 lg:w-[55%] h-1/2 md:h-full border-b md:border-b-0 md:border-r border-border p-4">
            <PassageViewer
              content={content}
              activeParagraphIndex={currentQuestion.paragraphNumber}
            />
          </div>

          {/* Right: Question */}
          <div className="w-full md:w-1/2 lg:w-[45%] h-1/2 md:h-full p-4">
            <QuestionPanel
              question={currentQuestion}
              questionNumber={currentIdx + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestionKey]}
              onSelectAnswer={(answer) => handleSelectAnswer(currentQuestionKey, answer)}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
            />
          </div>

        </div>
      )}
    </div>
  )
}
