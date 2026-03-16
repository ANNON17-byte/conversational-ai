"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end gap-3">
      <div className="flex-1 relative">
        <div className="absolute left-3 top-3 text-blue-500">
          <Sparkles className="w-5 h-5" />
        </div>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data..."
          disabled={isLoading}
          rows={1}
          className="w-full pl-11 pr-4 py-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 disabled:opacity-50 placeholder:text-[var(--muted)]"
          style={{ minHeight: "48px", maxHeight: "120px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "48px";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || isLoading}
        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/30 rounded-xl transition-colors flex items-center justify-center"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
