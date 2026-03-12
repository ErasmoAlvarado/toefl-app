"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ListeningResultsProps {
  score: number;
  maxScore: number;
  answers: Record<string, any>;
  transcript?: string | null;
  onExit: () => void;
}

export function ListeningResults({ score, maxScore, answers, transcript, onExit }: ListeningResultsProps) {
  const percentage = Math.round((score / Math.max(maxScore, 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-32 flex items-center justify-center">
           <h1 className="text-4xl font-black text-white drop-shadow-md">Listening Complete!</h1>
        </div>
        <CardContent className="p-10 text-center -mt-8">
          <div className="bg-white dark:bg-slate-950 w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-lg border-4 border-indigo-50 dark:border-indigo-900/30 mb-6">
            <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600">
              {score}
            </span>
            <span className="text-2xl text-slate-400">/{maxScore}</span>
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
            {percentage >= 80 
              ? "Excellent work! You've mastered most of the Listening content. Keep it up." 
              : percentage >= 60 
              ? "Good effort! You're on track, but there's room for improvement." 
              : "Keep practicing! Focus on catching specific details and implied meanings."}
          </p>

          <Progress value={percentage} className="h-3 w-2/3 mx-auto mb-10" />

          <Button 
            onClick={onExit}
            className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 rounded-xl dark:bg-white dark:text-slate-900 mb-8"
          >
            Return to Hub <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {transcript && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-left">
              <h3 className="text-xl font-bold mb-4">Transcription</h3>
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
                {transcript}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
