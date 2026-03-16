"""
AI-Powered Business Intelligence Dashboard - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes.query_routes import router as query_router
from app.database.db import engine, Base

load_dotenv()

app = FastAPI(
    title="AI Dashboard API",
    description="Conversational AI Business Intelligence Dashboard",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


app.include_router(query_router, prefix="/api")
