"use client";

import * as React from "react";
import { useState } from "react";
import { GeneratedListeningContent, ListeningMaterial } from "@/types/listening.types";
import { AdaptiveListeningMock } from "./AdaptiveListeningMock";
import { ListeningResults } from "./ListeningResults";
import { saveListeningSession } from "@/actions/listening.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Play, Loader2, FileAudio } from "lucide-react";
import { toast } from "sonner";

interface ListeningHubProps {
  initialMaterials: ListeningMaterial[];
}

export function ListeningHub({ initialMaterials }: ListeningHubProps) {
  const [mockContent, setMockContent] = useState<GeneratedListeningContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [examState, setExamState] = useState<"idle" | "running" | "finished">("idle");
  const [scoreInfo, setScoreInfo] = useState<{ totalScore: number; maxScore: number; answers: any } | null>(null);

  const startMockExam = async () => {
    setIsGenerating(true);
    setExamState("idle");
    try {
      const res = await fetch("/api/ai/generate-listening", { method: "POST" });
      const { success, data, error } = await res.json();
      
      if (!success) throw new Error(error || "Failed to generate mock exam");
      
      setMockContent(data);
      setExamState("running");
    } catch (err: any) {
      toast.error(err.message, { description: "Try again later." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishExam = async (info: { totalScore: number; maxScore: number; answers: any }) => {
    setScoreInfo(info);
    setExamState("finished");
    
    // Attempt saving to DB
    // Formatting answers to attempts structure expected by action
    const attempts = Object.keys(info.answers).map(key => ({
       questionId: key,
       questionType: "multiple_choice",
       userAnswer: info.answers[key],
       isCorrect: undefined, // Let the backend recalculate if needed, or we just store
       timeSpentSeconds: 0 // Optional tracking
    }));
    
    await saveListeningSession(info.totalScore, info.maxScore, 0, attempts);
  };

  if (examState === "running" && mockContent) {
    return <AdaptiveListeningMock content={mockContent} onFinish={handleFinishExam} />;
  }

  if (examState === "finished" && scoreInfo) {
    return <ListeningResults score={scoreInfo.totalScore} maxScore={scoreInfo.maxScore} answers={scoreInfo.answers} onExit={() => setExamState("idle")} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Listening Hub</h1>
          <p className="text-slate-500">Tune those ears in! Practice with adaptive mock exams or targeted topics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Mock Generation */}
        <Card className="border-indigo-100 dark:border-indigo-950 shadow-md relative overflow-hidden group hover:shadow-xl transition-shadow bg-gradient-to-br from-[#f8f9ff] to-[#ffffff] dark:from-[#0f121d] dark:to-[#0f1115]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
           <CardHeader>
             <CardTitle className="flex items-center space-x-2 text-xl">
               <span className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                 <Play className="w-5 h-5 fill-current" />
               </span>
               <span>Full Adaptive Mock</span>
             </CardTitle>
             <CardDescription className="text-sm pt-2">
               Dive straight into the action with the new TOEFL 2026 format. Our AI is brewing up a full MST mock test with multi-accent TTS voices as we speak!
             </CardDescription>
           </CardHeader>
           <CardContent className="pt-4">
             <Button 
               onClick={startMockExam} 
               disabled={isGenerating}
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-base font-semibold transition-transform active:scale-95"
             >
               {isGenerating ? (
                 <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing AI Mock Exam...</>
               ) : (
                 "Generate & Start Exam"
               )}
             </Button>
           </CardContent>
        </Card>

        {/* Practice List Example */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
               <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                 <FileAudio className="w-5 h-5 text-slate-700 dark:text-slate-300" />
               </span>
               <span>Practice Library</span>
            </CardTitle>
            <CardDescription className="text-sm pt-2">
              Browse previously generated individual listening tasks (Conversations, Lectures, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
             {initialMaterials.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No materials found. Take a full mock to generate content!
                </div>
             ) : (
                initialMaterials.slice(0, 4).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-3/4">{m.title}</span>
                    <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">{m.type}</span>
                  </div>
                ))
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
