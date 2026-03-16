"""
Schema loading utilities.
"""
from app.database.db import get_full_schema, get_all_table_names, get_table_schema


def load_schema() -> list[dict]:
    """Load the full database schema for LLM context."""
    return get_full_schema()


def get_allowed_tables() -> list[str]:
    return get_all_table_names()


def get_allowed_columns() -> dict[str, list[str]]:
    """Return {table_name: [column_names]} for validation."""
    result = {}
    for table_name in get_all_table_names():
        schema = get_table_schema(table_name)
        result[table_name] = [col["name"] for col in schema["columns"]]
    return result
