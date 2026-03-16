"use client";

import { Lightbulb } from "lucide-react";

interface InsightPanelProps {
  insights: string[];
}

export default function InsightPanel({ insights }: InsightPanelProps) {
  if (!insights.length) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-amber-400">AI Insights</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, idx) => (
          <li
            key={idx}
            className="text-sm text-amber-200/80 flex items-start gap-2"
          >
            <span className="text-amber-500 mt-0.5">&#8226;</span>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}
