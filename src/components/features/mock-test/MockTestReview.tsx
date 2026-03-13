"use client";

import React, { useState } from "react";
import {
  MockTestAttemptResult,
  FullMockTestData,
  MockTestSection,
} from "@/types/mocktest.types";
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MockTestReviewProps {
  result: MockTestAttemptResult;
  testData: FullMockTestData;
  onBack: () => void;
}

const SECTIONS: { key: MockTestSection; icon: React.ElementType; label: string; color: string }[] = [
  { key: "reading", icon: BookOpen, label: "Reading", color: "text-blue-400" },
  { key: "listening", icon: Headphones, label: "Listening", color: "text-emerald-400" },
  { key: "writing", icon: PenTool, label: "Writing", color: "text-purple-400" },
  { key: "speaking", icon: Mic, label: "Speaking", color: "text-amber-400" },
];

export default function MockTestReview({ result, testData, onBack }: MockTestReviewProps) {
  const [activeSection, setActiveSection] = useState<MockTestSection>("reading");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const renderReadingReview = () => {
    const allPassages = [
      ...testData.reading.router.passages,
      ...(result.readingPath === "upper"
        ? testData.reading.upper.passages
        : testData.reading.lower.passages),
    ];

    return (
      <div className="space-y-4">
        {allPassages.map((passage) => (
          <div key={passage.id} className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 overflow-hidden">
            <button
              onClick={() => toggleItem(passage.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{passage.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 capitalize">{passage.passageType} • {passage.questions.length} questions</p>
                </div>
              </div>
              {expandedItem === passage.id ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedItem === passage.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-800">
                {/* Passage text excerpt */}
                <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30 max-h-48 overflow-auto">
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {passage.content.slice(0, 500)}...
                  </p>
                </div>
                {/* Questions */}
                {passage.questions.map((q, idx) => {
                  const userAnswer = result.readingAnswers[q.id];
                  const isCorrect = checkReadingCorrect(q, userAnswer);
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-4 rounded-xl border",
                        isCorrect
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Q{idx + 1}: {q.question}
                        </p>
                      </div>
                      <div className="ml-6 space-y-1 text-xs">
                        <p className="text-gray-400">
                          <span className="text-gray-500">Your answer:</span>{" "}
                          <span className={isCorrect ? "text-green-300" : "text-red-300"}>
                            {userAnswer ? (Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer) : "No answer"}
                          </span>
                        </p>
                        {!isCorrect && "correctAnswer" in q && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Correct:</span>{" "}
                            <span className="text-green-300">{(q as any).correctAnswer || (q as any).correctPosition}</span>
                          </p>
                        )}
                        <p className="text-gray-500 mt-1 italic">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderListeningReview = () => {
    const allItems = [
      ...testData.listening.router.items,
      ...(result.listeningPath === "upper"
        ? testData.listening.upper.items
        : testData.listening.lower.items),
    ];

    return (
      <div className="space-y-4">
        {allItems.map((item) => (
          <div key={item.id} className="bg-gray-900/60 rounded-2xl border border-gray-700/50 overflow-hidden">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 capitalize">{item.type.replace(/_/g, " ")} • {item.questions.length} questions</p>
                </div>
              </div>
              {expandedItem === item.id ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedItem === item.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-800">
                {/* Transcript */}
                <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30 max-h-48 overflow-auto">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-1">Transcript</p>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.transcript}</p>
                </div>
                {/* Questions */}
                {item.questions.map((q, idx) => {
                  const userAnswer = result.listeningAnswers[`${item.id}-q${idx}`];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-4 rounded-xl border",
                        isCorrect
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          Q{idx + 1}: {q.text}
                        </p>
                      </div>
                      <div className="ml-6 space-y-1 text-xs">
                        <p className="text-gray-400">
                          <span className="text-gray-500">Your answer:</span>{" "}
                          <span className={isCorrect ? "text-green-300" : "text-red-300"}>
                            {userAnswer || "No answer"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Correct:</span>{" "}
                            <span className="text-green-300">{q.correctAnswer}</span>
                          </p>
                        )}
                        <p className="text-gray-500 mt-1 italic">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWritingReview = () => {
    return (
      <div className="space-y-4">
        {/* Build a Sentence */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Build a Sentence</h4>
          <div className="space-y-2">
            {result.writingResponses.buildSentence.map((bs, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs",
                  bs.isCorrect
                    ? "bg-green-500/5 border-green-500/20 text-green-300"
                    : "bg-red-500/5 border-red-500/20 text-red-300"
                )}
              >
                {bs.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>Item {bs.itemId}: {bs.userOrder.join(" ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Write an Email</h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30">
            <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
              {result.writingResponses.emailText || "No response submitted."}
            </p>
          </div>
        </div>

        {/* Academic Discussion */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Academic Discussion</h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30">
            <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
              {result.writingResponses.discussionText || "No response submitted."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSpeakingReview = () => {
    return (
      <div className="space-y-4">
        {/* Listen & Repeat */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Listen & Repeat</h4>
          <div className="space-y-3">
            {result.speakingResponses.listenRepeat.map((lr, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30">
                <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-1">Prompt</p>
                <p className="text-xs text-slate-900 dark:text-white mb-2">{lr.prompt}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-1">Your Response</p>
                <p className="text-xs text-slate-600 dark:text-gray-400">{lr.transcript || "No recording"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interview */}
        <div className="bg-white/50 dark:bg-gray-900/60 rounded-2xl border border-slate-200 dark:border-gray-700/50 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Interview</h4>
          <div className="space-y-3">
            {result.speakingResponses.interview.map((iv, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700/30">
                <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-1">Question</p>
                <p className="text-xs text-slate-900 dark:text-white mb-2">{iv.question}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase mb-1">Your Response</p>
                <p className="text-xs text-slate-600 dark:text-gray-400">{iv.transcript || "No recording"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Review Answers</h1>
          <p className="text-xs text-slate-500 dark:text-gray-500">{testData.title}</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map(({ key, icon: Icon, label, color }) => (
          <button
            key={key}
            onClick={() => { setActiveSection(key); setExpandedItem(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
              activeSection === key
                ? `${color} bg-white/5 border-white/10`
                : "text-gray-500 bg-gray-900/40 border-gray-800 hover:text-gray-300"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {activeSection === "reading" && renderReadingReview()}
      {activeSection === "listening" && renderListeningReview()}
      {activeSection === "writing" && renderWritingReview()}
      {activeSection === "speaking" && renderSpeakingReview()}
    </div>
  );
}

/** Helper to check if a reading answer is correct */
function checkReadingCorrect(q: any, ans: any): boolean {
  if (!ans) return false;
  const qType = q.type?.toLowerCase() || "";
  if (qType === "insert text") return String(ans).trim().toLowerCase() === String(q.correctPosition || "").trim().toLowerCase();
  if (qType === "prose summary") {
    const correctArr = (q.correctAnswers || []) as string[];
    const ansArr = Array.isArray(ans) ? ans : [];
    return ansArr.filter((a: string) => correctArr.map((c: string) => c.trim().toLowerCase()).includes(a.trim().toLowerCase())).length >= 2;
  }
  if ("correctAnswer" in q) {
    const singleAns = Array.isArray(ans) ? ans[0] : ans;
    return String(singleAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  }
  return false;
}
