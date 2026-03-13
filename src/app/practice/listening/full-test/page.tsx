"use client";

import { FullTestComingSoon } from "@/components/ui/FullTestComingSoon";

export default function ListeningFullTestPage() {
  return (
    <FullTestComingSoon
      moduleName="Listening"
      backHref="/dashboard/listening"
      accentGradient="from-emerald-500 to-teal-600"
      accentStyle="border-emerald-500/20 text-emerald-300"
      iconColor="text-emerald-400"
    />
  );
}
