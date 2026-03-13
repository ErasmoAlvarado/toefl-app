"use client";

import { FullTestComingSoon } from "@/components/ui/FullTestComingSoon";

export default function WritingFullTestPage() {
  return (
    <FullTestComingSoon
      moduleName="Writing"
      backHref="/dashboard/writing"
      accentGradient="from-purple-500 to-pink-600"
      accentStyle="border-purple-500/20 text-purple-300"
      iconColor="text-purple-400"
    />
  );
}
