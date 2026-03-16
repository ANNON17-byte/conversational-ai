import axios, { AxiosError } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60_000, // LLM calls can take time
  headers: { "Content-Type": "application/json" },
});

// ── Types ──────────────────────────────────────────────────────────────

export interface DashboardRequest {
  query: string;
  session_id?: string | null;
}

export interface ChartConfig {
  type: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  labelKey?: string;
  valueKey?: string;
  data: Record<string, unknown>[];
}

export interface DashboardResponse {
  session_id: string;
  title: string;
  query: string;
  generated_sql: string;
  charts: ChartConfig[];
  insights: string[];
  row_count: number;
}

export interface SchemaResponse {
  tables: string[];
  schema: {
    table: string;
    columns: { name: string; type: string }[];
  }[];
}

export interface UploadResponse {
  message: string;
  table_name: string;
  columns: string[];
  dtypes: Record<string, string>;
  row_count: number;
  sample: Record<string, unknown>[];
}

// ── API Functions ──────────────────────────────────────────────────────

export async function generateDashboard(
  req: DashboardRequest
): Promise<DashboardResponse> {
  try {
    const { data } = await client.post<DashboardResponse>(
      "/generate-dashboard",
      req
    );
    return data;
  } catch (err) {
    throw extractErrorMessage(err);
  }
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const { data } = await client.post<UploadResponse>(
      "/upload-csv",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  } catch (err) {
    throw extractErrorMessage(err);
  }
}

export async function fetchSchema(): Promise<SchemaResponse> {
  const { data } = await client.get<SchemaResponse>("/schema");
  return data;
}

export async function fetchSessionHistory(
  sessionId: string
): Promise<{ session_id: string; history: { user_query: string; generated_sql: string }[] }> {
  const { data } = await client.get(`/session/${sessionId}/history`);
  return data;
}

// ── Error extraction ───────────────────────────────────────────────────

function extractErrorMessage(err: unknown): Error {
  if (err instanceof AxiosError && err.response?.data) {
    const detail = err.response.data.detail;
    if (typeof detail === "string") return new Error(detail);
    if (typeof detail === "object" && detail?.msg) return new Error(detail.msg);
    return new Error(JSON.stringify(detail));
  }
  if (err instanceof Error) return err;
  return new Error("An unexpected error occurred.");
}
