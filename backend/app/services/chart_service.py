"""
Chart recommendation engine — rule-based fallback when LLM is unavailable.
"""
import re


def rule_based_chart_recommendation(
    sql: str,
    columns: list[str],
    data: list[dict],
) -> list[dict]:
    """
    Fallback chart recommendation using heuristic rules.
    Used when LLM chart selection fails.
    """
    charts = []
    upper_sql = sql.upper()

    # Detect aggregation
    has_group_by = "GROUP BY" in upper_sql
    has_date_col = any(_is_date_column(c) for c in columns)
    numeric_cols = _detect_numeric_columns(data, columns)
    categorical_cols = [c for c in columns if c not in numeric_cols]

    if has_date_col and numeric_cols:
        date_col = next(c for c in columns if _is_date_column(c))
        for nc in numeric_cols:
            charts.append({
                "type": "line",
                "title": f"{_humanize(nc)} over Time",
                "xAxis": date_col,
                "yAxis": nc,
            })
    elif has_group_by and categorical_cols and numeric_cols:
        cat = categorical_cols[0]
        num = numeric_cols[0]
        charts.append({
            "type": "bar",
            "title": f"{_humanize(num)} by {_humanize(cat)}",
            "xAxis": cat,
            "yAxis": num,
        })
        # Add pie chart if few categories
        unique_cats = len(set(row.get(cat) for row in data if row.get(cat)))
        if unique_cats <= 8:
            charts.append({
                "type": "pie",
                "title": f"{_humanize(num)} Share by {_humanize(cat)}",
                "labelKey": cat,
                "valueKey": num,
            })
    elif len(numeric_cols) >= 2:
        charts.append({
            "type": "scatter",
            "title": f"{_humanize(numeric_cols[0])} vs {_humanize(numeric_cols[1])}",
            "xAxis": numeric_cols[0],
            "yAxis": numeric_cols[1],
        })

    if not charts:
        charts.append({"type": "table", "title": "Query Results"})

    return charts


def _is_date_column(name: str) -> bool:
    return bool(re.search(r"date|month|year|time|day|quarter|week", name, re.I))


def _detect_numeric_columns(data: list[dict], columns: list[str]) -> list[str]:
    if not data:
        return []
    numeric = []
    for col in columns:
        val = data[0].get(col)
        if isinstance(val, (int, float)):
            numeric.append(col)
    return numeric


def _humanize(col_name: str) -> str:
    return col_name.replace("_", " ").title()
