"use client";

import { useState, useCallback } from "react";
import ChatInput from "@/components/ChatInput";
import DashboardGrid from "@/components/DashboardGrid";
import InsightPanel from "@/components/InsightPanel";
import Loader from "@/components/Loader";
import FileUpload from "@/components/FileUpload";
import QueryHistory from "@/components/QueryHistory";
import { useDashboardQuery } from "@/hooks/useDashboardQuery";
import { Database, MessageSquare, BarChart3 } from "lucide-react";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { mutate, data, isPending, error, reset } = useDashboardQuery();
  const [history, setHistory] = useState<
    { query: string; title: string }[]
  >([]);

  const handleQuery = useCallback(
    (query: string) => {
      mutate(
        { query, session_id: sessionId },
        {
          onSuccess: (res) => {
            setSessionId(res.session_id);
            setHistory((prev) => [
              ...prev,
              { query, title: res.title },
            ]);
          },
        }
      );
    },
    [mutate, sessionId]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Dashboard</h1>
              <p className="text-xs text-[var(--muted)]">
                Ask anything about your data
              </p>
            </div>
          </div>
          <FileUpload />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Empty State */}
        {!data && !isPending && !error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Ask a question about your data
              </h2>
              <p className="text-[var(--muted)] mb-8">
                Type a plain English question below and get an interactive
                dashboard instantly. Upload a CSV or use the built-in demo
                data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  "Show total revenue by region",
                  "Monthly revenue trend for 2025",
                  "Top 5 products by profit",
                  "Compare revenue vs cost by category",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuery(q)}
                    className="p-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-sm text-left"
                  >
                    <Database className="w-4 h-4 text-blue-500 mb-1" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isPending && <Loader />}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
            <h3 className="text-red-400 font-semibold mb-2">
              Query Failed
            </h3>
            <p className="text-sm text-red-300/80">
              {(error as Error).message ||
                "Something went wrong. Please try rephrasing your query."}
            </p>
            <button
              onClick={() => reset()}
              className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard */}
        {data && !isPending && (
          <>
            {/* Title & metadata */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{data.title}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {data.row_count} rows returned
                </p>
              </div>
              <div className="text-xs font-mono bg-[var(--card)] border border-[var(--card-border)] rounded-lg px-3 py-2 max-w-md truncate text-[var(--muted)]">
                {data.generated_sql}
              </div>
            </div>

            {/* Insights */}
            {data.insights?.length > 0 && (
              <InsightPanel insights={data.insights} />
            )}

            {/* Charts */}
            <DashboardGrid charts={data.charts} />
          </>
        )}

        {/* Query History Sidebar */}
        {history.length > 0 && (
          <QueryHistory history={history} onSelect={handleQuery} />
        )}
      </main>

      {/* Chat Input — fixed bottom */}
      <div className="sticky bottom-0 border-t border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <ChatInput onSubmit={handleQuery} isLoading={isPending} />
        </div>
      </div>
    </div>
  );
}
