"use client";

import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-[var(--muted)] text-sm">
          Analyzing your question...
        </p>
        <div className="mt-4 flex items-center gap-2 justify-center text-xs text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Generating SQL
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
          Executing query
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300" />
          Building charts
        </div>
      </div>
    </div>
  );
}
