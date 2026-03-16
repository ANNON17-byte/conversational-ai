"""
Database connection and session management.
"""
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dashboard.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def execute_raw_sql(sql: str) -> list[dict]:
    """Execute a raw SQL query and return results as list of dicts."""
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        columns = list(result.keys())
        rows = result.fetchall()
        return [dict(zip(columns, row)) for row in rows]


def get_all_table_names() -> list[str]:
    inspector = inspect(engine)
    return inspector.get_table_names()


def get_table_schema(table_name: str) -> dict:
    """Return column names and types for a given table."""
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return {
        "table": table_name,
        "columns": [
            {"name": col["name"], "type": str(col["type"])}
            for col in columns
        ],
    }


def get_full_schema() -> list[dict]:
    """Return schema for every table in the database."""
    return [get_table_schema(t) for t in get_all_table_names()]
