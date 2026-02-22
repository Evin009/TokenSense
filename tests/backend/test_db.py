"""Tests for utils/db.py — SQLite telemetry helpers."""

import pytest
from utils import db


# ── init_db ───────────────────────────────────────────────────────────────────

async def test_init_db_creates_table(temp_db):
    """init_db should create the telemetry table without errors."""
    import aiosqlite
    async with aiosqlite.connect(temp_db) as conn:
        cursor = await conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='telemetry'"
        )
        row = await cursor.fetchone()
    assert row is not None, "telemetry table was not created"


async def test_init_db_is_idempotent(temp_db):
    """Calling init_db twice must not raise (CREATE TABLE IF NOT EXISTS)."""
    await db.init_db()  # second call
    # If no exception is raised the test passes


# ── log_query ─────────────────────────────────────────────────────────────────

async def test_log_query_returns_row_id(temp_db):
    record = {
        "query_snippet": "explain auth flow",
        "model_used": "anthropic/claude-3-haiku",
        "input_tokens": 1200,
        "output_tokens": 300,
        "optimized_tokens": 900,
        "cost_usd": 0.000675,
        "latency_ms": 185,
    }
    row_id = await db.log_query(record)
    assert isinstance(row_id, int)
    assert row_id >= 1


async def test_log_query_stores_correct_values(temp_db):
    record = {
        "query_snippet": "what is the routing agent?",
        "model_used": "openai/gpt-4o-mini",
        "input_tokens": 500,
        "output_tokens": 150,
        "optimized_tokens": 400,
        "cost_usd": 0.000165,
        "latency_ms": 210,
    }
    row_id = await db.log_query(record)

    rows = await db.get_stats(limit=10)
    matching = [r for r in rows if r["id"] == row_id]
    assert len(matching) == 1
    row = matching[0]
    assert row["model_used"] == "openai/gpt-4o-mini"
    assert row["input_tokens"] == 500
    assert row["latency_ms"] == 210


async def test_log_query_truncates_long_snippet(temp_db):
    """query_snippet longer than 120 chars must be truncated in the DB."""
    long_query = "x" * 200
    row_id = await db.log_query({"query_snippet": long_query, "model_used": "m",
                                  "input_tokens": 0, "output_tokens": 0,
                                  "optimized_tokens": 0, "cost_usd": 0.0,
                                  "latency_ms": 0})
    rows = await db.get_stats(limit=10)
    stored = next(r for r in rows if r["id"] == row_id)
    assert len(stored["query_snippet"]) <= 120


# ── get_stats ─────────────────────────────────────────────────────────────────

async def test_get_stats_empty_db(temp_db):
    rows = await db.get_stats()
    assert rows == []


async def test_get_stats_respects_limit(temp_db):
    for i in range(5):
        await db.log_query({"query_snippet": f"q{i}", "model_used": "m",
                             "input_tokens": i, "output_tokens": i,
                             "optimized_tokens": i, "cost_usd": 0.0,
                             "latency_ms": i})
    rows = await db.get_stats(limit=3)
    assert len(rows) == 3


async def test_get_stats_returns_newest_first(temp_db):
    for i in range(3):
        await db.log_query({"query_snippet": f"q{i}", "model_used": "m",
                             "input_tokens": i, "output_tokens": i,
                             "optimized_tokens": i, "cost_usd": 0.0,
                             "latency_ms": i})
    rows = await db.get_stats(limit=10)
    ids = [r["id"] for r in rows]
    assert ids == sorted(ids, reverse=True)


# ── get_summary ───────────────────────────────────────────────────────────────

async def test_get_summary_empty_db_returns_zeros(temp_db):
    summary = await db.get_summary()
    assert summary["total_queries"] == 0
    assert summary["avg_token_reduction_pct"] == 0.0
    assert summary["total_cost_usd"] == 0.0
    assert summary["avg_latency_ms"] == 0


async def test_get_summary_counts_correctly(temp_db):
    records = [
        {"query_snippet": "q1", "model_used": "m", "input_tokens": 1000,
         "output_tokens": 100, "optimized_tokens": 700, "cost_usd": 0.001, "latency_ms": 100},
        {"query_snippet": "q2", "model_used": "m", "input_tokens": 2000,
         "output_tokens": 200, "optimized_tokens": 1000, "cost_usd": 0.002, "latency_ms": 200},
    ]
    for r in records:
        await db.log_query(r)

    summary = await db.get_summary()
    assert summary["total_queries"] == 2
    assert abs(summary["total_cost_usd"] - 0.003) < 1e-6
    assert summary["avg_latency_ms"] == 150
    # reduction for q1: (1000-700)/1000 = 30%, q2: (2000-1000)/2000 = 50% → avg 40%
    assert abs(summary["avg_token_reduction_pct"] - 40.0) < 0.1
