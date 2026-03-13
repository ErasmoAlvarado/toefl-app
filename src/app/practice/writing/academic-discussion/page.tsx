"use client";

import React, { useState, useEffect, Suspense } from "react";
import AcademicDiscussion from "@/components/features/writing/AcademicDiscussion";
import { fetchWritingPromptById } from "@/actions/writing.actions";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AcademicDiscussionScenario } from "@/types/writing.types";

function NonSuspendedAcademicDiscussionPage() {
  const searchParams = useSearchParams();
  const promptId = searchParams.get("promptId");
  const [scenario, setScenario] = useState<AcademicDiscussionScenario | null>(null);
  const [isLoading, setIsLoading] = useState(!!promptId);

  useEffect(() => {
    if (!promptId) return;

    async function loadPrompt() {
      const result = await fetchWritingPromptById(promptId!);
      if (result.success && result.data) {
        const posts = result.data.discussion_posts as Record<string, unknown> | null;
        if (posts && posts.scenario) {
          setScenario(posts.scenario as AcademicDiscussionScenario);
        }
      }
      setIsLoading(false);
    }
    loadPrompt();
  }, [promptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading content…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <AcademicDiscussion initialScenario={scenario ?? undefined} />
    </div>
  );
}

export default function AcademicDiscussionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <NonSuspendedAcademicDiscussionPage />
    </Suspense>
  )
}

