"use client";

import * as React from "react";
import { useState } from "react";
import { GeneratedListeningContent, GeneratedChooseResponse, GeneratedTrack, AccentTag } from "@/types/listening.types";
import { ChooseResponseRunner } from "./ChooseResponseRunner";
import { ListeningAudioRunner } from "./ListeningAudioRunner";
import { NotepadPanel } from "./NotepadPanel";

interface AdaptiveListeningMockProps {
  content: GeneratedListeningContent;
  onFinish: (scoreInfo: { totalScore: number; maxScore: number; answers: any }) => void;
}

type Stage = "router" | "second";
type ModuleSelection = "upper" | "lower" | null;

export function AdaptiveListeningMock({ content, onFinish }: AdaptiveListeningMockProps) {
  const [stage, setStage] = useState<Stage>("router");
  const [selection, setSelection] = useState<ModuleSelection>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [routerScore, setRouterScore] = useState(0);

  // Helper to extract the item by ID from the massive content object
  // Since Gemini just gives arrays, the `mst_plan` arrays likely contain indices or we just play them in order.
  // The Prompt was: "output an MST plan (router/upper/lower modules), with some unscored tryout items marked."
  // Wait, if mst_plan has references, we need to map them. Let's assume for simplicity we just play the router sequentially
  // Then calculate score.
  
  // Let's create a linear sequence array for the current stage based on the plan.
  // The easiest is to parse `content.mst_plan.router` which might be an array of strings like "choose_response_1".
  
  const getLinearItems = (stageKey: "router" | "upper" | "lower") => {
    return content.mst_plan[stageKey].map((itemId) => {
      if (itemId.startsWith("choose_response")) {
        const idx = parseInt(itemId.split("_").pop() || "1") - 1;
        return { type: "choose", item: content.choose_responses[idx], id: itemId };
      }
      if (itemId.startsWith("conversation")) {
        const idx = parseInt(itemId.split("_").pop() || "1") - 1;
        return { type: "conversation", item: content.conversations[idx], id: itemId };
      }
      if (itemId.startsWith("announcement")) {
        const idx = parseInt(itemId.split("_").pop() || "1") - 1;
        return { type: "announcement", item: content.announcements[idx], id: itemId };
      }
      if (itemId.startsWith("academic_talk")) {
        const idx = parseInt(itemId.split("_").pop() || "1") - 1;
        return { type: "academic_talk", item: content.academic_talks[idx], id: itemId };
      }
      return null;
    }).filter(Boolean) as Array<{ type: string; item: any; id: string }>;
  };

  const currentSequence = getLinearItems(stage === "router" ? "router" : selection || "lower");
  const currentObj = currentSequence[currentIndex];

  const handleNext = (answersOrSelection: any) => {
    // Save answers
    setUserAnswers(prev => ({ ...prev, [currentObj.id]: answersOrSelection }));

    // Evaluate score if we finished an item
    let pointsEarned = 0;
    if (currentObj.type === "choose") {
      if (answersOrSelection === (currentObj.item as GeneratedChooseResponse).correct_option) {
        pointsEarned = 1;
      }
    } else {
      // it's a track with multiple questions
      const track = currentObj.item as GeneratedTrack;
      Object.keys(answersOrSelection).forEach(qIdx => {
         if (answersOrSelection[qIdx] === track.questions[parseInt(qIdx)].correctAnswer) {
           pointsEarned += 1;
         }
      });
    }

    if (stage === "router") {
      setRouterScore(prev => prev + pointsEarned);
    }

    if (currentIndex < currentSequence.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of stage
      if (stage === "router") {
        // Evaluate routing
        const maxRouterPoints = currentSequence.reduce((acc, obj) => {
           return acc + (obj.type === "choose" ? 1 : (obj.item as GeneratedTrack).questions.length);
        }, 0);
        
        const isUpper = (routerScore + pointsEarned) >= (maxRouterPoints * 0.6); // 60% threshold
        setSelection(isUpper ? "upper" : "lower");
        setStage("second");
        setCurrentIndex(0);
      } else {
        // End of exam
        onFinish({ totalScore: routerScore + pointsEarned, maxScore: 30 /* approx */, answers: { ...userAnswers, [currentObj.id]: answersOrSelection } });
      }
    }
  };

  if (!currentObj) return <div>Invalid MST Plan Structure</div>;

  return (
    <div className="w-full relative pb-20">
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 flex justify-between">
        <span className="font-semibold text-indigo-800 dark:text-indigo-300">
          Listening Section: {stage === "router" ? "Router Module" : "Second Stage"}
        </span>
        <span className="text-sm text-slate-500">
          Item {currentIndex + 1} of {currentSequence.length}
        </span>
      </div>

      <div className="mt-8">
        {currentObj.type === "choose" ? (
          <ChooseResponseRunner
            item={currentObj.item}
            mode="mock"
            accent="Random"
            onAnswer={handleNext}
          />
        ) : (
          <ListeningAudioRunner
            track={currentObj.item}
            mode="mock"
            accent="Random"
            title={`${currentObj.type.replace('_', ' ').toUpperCase()}`}
            onComplete={handleNext}
          />
        )}
      </div>

      <NotepadPanel />
    </div>
  );
}
