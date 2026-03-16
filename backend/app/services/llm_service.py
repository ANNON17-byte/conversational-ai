"""
Google Gemini LLM integration service.
"""
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

_model = genai.GenerativeModel("gemini-1.5-flash")

PROMPT_DIR = os.path.join(os.path.dirname(__file__), "..", "prompts")


def _load_prompt(filename: str) -> str:
    path = os.path.join(PROMPT_DIR, filename)
    with open(path, "r") as f:
        return f.read()


def generate_sql(
    question: str,
    schema: list[dict],
    history: list[dict] | None = None,
) -> str:
    """Use Gemini to convert a natural language question to SQL."""
    schema_text = _format_schema(schema)
    history_text = _format_history(history) if history else "No previous context."

    prompt_template = _load_prompt("sql_generation_prompt.txt")
    prompt = prompt_template.format(
        schema=schema_text,
        history=history_text,
        question=question,
    )

    response = _model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences if the model includes them
    raw = re.sub(r"^```(?:sql)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    return raw.strip()


def recommend_charts(
    sql: str,
    columns: list[str],
    sample_data: list[dict],
) -> list[dict]:
    """Use Gemini to recommend chart types for given query results."""
    prompt_template = _load_prompt("chart_selection_prompt.txt")
    prompt = prompt_template.format(
        sql=sql,
        columns=json.dumps(columns),
        sample_data=json.dumps(sample_data[:5], default=str),
    )

    response = _model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown code fences
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        charts = json.loads(raw)
        return charts if isinstance(charts, list) else [charts]
    except json.JSONDecodeError:
        return [{"type": "table", "title": "Query Results"}]


def generate_insights(
    question: str,
    data: list[dict],
    charts: list[dict],
) -> list[str]:
    """Generate brief data-driven insights from the query results."""
    prompt = f"""You are a business analyst. Given the user's question and the query results,
provide 2-4 brief, data-driven insights. Each insight should be one sentence.
Only state facts supported by the data — never speculate.

USER QUESTION: {question}

DATA (first 20 rows):
{json.dumps(data[:20], default=str)}

CHARTS GENERATED:
{json.dumps(charts, default=str)}

Return a JSON array of insight strings. Example:
["West region contributed 42% of total revenue.", "Sales peaked in July with $1.2M."]

Return ONLY valid JSON — no explanation, no markdown fences."""

    response = _model.generate_content(prompt)
    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        insights = json.loads(raw)
        return insights if isinstance(insights, list) else [str(insights)]
    except json.JSONDecodeError:
        return ["Dashboard generated successfully."]


def _format_schema(schema: list[dict]) -> str:
    lines = []
    for table in schema:
        cols = ", ".join(
            f'{c["name"]} ({c["type"]})'
            for c in table["columns"]
        )
        lines.append(f'Table: {table["table"]}\n  Columns: {cols}')
    return "\n\n".join(lines)


def _format_history(history: list[dict]) -> str:
    if not history:
        return "No previous context."
    lines = []
    for entry in history[-5:]:  # Last 5 exchanges for context window
        lines.append(f'Q: {entry["user_query"]}\nSQL: {entry["generated_sql"]}')
    return "\n\n".join(lines)
