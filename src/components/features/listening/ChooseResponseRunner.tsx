"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AccentTag, GeneratedChooseResponse } from "@/types/listening.types";
import { useTTS } from "@/hooks/useTTS";

interface ChooseResponseRunnerProps {
  item: GeneratedChooseResponse;
  mode: "practice" | "mock";
  accent: AccentTag | "Random";
  onAnswer: (selectedOption: string) => void;
}

export function ChooseResponseRunner({ item, mode, accent, onAnswer }: ChooseResponseRunnerProps) {
  const { playTTS, stopTTS, isPlaying, isLoading } = useTTS();
  const [selected, setSelected] = useState<string>("");
  const [hasPlayed, setHasPlayed] = useState(false);
  const mountPlayTriggered = useRef<string | null>(null);

  // Auto-play the prompt once on mount in both modes
  useEffect(() => {
    if (mountPlayTriggered.current === item.audio_prompt_text) return;
    mountPlayTriggered.current = item.audio_prompt_text;
    playAndMark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.audio_prompt_text]);

  const playAndMark = () => {
    playTTS(item.audio_prompt_text, mode === "mock" ? "Random" : accent);
    setHasPlayed(true);
  };

  const handleSelect = (val: string) => {
    setSelected(val);
  };

  const handleSubmit = () => {
    if (selected) {
      onAnswer(selected);
      // reset for next item
      setSelected("");
      setHasPlayed(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Listen and Choose a Response</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              You will hear a short statement or question. Then, select the most appropriate response from the options below.
            </p>
          </div>

          {/* Audio Player UX */}
          <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-full w-48 h-48 border border-slate-100 dark:border-slate-800 shadow-inner">
            {isLoading ? (
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            ) : isPlaying ? (
               <Button onClick={stopTTS} variant="destructive" size="icon" className="w-20 h-20 rounded-full shadow-lg hover:scale-105 transition-transform">
                 <Square className="w-8 h-8 fill-current" />
               </Button>
            ) : (
               <Button 
                onClick={playAndMark} 
                variant="default" 
                size="icon" 
                className="w-20 h-20 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-transform"
                disabled={mode === "mock" && hasPlayed}
               >
                 <Play className="w-8 h-8 fill-current ml-2" />
               </Button>
            )}
          </div>
          {mode === "mock" && (
            <p className="text-xs text-rose-500 font-medium">Replay is disabled in Mock mode.</p>
          )}

          {/* Answer Options Container - revealed only after started playing or finished */}
          <div className="w-full mt-8 opacity-100 transition-opacity duration-1000">
             <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3">
              {item.options.map((opt, i) => (
                <div key={i} className={`flex items-start space-x-3 border rounded-xl p-4 transition-colors cursor-pointer ${selected === opt ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                  <RadioGroupItem value={opt} id={`opt-${i}`} className="mt-1" />
                  <Label htmlFor={`opt-${i}`} className="text-base leading-relaxed flex-1 cursor-pointer font-normal text-slate-700 dark:text-slate-300">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="w-full flex justify-end pt-4">
             <Button 
               onClick={handleSubmit} 
               disabled={!selected || isPlaying}
               className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
             >
               Confirm & Continue
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
