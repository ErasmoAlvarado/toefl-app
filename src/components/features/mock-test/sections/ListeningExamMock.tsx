"use client";

import React, { useState } from "react";
import { MockListeningItem } from "@/types/mocktest.types";
import { Headphones } from "lucide-react";

interface ListeningExamMockProps {
  items: MockListeningItem[];
  onComplete: (score: number, maxScore: number, answers: Record<string, string>) => void;
}

/**
 * Listening exam runner for mock test mode.
 * Processes items linearly — shows transcript as TTS simulation,
 * then presents questions one at a time.
 */
export function ListeningExamMock({ items, onComplete }: ListeningExamMockProps) {
  const [itemIdx, setItemIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true); // initially show "audio" (transcript)
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentItem = items[itemIdx];
  const currentQuestion = currentItem?.questions[questionIdx];

  const totalQuestions = items.reduce((sum, item) => sum + item.questions.length, 0);
  const questionsBefore = items.slice(0, itemIdx).reduce((sum, item) => sum + item.questions.length, 0);
  const globalQuestionNumber = questionsBefore + questionIdx + 1;

  /** Use Web Speech API to read the transcript aloud */
  const playAudio = () => {
    if (!currentItem) return;
    const text = currentItem.audioPromptText || currentItem.transcript;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setShowQuestions(true);
        setShowTranscript(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: just show questions after a brief delay
      setTimeout(() => {
        setShowQuestions(true);
        setShowTranscript(false);
      }, 2000);
    }
  };

  /** Skip "audio" and go straight to questions */
  const skipToQuestions = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setShowQuestions(true);
    setShowTranscript(false);
  };

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    const ansKey = `${currentItem.id}-q${questionIdx}`;
    const updatedAnswers = { ...answers, [ansKey]: selectedAnswer };
    setAnswers(updatedAnswers);
    setSelectedAnswer("");

    if (questionIdx < currentItem.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (itemIdx < items.length - 1) {
      // Next item
      setItemIdx(itemIdx + 1);
      setQuestionIdx(0);
      setShowTranscript(true);
      setShowQuestions(false);
    } else {
      // All done — calculate score
      let score = 0;
      let maxScore = 0;
      items.forEach((item) => {
        if (item.isUnscored) return;
        item.questions.forEach((q, qIdx) => {
          maxScore += 1;
          const key = `${item.id}-q${qIdx}`;
          const userAns = key === ansKey ? selectedAnswer : updatedAnswers[key];
          if (userAns === q.correctAnswer) score += 1;
        });
      });
      onComplete(score, maxScore, updatedAnswers);
    }
  };

  if (!currentItem) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="capitalize">{currentItem.type.replace(/_/g, " ")}: {currentItem.title}</span>
        <span>Item {itemIdx + 1} of {items.length}</span>
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${(globalQuestionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Audio / Transcript Phase */}
      {showTranscript && !showQuestions && (
        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Headphones className={`w-8 h-8 text-emerald-400 ${isSpeaking ? "animate-pulse" : ""}`} />
          </div>
          <h3 className="text-lg font-bold text-white capitalize">
            {currentItem.type.replace(/_/g, " ")}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {isSpeaking
              ? "Listen carefully..."
              : "Click 'Play Audio' to hear the prompt. Questions will appear after."}
          </p>

          {/* Show transcript text for reading along (simulated audio) */}
          {isSpeaking && (
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/30 max-h-48 overflow-auto text-left">
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                {currentItem.transcript}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {!isSpeaking && (
              <button
                onClick={playAudio}
                className="py-3 px-6 rounded-xl font-semibold text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                ▶ Play Audio
              </button>
            )}
            <button
              onClick={skipToQuestions}
              className="py-3 px-6 rounded-xl font-semibold text-sm bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
            >
              Skip to Questions →
            </button>
          </div>
        </div>
      )}

      {/* Questions Phase */}
      {showQuestions && currentQuestion && (
        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Question {questionIdx + 1} of {currentItem.questions.length}
          </p>
          <h3 className="text-sm font-bold text-white">{currentQuestion.text}</h3>

          <div className="space-y-2">
            {currentQuestion.options.map((option, optIdx) => (
              <button
                key={optIdx}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedAnswer === option
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    : "bg-gray-800/50 border-gray-700/40 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                }`}
              >
                <span className="font-bold mr-2 text-gray-500">{String.fromCharCode(65 + optIdx)}.</span>
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all ${
              selectedAnswer
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                : "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {itemIdx === items.length - 1 && questionIdx === currentItem.questions.length - 1
              ? "Submit Section"
              : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
