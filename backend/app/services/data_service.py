"""
Data service — handles CSV upload, table creation, and schema inference.
"""
import pandas as pd
import re
from sqlalchemy import text
from app.database.db import engine, SessionLocal
from app.database.models import UploadedDataset


def ingest_csv(file_content: bytes, original_filename: str) -> dict:
    """
    Read a CSV file, infer schema, create a SQLite table, and load data.
    Returns metadata about the created table.
    """
    import io

    df = pd.read_csv(io.BytesIO(file_content))

    # Sanitize table name from filename
    table_name = _sanitize_table_name(original_filename)

    # Clean column names
    df.columns = [_sanitize_column_name(c) for c in df.columns]

    # Write to SQLite
    df.to_sql(table_name, engine, if_exists="replace", index=False)

    # Record the upload
    db = SessionLocal()
    try:
        record = UploadedDataset(
            table_name=table_name,
            original_filename=original_filename,
            row_count=len(df),
        )
        # Remove existing record with same table name
        db.execute(
            text("DELETE FROM uploaded_datasets WHERE table_name = :t"),
            {"t": table_name},
        )
        db.add(record)
        db.commit()
    finally:
        db.close()

    return {
        "table_name": table_name,
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "row_count": len(df),
        "sample": df.head(5).to_dict(orient="records"),
    }


def _sanitize_table_name(filename: str) -> str:
    name = filename.rsplit(".", 1)[0]  # strip extension
    name = re.sub(r"[^a-zA-Z0-9_]", "_", name)
    name = re.sub(r"_+", "_", name).strip("_").lower()
    if name[0].isdigit():
        name = "t_" + name
    return name


def _sanitize_column_name(col: str) -> str:
    col = re.sub(r"[^a-zA-Z0-9_]", "_", str(col))
    col = re.sub(r"_+", "_", col).strip("_").lower()
    if col[0].isdigit():
        col = "c_" + col
    return col
