"use client";

import { FullTestComingSoon } from "@/components/ui/FullTestComingSoon";

export default function SpeakingFullTestPage() {
  return (
    <FullTestComingSoon
      moduleName="Speaking"
      backHref="/dashboard/speaking"
      accentGradient="from-indigo-500 to-purple-600"
      accentStyle="border-indigo-500/20 text-indigo-300"
      iconColor="text-indigo-400"
    />
  );
}
