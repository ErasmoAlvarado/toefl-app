import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";

interface WritingGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: {
    topic: string;
    taskType: string;
    difficulty: string;
  }) => void;
  isGenerating: boolean;
}

export function GenerationDialog({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: WritingGenerationDialogProps) {
  const [topic, setTopic] = useState("");
  const [taskType, setTaskType] = useState("random");
  const [difficulty, setDifficulty] = useState("random");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      topic: topic.trim(),
      taskType,
      difficulty,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Customize Your Writing Practice
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tailor the AI-generated writing task to focus on specific topics, task
          types, or adjust the difficulty level. Leave options as &quot;Random&quot; for a
          surprise!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Topic (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. University Life, Climate Change, Technology..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Task Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Writing Task Type (TOEFL 2026)
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
            >
              <option value="random">Random (Mix)</option>
              <option value="build_sentence">
                Build a Sentence (10 items)
              </option>
              <option value="email">Write an Email</option>
              <option value="academic_discussion">
                Academic Discussion
              </option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
            >
              <option value="random">Random (Adaptive)</option>
              <option value="1">Level 1 - Beginner</option>
              <option value="2">Level 2 - Easy</option>
              <option value="3">Level 3 - Intermediate</option>
              <option value="4">Level 4 - Hard</option>
              <option value="5">Level 5 - Expert</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                "Start Generation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
