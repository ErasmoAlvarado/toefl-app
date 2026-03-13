"use client";

import { FullTestComingSoon } from "@/components/ui/FullTestComingSoon";

export default function ReadingFullTestPage() {
  return (
    <FullTestComingSoon
      moduleName="Reading"
      backHref="/dashboard/reading"
      accentGradient="from-blue-500 to-cyan-600"
      accentStyle="border-blue-500/20 text-blue-300"
      iconColor="text-blue-400"
    />
  );
}
