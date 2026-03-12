"use client";

import * as React from "react";
import { useState } from "react";
import { PenSquare, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotepadPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [notes, setNotes] = useState("");

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline" 
        className="fixed bottom-6 right-6 shadow-xl rounded-full w-14 h-14 bg-indigo-600 text-white hover:bg-indigo-700 border-none transition-transform hover:scale-105"
      >
        <PenSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed right-6 bottom-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out z-50",
      isMaximized ? "w-[600px] h-[80vh]" : "w-[350px] h-[400px]"
    )}>
      {/* Header */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
          <PenSquare className="w-4 h-4" />
          <span className="font-semibold text-sm">Notepad</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-500" onClick={() => setIsOpen(false)}>
            <span className="text-lg leading-none">&times;</span>
          </Button>
        </div>
      </div>
      
      {/* Body */}
      <div className="flex-1 p-2 bg-[#fdfdfc] dark:bg-[#0f1115]">
        <textarea 
          className="w-full h-full resize-none border-none outline-none bg-transparent p-2 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
          placeholder="Take your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
