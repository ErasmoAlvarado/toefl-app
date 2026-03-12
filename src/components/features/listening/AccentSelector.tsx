"use client";

import * as React from "react";
import { AccentTag } from "@/types/listening.types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccentSelectorProps {
  value: AccentTag | "Random";
  onChange: (value: AccentTag | "Random") => void;
  disabled?: boolean;
}

export function AccentSelector({ value, onChange, disabled = false }: AccentSelectorProps) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        TTS Accent:
      </span>
      <Select
        value={value}
        onValueChange={(val: string | null) => val && onChange(val as AccentTag | "Random")}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Select Accent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Random">
            <div className="flex items-center">
              <Badge variant="secondary" className="mr-2 px-1">MIX</Badge> Auto (Exam)
            </div>
          </SelectItem>
          <SelectItem value="en-US">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 px-1">US</Badge> American
            </div>
          </SelectItem>
          <SelectItem value="en-GB">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 px-1">GB</Badge> British
            </div>
          </SelectItem>
          <SelectItem value="en-AU">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 px-1">AU</Badge> Australian
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
