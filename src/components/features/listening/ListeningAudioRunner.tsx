"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Loader2, Play, Pause, Volume2, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AccentTag, GeneratedTrack, ListeningQuestion } from "@/types/listening.types";

interface ListeningAudioRunnerProps {
  track: GeneratedTrack;
  mode: "practice" | "mock";
  accent: AccentTag | "Random";
  onComplete: (answers: Record<string, string>) => void;
  title?: string;
}

export function ListeningAudioRunner({ track, mode, accent, onComplete, title }: ListeningAudioRunnerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Question State
  const [showingQuestions, setShowingQuestions] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const transcriptRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate TTS on mount
    const generateAudio = async () => {
      if (transcriptRef.current === track.transcript) return;
      transcriptRef.current = track.transcript;

      setIsLoading(true);
      let voice = "en-US-GuyNeural"; // default
      if (accent === "en-GB") voice = "en-GB-RyanNeural";
      else if (accent === "en-AU") voice = "en-AU-WilliamNeural";
      else if (accent === "Random") {
        const voices = ["en-US-GuyNeural", "en-GB-RyanNeural", "en-AU-WilliamNeural", "en-US-JennyNeural"];
        voice = voices[Math.floor(Math.random() * voices.length)];
      }

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: track.transcript, voice })
        });
        if (res.ok) {
          const blob = await res.blob();
          setAudioUrl(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };

    generateAudio();
  }, [track.transcript, accent]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
      const updateDuration = () => setDuration(audio.duration);
      const onEnded = () => {
        setIsPlaying(false);
        setHasPlayed(true);
        if (mode === "mock") setShowingQuestions(true); // auto switch in mock
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("loadedmetadata", updateDuration);
      audio.addEventListener("ended", onEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("ended", onEnded);
      };
    }
  }, [audioUrl, mode]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (vals: number | readonly number[]) => {
    if (audioRef.current) {
      const val = Array.isArray(vals) ? vals[0] : (vals as number);
      const newTime = (val / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(val);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQ]: option });
  };

  const handleNextQ = () => {
    if (currentQ < track.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Done
      onComplete(answers);
    }
  };

  if (showingQuestions) {
    const q = track.questions[currentQ];
    const selected = answers[currentQ] || "";

    return (
      <Card className="max-w-4xl mx-auto shadow-sm mt-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6 text-sm text-slate-500 font-medium">
            <span>{title || "Listening Passage"}</span>
            <span>Question {currentQ + 1} of {track.questions.length}</span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
            {q.text}
          </h3>

          <RadioGroup value={selected} onValueChange={handleAnswer} className="space-y-4">
            {q.options.map((opt, i) => (
              <div key={i} className={`flex items-start space-x-3 border rounded-xl p-4 transition-colors cursor-pointer ${selected === opt ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                <RadioGroupItem value={opt} id={`q-${currentQ}-opt-${i}`} className="mt-1" />
                <Label htmlFor={`q-${currentQ}-opt-${i}`} className="text-base leading-relaxed flex-1 cursor-pointer font-normal text-slate-700 dark:text-slate-300">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-10 flex justify-end">
            <Button 
               onClick={handleNextQ} 
               disabled={!selected}
               className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-xl dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {currentQ === track.questions.length - 1 ? "Finish Section" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-sm mt-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardContent className="p-10">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3">{title || "Listening Audio"}</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Listen carefully. You will answer questions after the audio finishes.
          </p>
        </div>

        {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
          {isLoading ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-500 animate-pulse">Generating high-quality audio stream...</p>
            </div>
          ) : (
            <div className="space-y-8">
               <div className="flex items-center justify-center space-x-6">
                 <Button disabled={mode === "mock" && hasPlayed} onClick={togglePlay} className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-transform hover:scale-105">
                   {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
                 </Button>
               </div>
               
               <div className="space-y-2">
                 <Slider 
                   value={[progress]} 
                   max={100} 
                   step={0.1} 
                   onValueChange={handleSeek} 
                   // Disable seeking in mock mode unless they've finished at least once
                   disabled={(mode === "mock" && !hasPlayed) || !audioUrl} 
                   className="w-full"
                 />
                 <div className="flex justify-between text-xs text-slate-500 font-mono">
                   <span>{formatTime((progress / 100) * duration)}</span>
                   <span>{formatTime(duration)}</span>
                 </div>
               </div>

               {mode === "practice" && hasPlayed && (
                 <div className="flex justify-center pt-4">
                   <Button onClick={() => setShowingQuestions(true)} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                     Skip to Questions <FastForward className="ml-2 w-4 h-4" />
                   </Button>
                 </div>
               )}
            </div>
          )}
        </div>
        
        {mode === "mock" && (
           <p className="text-center text-xs text-rose-500 mt-6 font-medium">Replay is disabled in Mock mode. Questions will appear automatically.</p>
        )}
      </CardContent>
    </Card>
  );
}
