"use client";

import ChartRenderer from "./ChartRenderer";

interface Chart {
  type: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  labelKey?: string;
  valueKey?: string;
  data: Record<string, unknown>[];
}

interface DashboardGridProps {
  charts: Chart[];
}

export default function DashboardGrid({ charts }: DashboardGridProps) {
  if (!charts || charts.length === 0) return null;

  // Decide grid layout based on chart count
  const gridCols =
    charts.length === 1
      ? "grid-cols-1"
      : charts.length === 2
        ? "grid-cols-1 lg:grid-cols-2"
        : "grid-cols-1 lg:grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {charts.map((chart, idx) => (
        <div
          key={idx}
          className={`rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 ${
            charts.length === 3 && idx === 2 ? "lg:col-span-2" : ""
          }`}
        >
          <h3 className="text-sm font-semibold mb-4 text-[var(--foreground)]">
            {chart.title}
          </h3>
          <ChartRenderer chart={chart} />
        </div>
      ))}
    </div>
  );
}
