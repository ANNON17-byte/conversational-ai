# AI-Powered Business Intelligence Dashboard

A production-quality Conversational AI system that converts **natural language queries** into **interactive dashboards** in real time.

**Ask a question in plain English → get a full dashboard with charts and insights.**

--- 

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js  ·  TypeScript  ·  TailwindCSS  ·  Recharts        │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ ChatInput  │→ │ React Query  │→ │  DashboardGrid    │    │
│  │            │  │ useMutation  │  │  ChartRenderer    │    │
│  └────────────┘  └──────┬───────┘  │  InsightPanel     │    │
│                         │          └───────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │  POST /api/generate-dashboard
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  FastAPI  ·  Python 3.12  ·  SQLAlchemy  ·  Pandas           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                   PIPELINE                           │    │
│  │                                                      │    │
│  │  User Query                                          │    │
│  │    ↓                                                 │    │
│  │  Schema Loader  →  loads table/column metadata       │    │
│  │    ↓                                                 │    │
│  │  LLM Service    →  Gemini converts NL → SQL          │    │
│  │    ↓                                                 │    │
│  │  SQL Validator   →  blocks injection, verifies cols  │    │
│  │    ↓                                                 │    │
│  │  SQL Executor    →  runs against SQLite              │    │
│  │    ↓                                                 │    │
│  │  Chart Engine    →  Gemini recommends chart types    │    │
│  │    ↓                                                 │    │
│  │  Insight Engine  →  Gemini generates data insights   │    │
│  │    ↓                                                 │    │
│  │  Dashboard JSON  →  returned to frontend             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │
│  │  SQLite DB │  │  Sessions  │  │  CSV Upload/Ingest │     │
│  └────────────┘  └────────────┘  └────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **NL → SQL** | Converts plain English to validated SQL via Gemini |
| **Schema-Aware** | LLM only uses real columns — never hallucinates schema |
| **Smart Charts** | AI picks the best chart type (bar, line, pie, scatter, area, table) |
| **AI Insights** | Auto-generated data-driven bullet points |
| **CSV Upload** | Upload any CSV → auto-creates a queryable table |
| **Follow-Up Queries** | Session memory for conversational context |
| **SQL Injection Protection** | Blocks writes, validates tables/columns, SELECT-only |
| **Rule-Based Fallback** | Chart engine works even if LLM fails |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Recharts, React Query |
| Backend | Python FastAPI, SQLAlchemy, Pandas |
| AI | Google Gemini 1.5 Flash |
| Database | SQLite (production-swappable to PostgreSQL) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
ai-dashboard/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── db.py              # SQLAlchemy engine, raw SQL executor
│   │   │   └── models.py          # Session & history ORM models
│   │   ├── prompts/
│   │   │   ├── sql_generation_prompt.txt
│   │   │   └── chart_selection_prompt.txt
│   │   ├── routes/
│   │   │   └── query_routes.py    # API endpoints (dashboard, upload, schema)
│   │   ├── services/
│   │   │   ├── llm_service.py     # Gemini API integration
│   │   │   ├── sql_service.py     # SQL validation + execution
│   │   │   ├── chart_service.py   # Rule-based chart fallback
│   │   │   └── data_service.py    # CSV ingest with Pandas
│   │   └── utils/
│   │       ├── query_validator.py # SQL safety checks
│   │       └── schema_loader.py   # Schema introspection
│   ├── main.py                    # FastAPI app entrypoint
│   ├── seed_data.py               # Demo dataset generator
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Procfile
│
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Main dashboard page
│   │   └── providers.tsx          # React Query provider
│   ├── components/
│   │   ├── ChatInput.tsx          # Query input bar
│   │   ├── ChartRenderer.tsx      # Renders bar/line/pie/scatter/area/table
│   │   ├── DashboardGrid.tsx      # Responsive chart grid
│   │   ├── FileUpload.tsx         # CSV upload button
│   │   ├── InsightPanel.tsx       # AI insight bullets
│   │   ├── Loader.tsx             # Loading animation
│   │   └── QueryHistory.tsx       # Past query chips
│   ├── hooks/
│   │   └── useDashboardQuery.ts   # React Query mutation hook
│   ├── services/
│   │   └── api.ts                 # Axios API client + types
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── vercel.json
│   └── Dockerfile
│
├── docker-compose.yml
└── render.yaml
```

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Backend

```bash
cd ai-dashboard/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Set your Gemini key
# Edit .env and replace your_gemini_api_key_here with your real key

