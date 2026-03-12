"use client";

import { useState, useRef, useEffect } from "react";
import { AccentTag } from "@/types/listening.types";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = async (text: string, accent: AccentTag | "Random" = "en-US") => {
    if (!text) return;
    
    // Determine target voice
    let voice = "en-US-GuyNeural"; // default
    if (accent === "en-GB") voice = "en-GB-RyanNeural";
    else if (accent === "en-AU") voice = "en-AU-WilliamNeural";
    else if (accent === "Random") {
      const voices = ["en-US-GuyNeural", "en-GB-RyanNeural", "en-AU-WilliamNeural"];
      voice = voices[Math.floor(Math.random() * voices.length)];
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice })
      });

      if (!res.ok) throw new Error("TTS generation failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      
      // Fallback Strategy (Web Speech API)
      if ('speechSynthesis' in window) {
         const utterance = new SpeechSynthesisUtterance(text);
         if (accent === "en-GB") utterance.lang = "en-GB";
         if (accent === "en-AU") utterance.lang = "en-AU";
         
         utterance.onstart = () => setIsPlaying(true);
         utterance.onend = () => setIsPlaying(false);
         window.speechSynthesis.speak(utterance);
      }
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    return () => {
      stopTTS(); // cleanup on unmount
    };
  }, []);

  return { playTTS, stopTTS, isPlaying, isLoading };
}
