"""
SQL query validation and safety checks.
"""
import re
import sqlparse


# Disallowed SQL keywords for safety
_FORBIDDEN_KEYWORDS = [
    "DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE",
    "EXEC", "EXECUTE", "GRANT", "REVOKE", "MERGE", "REPLACE",
    "--", ";--", "/*",
]


class SQLValidationError(Exception):
    pass


def validate_sql(sql: str, allowed_tables: list[str], allowed_columns: dict[str, list[str]]) -> str:
    """
    Validate generated SQL for safety and schema compliance.
    Returns cleaned SQL or raises SQLValidationError.
    """
    if not sql or not sql.strip():
        raise SQLValidationError("Empty SQL query generated.")

    # Check if the LLM returned an error
    if sql.strip().upper().startswith("ERROR:"):
        raise SQLValidationError(sql.strip())

    cleaned = sql.strip().rstrip(";")

    # Only allow SELECT statements
    parsed = sqlparse.parse(cleaned)
    if not parsed:
        raise SQLValidationError("Could not parse SQL query.")

    stmt = parsed[0]
    if stmt.get_type() != "SELECT":
        raise SQLValidationError("Only SELECT queries are permitted.")

    # Check for forbidden keywords (write operations, comments)
    upper_sql = cleaned.upper()
    for keyword in _FORBIDDEN_KEYWORDS:
        # Match keyword as a whole word (not part of column name)
        pattern = rf"\b{re.escape(keyword)}\b"
        if re.search(pattern, upper_sql):
            raise SQLValidationError(f"Forbidden SQL keyword detected: {keyword}")

    # Verify referenced tables exist
    _check_tables(cleaned, allowed_tables)

    return cleaned


def _check_tables(sql: str, allowed_tables: list[str]) -> None:
    """Ensure only allowed tables are referenced."""
    upper_sql = sql.upper()
    # Extract table references after FROM and JOIN
    table_refs = re.findall(
        r'\b(?:FROM|JOIN)\s+(\w+)', upper_sql, re.IGNORECASE
    )
    allowed_upper = {t.upper() for t in allowed_tables}
    for ref in table_refs:
        if ref.upper() not in allowed_upper:
            raise SQLValidationError(
                f"Table '{ref}' does not exist in the database. "
                f"Available tables: {', '.join(allowed_tables)}"
            )


def extract_columns_from_results(data: list[dict]) -> list[str]:
    """Extract column names from query result rows."""
    if not data:
        return []
    return list(data[0].keys())