# Seed demo data
python seed_data.py

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**. Check health at `/health`, docs at `/docs`.

### 2. Frontend

```bash
cd ai-dashboard/frontend

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

### 3. Use It

1. Open **http://localhost:3000**
2. Type a question like: `Show total revenue by region`
3. Get an instant interactive dashboard

---

## API Reference

### POST `/api/generate-dashboard`

Generate a full dashboard from a natural language query.

**Request:**
```json
{
  "query": "Show monthly revenue trend for 2025",
  "session_id": null
}
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "title": "Monthly Revenue Trend For 2025 — Dashboard",
  "query": "Show monthly revenue trend for 2025",
  "generated_sql": "SELECT month, SUM(revenue) AS total_revenue FROM sales WHERE year = 2025 GROUP BY month ORDER BY month",
  "charts": [
    {
      "type": "line",
      "title": "Monthly Revenue Trend",
      "xAxis": "month",
      "yAxis": "total_revenue",
      "data": [...]
    }
  ],
  "insights": [
    "Revenue peaked in July with $234,000.",
    "Q3 accounted for 28% of annual revenue."
  ],
  "row_count": 12
}
```

### POST `/api/upload-csv`

Upload a CSV file to create a queryable table.

**Request:** `multipart/form-data` with a `file` field.

**Response:**
```json
{
  "message": "Successfully uploaded 'employees.csv'",
  "table_name": "employees",
  "columns": ["name", "department", "salary"],
  "row_count": 150
}
```

### GET `/api/schema`

Returns all tables and columns in the database.

### GET `/api/session/{session_id}/history`

Returns conversation history for follow-up context.

---

## Example Queries

These work with the built-in demo `sales` dataset:

| Query | What it does |
|---|---|
| `Show total revenue by region` | Bar chart of revenue per region |
| `Monthly revenue trend for 2025` | Line chart over months |
| `Top 5 products by profit` | Ranked bar chart |
| `Show quarterly sales for East region` | Filtered time series |
| `Compare revenue vs cost by product category` | Grouped comparison |
| `What is the average units sold per product?` | Aggregation with bar chart |
| `Show revenue share by region as percentages` | Pie chart |
| `Which month had the highest revenue in 2024?` | Top-1 with insight |

**Follow-up example:**
1. `Show revenue by region`
2. `Now filter only East region` ← uses session context

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import in [vercel.com](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set environment variables:
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL
4. Build command: `pip install -r requirements.txt && python seed_data.py`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker Compose (self-hosted)

```bash
cd ai-dashboard
export GEMINI_API_KEY=your_key_here
docker-compose up --build
```

Frontend: `http://localhost:3000` | Backend: `http://localhost:8000`

---

## Security

- **SELECT-only**: All generated SQL is parsed and only SELECT statements pass validation
- **Table/column verification**: Referenced tables must exist in the actual schema
- **Forbidden keyword blocking**: DROP, DELETE, INSERT, UPDATE, ALTER, etc. are rejected
- **No data hallucination**: LLM errors return structured error messages, never fake data
- **File size limits**: CSV uploads capped at 50 MB
- **CORS restricted**: Backend only accepts requests from the configured frontend origin

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | *required* |
| `DATABASE_URL` | SQLAlchemy DB connection string | `sqlite:///./dashboard.db` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |

### Frontend (`.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api` |

---

## License

MIT
