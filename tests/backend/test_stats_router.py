"""Tests for routers/stats_router.py — GET /stats endpoint."""

import pytest


def _headers(key: str) -> dict:
    return {"x-api-key": key}


async def _seed_records(temp_db, n: int = 3):
    from utils import db
    for i in range(n):
        await db.log_query({
            "query_snippet": f"query number {i}",
            "model_used": "anthropic/claude-3-haiku",
            "input_tokens": 1000,
            "output_tokens": 200,
            "optimized_tokens": 600,
            "cost_usd": 0.001 * (i + 1),
            "latency_ms": 100 + i * 10,
        })


# ── Happy path ────────────────────────────────────────────────────────────────

async def test_stats_empty_db_returns_zeros(client, api_key, temp_db):
    response = await client.get("/stats", headers=_headers(api_key))
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_queries"] == 0
    assert data["summary"]["total_cost_usd"] == 0.0
    assert data["recent_queries"] == []


async def test_stats_returns_correct_summary(client, api_key, temp_db):
    await _seed_records(temp_db, n=3)
    response = await client.get("/stats", headers=_headers(api_key))
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["total_queries"] == 3
    assert summary["total_cost_usd"] > 0
    assert summary["avg_latency_ms"] > 0


async def test_stats_recent_queries_length(client, api_key, temp_db):
    await _seed_records(temp_db, n=5)
    response = await client.get("/stats?limit=3", headers=_headers(api_key))
    assert response.status_code == 200
    assert len(response.json()["recent_queries"]) == 3


async def test_stats_recent_queries_schema(client, api_key, temp_db):
    await _seed_records(temp_db, n=1)
    response = await client.get("/stats", headers=_headers(api_key))
    row = response.json()["recent_queries"][0]
    required_fields = {"id", "model_used", "input_tokens", "output_tokens",
                       "optimized_tokens", "cost_usd", "latency_ms", "timestamp"}
    assert required_fields.issubset(set(row.keys()))


# ── Auth failures ─────────────────────────────────────────────────────────────

async def test_stats_missing_key_returns_422(client):
    response = await client.get("/stats")
    assert response.status_code == 422


async def test_stats_invalid_key_returns_401(client):
    response = await client.get("/stats", headers=_headers("bad-key"))
    assert response.status_code == 401


# ── Query parameter validation ────────────────────────────────────────────────

async def test_stats_limit_zero_returns_422(client, api_key):
    response = await client.get("/stats?limit=0", headers=_headers(api_key))
    assert response.status_code == 422


async def test_stats_limit_above_max_returns_422(client, api_key):
    response = await client.get("/stats?limit=9999", headers=_headers(api_key))
    assert response.status_code == 422
