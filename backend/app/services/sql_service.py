"""
SQL execution service — runs validated SQL and returns structured results.
"""
from app.database.db import execute_raw_sql
from app.utils.query_validator import validate_sql, SQLValidationError
from app.utils.schema_loader import get_allowed_tables, get_allowed_columns


def run_query(sql: str) -> list[dict]:
    """
    Validate and execute a SQL query.
    Returns list of row dicts.
    Raises SQLValidationError on invalid queries.
    """
    allowed_tables = get_allowed_tables()
    allowed_columns = get_allowed_columns()

    validated_sql = validate_sql(sql, allowed_tables, allowed_columns)
    return execute_raw_sql(validated_sql)
