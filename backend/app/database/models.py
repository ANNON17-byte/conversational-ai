"""
SQLAlchemy models for session tracking and metadata.
"""
from sqlalchemy import Column, String, Text, DateTime, Integer
from datetime import datetime, timezone
from app.database.db import Base


class QuerySession(Base):
    __tablename__ = "query_sessions"

    id = Column(String(36), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), nullable=False, index=True)
    user_query = Column(Text, nullable=False)
    generated_sql = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(255), unique=True, nullable=False)
    original_filename = Column(String(255), nullable=False)
    row_count = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
