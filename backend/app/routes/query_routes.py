"""
API routes — dashboard generation, CSV upload, session management.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import uuid
import logging

from app.services.llm_service import generate_sql, recommend_charts, generate_insights
from app.services.sql_service import run_query
from app.services.chart_service import rule_based_chart_recommendation
from app.services.data_service import ingest_csv
from app.utils.schema_loader import load_schema, get_allowed_tables
from app.utils.query_validator import SQLValidationError, extract_columns_from_results
from app.database.db import SessionLocal, get_full_schema
from app.database.models import QueryHistory, QuerySession

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory session store (swap for Redis in production) ──────────────
_sessions: dict[str, list[dict]] = {}


# ── Request / Response models ───────────────────────────────────────────

class DashboardRequest(BaseModel):
    query: str
    session_id: str | None = None


class ChartConfig(BaseModel):
    type: str
    title: str
    xAxis: str | None = None
    yAxis: str | None = None
    labelKey: str | None = None
    valueKey: str | None = None
    data: list[dict] = []


class DashboardResponse(BaseModel):
    session_id: str
    title: str
    query: str
    generated_sql: str
    charts: list[dict]
    insights: list[str]
    row_count: int


class ErrorResponse(BaseModel):
    error: str
    suggestion: str | None = None


# ── Main endpoint ───────────────────────────────────────────────────────

@router.post("/generate-dashboard", response_model=DashboardResponse)
async def generate_dashboard(req: DashboardRequest):
    """
    Full pipeline:
    NL query → SQL → Execute → Chart Recommendation → Insights → Dashboard JSON
    """
    # 1. Session management
    session_id = req.session_id or str(uuid.uuid4())
    if session_id not in _sessions:
        _sessions[session_id] = []

    # 2. Load schema
    schema = load_schema()
    if not schema:
        raise HTTPException(
            status_code=400,
            detail="No tables found in the database. Please upload a CSV first.",
        )

    # 3. Generate SQL via LLM
    try:
        history = _sessions[session_id]
        sql = generate_sql(req.query, schema, history)
    except Exception as e:
        logger.exception("LLM SQL generation failed")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {e}")

    # 4. Validate and execute SQL
    try:
        data = run_query(sql)
    except SQLValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("SQL execution failed")
        raise HTTPException(
            status_code=400,
            detail=f"Query execution failed: {e}. The AI may have generated invalid SQL.",
        )

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Query returned no results. Try rephrasing your question.",
        )

    # 5. Chart recommendation (LLM with rule-based fallback)
    columns = extract_columns_from_results(data)
    try:
        charts = recommend_charts(sql, columns, data)
    except Exception:
        logger.warning("LLM chart recommendation failed, using rule-based fallback")
        charts = rule_based_chart_recommendation(sql, columns, data)

    # Attach data to each chart config
    for chart in charts:
        chart["data"] = data

    # 6. Generate insights
    try:
        insights = generate_insights(req.query, data, charts)
    except Exception:
        insights = [f"Query returned {len(data)} rows."]

    # 7. Save to session history
    _sessions[session_id].append({
        "user_query": req.query,
        "generated_sql": sql,
    })

    # 8. Persist to DB
    _persist_history(session_id, req.query, sql)

    # 9. Build dashboard title
    title = _generate_title(req.query)

    return DashboardResponse(
        session_id=session_id,
        title=title,
        query=req.query,
        generated_sql=sql,
        charts=charts,
        insights=insights,
        row_count=len(data),
    )


# ── CSV Upload ──────────────────────────────────────────────────────────

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file to create a queryable table."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50 MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 50 MB.")

    try:
        result = ingest_csv(content, file.filename)
    except Exception as e:
        logger.exception("CSV ingestion failed")
        raise HTTPException(status_code=400, detail=f"CSV processing failed: {e}")

    return {
        "message": f"Successfully uploaded '{file.filename}'",
        **result,
    }


# ── Schema endpoint ─────────────────────────────────────────────────────

@router.get("/schema")
async def get_schema():
    """Return the current database schema (all tables and columns)."""
    schema = get_full_schema()
    tables = get_allowed_tables()
    return {"tables": tables, "schema": schema}


# ── Session history ─────────────────────────────────────────────────────

@router.get("/session/{session_id}/history")
async def get_session_history(session_id: str):
    """Return conversation history for a session."""
    history = _sessions.get(session_id, [])
    return {"session_id": session_id, "history": history}


# ── Helpers ─────────────────────────────────────────────────────────────

def _persist_history(session_id: str, query: str, sql: str) -> None:
    db = SessionLocal()
    try:
        record = QueryHistory(
            session_id=session_id,
            user_query=query,
            generated_sql=sql,
        )
        db.add(record)
        db.commit()
    except Exception:
        logger.warning("Failed to persist query history")
    finally:
        db.close()


def _generate_title(query: str) -> str:
    """Create a short dashboard title from the user query."""
    q = query.strip().rstrip(".")
    if len(q) > 60:
        q = q[:57] + "..."
    return q.title() + " — Dashboard"
