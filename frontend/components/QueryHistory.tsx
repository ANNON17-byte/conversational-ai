"use client";

import { History } from "lucide-react";

interface QueryHistoryProps {
  history: { query: string; title: string }[];
  onSelect: (query: string) => void;
}

export default function QueryHistory({ history, onSelect }: QueryHistoryProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-[var(--muted)]" />
        <h3 className="text-sm font-semibold text-[var(--muted)]">
          Recent Queries
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.query)}
            className="px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-xs text-[var(--muted)] hover:text-blue-400 hover:border-blue-500/30 transition-colors truncate max-w-[250px]"
            title={item.query}
          >
            {item.query}
          </button>
        ))}
      </div>
    </div>
  );
}
