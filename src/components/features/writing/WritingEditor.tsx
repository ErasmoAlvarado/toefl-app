"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface WritingEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Draft key for localStorage persistence */
  draftKey?: string;
  /** Whether to disable the editor */
  disabled?: boolean;
  /** Min height in pixels */
  minHeight?: number;
  className?: string;
}

/**
 * Core reusable writing textarea with:
 * - Auto-save to localStorage (anti-crash)
 * - Word count display
 * - Spellcheck disabled (no grammar check)
 */
export default function WritingEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  draftKey,
  disabled = false,
  minHeight = 220,
  className,
}: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!draftKey) return;
    const saved = localStorage.getItem(`writing_draft_${draftKey}`);
    if (saved && !value) {
      onChange(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Auto-save draft on change
  const saveDraft = useCallback(
    (text: string) => {
      if (!draftKey) return;
      localStorage.setItem(`writing_draft_${draftKey}`, text);
    },
    [draftKey]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    saveDraft(newValue);
  };

  /** Clear persisted draft (call after successful submission) */
  const clearDraft = useCallback(() => {
    if (draftKey) {
      localStorage.removeItem(`writing_draft_${draftKey}`);
    }
  }, [draftKey]);

  // Expose clearDraft to parent via data attribute for simplicity
  useEffect(() => {
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement & { clearDraft?: () => void }).clearDraft = clearDraft;
    }
  }, [clearDraft]);

  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{ minHeight: `${minHeight}px` }}
        className={cn(
          "w-full bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 text-sm text-gray-200",
          "placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
          "focus:border-emerald-500/40 transition-all leading-relaxed",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-gray-500">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        {draftKey && (
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            Auto-saved
          </span>
        )}
      </div>
    </div>
  );
}
