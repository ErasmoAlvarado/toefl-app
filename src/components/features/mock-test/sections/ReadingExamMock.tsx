"use client";

import React, { useState, useCallback } from "react";
import { MockReadingPassage } from "@/types/mocktest.types";
import { ToeflQuestion } from "@/types/reading.types";
import { PassageViewer } from "../../reading/PassageViewer";
import { QuestionPanel } from "../../reading/QuestionPanel";
import { BookOpen } from "lucide-react";

interface ReadingExamMockProps {
  passages: MockReadingPassage[];
  onComplete: (score: number, maxScore: number, answers: Record<string, string | string[]>) => void;
}

/**
 * Simplified reading exam runner for mock test mode.
 * Iterates through passages linearly. No backward navigation.
 */
export function ReadingExamMock({ passages, onComplete }: ReadingExamMockProps) {
  const [passageIdx, setPassageIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentPassage = passages[passageIdx];
  const currentQuestion = currentPassage?.questions[questionIdx];
  const questionKey = currentQuestion?.id || `${passageIdx}-${questionIdx}`;

  // Flatten all questions for total count
  const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
  const questionsBefore = passages.slice(0, passageIdx).reduce((sum, p) => sum + p.questions.length, 0);
  const globalQuestionNumber = questionsBefore + questionIdx + 1;

  const normalizeText = (text: any): string => {
    if (typeof text !== "string") return String(text || "");
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  };

  const handleSelectAnswer = (answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: answer }));
  };

  const calculateScore = useCallback(() => {
    let score = 0;
    let maxScore = 0;

    passages.forEach((passage) => {
      if (passage.isUnscored) return; // Skip unscored items

      passage.questions.forEach((q) => {
        maxScore += 1;
        const ans = answers[q.id];
        if (!ans) return;
        const qType = q.type?.toLowerCase() || "";

        if (qType === "prose summary") {
          maxScore += 1; // worth 2 total
          const correctArr = ((q as any).correctAnswers || []) as string[];
          const ansArr = Array.isArray(ans) ? ans : [];
          const normalizedCorrect = correctArr.map(normalizeText);
          let correctCount = 0;
          ansArr.forEach((a) => { if (normalizedCorrect.includes(normalizeText(a))) correctCount++; });
          if (correctCount === 3) score += 2;
          else if (correctCount === 2) score += 1;
        } else if (qType === "insert text") {
          if (normalizeText(ans) === normalizeText((q as any).correctPosition || "")) score += 1;
        } else if (qType === "complete the word") {
          const answersObj = ans as unknown as Record<string, string>;
          if (answersObj && typeof answersObj === "object") {
            const blanks = ((q as any).blanks || []) as any[];
            blanks.forEach((blank: any) => {
              maxScore += 1;
              if (normalizeText(answersObj[blank.id] || "") === normalizeText(blank.missingPart)) score += 1;
            });
            maxScore -= 1;
          }
        } else {
          if ("correctAnswer" in q) {
            const singleAns = Array.isArray(ans) ? ans[0] : ans;
            if (normalizeText(singleAns) === normalizeText((q as any).correctAnswer)) score += 1;
          }
        }
      });
    });

    return { score, maxScore };
  }, [answers, passages]);

  const handleNext = () => {
    // Move to next question
    if (questionIdx < currentPassage.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (passageIdx < passages.length - 1) {
      // Move to next passage
      setPassageIdx(passageIdx + 1);
      setQuestionIdx(0);
    }
  };

  const handleSubmit = () => {
    const { score, maxScore } = calculateScore();
    onComplete(score, maxScore, answers);
  };

  if (!currentPassage || !currentQuestion) return null;

  const isLastQuestion =
    passageIdx === passages.length - 1 &&
    questionIdx === currentPassage.questions.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-900/40 border-b border-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Passage {passageIdx + 1} of {passages.length}</span>
          <span>Question {globalQuestionNumber} of {totalQuestions}</span>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(globalQuestionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Passage */}
        <div className="w-full md:w-1/2 lg:w-[55%] h-[40%] md:h-full border-b md:border-b-0 md:border-r border-border/50 overflow-auto">
          <div className="p-4 sm:p-6">
            <PassageViewer
              content={currentPassage.content}
              activeParagraphIndex={currentQuestion.paragraphNumber}
            />
          </div>
        </div>

        {/* Question */}
        <div className="w-full md:w-1/2 lg:w-[45%] h-[60%] md:h-full overflow-auto">
          <div className="p-4 sm:p-6">
            <QuestionPanel
              question={currentQuestion}
              questionNumber={globalQuestionNumber}
              totalQuestions={totalQuestions}
              selectedAnswer={answers[questionKey]}
              onSelectAnswer={handleSelectAnswer}
              onNext={isLastQuestion ? () => {} : handleNext}
              onPrev={() => {}} // No backward navigation in mock
              onSubmit={isLastQuestion ? handleSubmit : () => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
