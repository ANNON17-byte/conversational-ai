"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

interface ChartConfig {
  type: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  labelKey?: string;
  valueKey?: string;
  data: Record<string, unknown>[];
}

interface ChartRendererProps {
  chart: ChartConfig;
}

export default function ChartRenderer({ chart }: ChartRendererProps) {
  const { type, data, xAxis, yAxis, labelKey, valueKey } = chart;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--muted)] text-sm">
        No data available
      </div>
    );
  }

  const commonProps = {
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey={xAxis}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Bar
              dataKey={yAxis || valueKey || ""}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey={xAxis}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={yAxis || valueKey || ""}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6, fill: "#60a5fa" }}
            />
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey={xAxis}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={yAxis || valueKey || ""}
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorArea)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey || yAxis || ""}
              nameKey={labelKey || xAxis || ""}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "#64748b" }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey={xAxis}
              name={xAxis}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              type="number"
              dataKey={yAxis}
              name={yAxis}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter data={data} fill="#3b82f6">
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "table":
    default:
      return <DataTable data={data} />;
  }
}

function DataTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return null;
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-auto max-h-[400px] rounded-lg border border-[var(--card-border)]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[var(--card)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left font-medium text-[var(--muted)] border-b border-[var(--card-border)]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 100).map((row, i) => (
            <tr
              key={i}
              className="hover:bg-blue-500/5 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-4 py-2.5 border-b border-[var(--card-border)] text-[var(--foreground)]"
                >
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 100 && (
        <div className="text-center py-2 text-xs text-[var(--muted)]">
          Showing 100 of {data.length} rows
        </div>
      )}
    </div>
  );
}
