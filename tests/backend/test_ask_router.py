"""Tests for routers/ask_router.py — POST /ask endpoint."""

import pytest


# ── Helpers ───────────────────────────────────────────────────────────────────

def _headers(key: str) -> dict:
    return {"x-api-key": key}


def _mock_agents(mocker):
    """Patch all five agents so no external I/O happens."""
    mocker.patch("agents.query_agent.process", return_value={
        "embedding": [0.1] * 1536,
        "task_type": "general",
        "token_estimate": 40,
    })
    mocker.patch("agents.retrieval_agent.fetch", return_value=[
        {"content": "TokenSense reduces token usage.", "score": 0.92, "source": "readme.md"},
    ])
    mocker.patch("agents.context_optimizer.optimize", return_value={
        "optimized_context": "TokenSense reduces token usage.",
        "original_tokens": 500,
        "optimized_tokens": 140,
    })
    mocker.patch("agents.routing_agent.route", return_value={
        "answer": "TokenSense orchestrates LLM calls efficiently.",
        "model": "anthropic/claude-3-haiku",
        "provider": "openrouter",
        "reason": "General/small context → Claude Haiku",
        "input_tokens": 180,
        "output_tokens": 60,
    })
    mocker.patch("agents.telemetry_agent.record", return_value={
        "cost_usd": 0.0000825,
        "record_id": 1,
    })


# ── Happy path ────────────────────────────────────────────────────────────────

async def test_ask_success(client, api_key, mocker):
    _mock_agents(mocker)
    response = await client.post(
        "/ask",
        json={"query": "what is tokensense?"},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "TokenSense orchestrates LLM calls efficiently."
    assert data["model"] == "anthropic/claude-3-haiku"
    assert data["input_tokens"] == 180
    assert data["output_tokens"] == 60
    assert data["optimized_tokens"] == 140
    assert data["cost_usd"] > 0
    assert data["latency_ms"] >= 0
    assert 0 <= data["context_reduction_pct"] <= 100


async def test_ask_context_reduction_calculated_correctly(client, api_key, mocker):
    mocker.patch("agents.query_agent.process", return_value={
        "embedding": [0.0] * 1536, "task_type": "general", "token_estimate": 10,
    })
    mocker.patch("agents.retrieval_agent.fetch", return_value=[])
    mocker.patch("agents.context_optimizer.optimize", return_value={
        "optimized_context": "ctx",
        "original_tokens": 1000,
        "optimized_tokens": 250,  # 75% reduction
    })
    mocker.patch("agents.routing_agent.route", return_value={
        "answer": "ok", "model": "anthropic/claude-3-haiku",
        "provider": "openrouter", "reason": "x",
        "input_tokens": 260, "output_tokens": 20,
    })
    mocker.patch("agents.telemetry_agent.record", return_value={"cost_usd": 0.0, "record_id": 1})

    response = await client.post("/ask", json={"query": "test"}, headers=_headers(api_key))
    assert response.status_code == 200
    assert response.json()["context_reduction_pct"] == 75.0


async def test_ask_custom_token_budget_is_forwarded(client, api_key, mocker):
    _mock_agents(mocker)
    opt_mock = mocker.patch("agents.context_optimizer.optimize", return_value={
        "optimized_context": "", "original_tokens": 0, "optimized_tokens": 0
    })
    mocker.patch("agents.routing_agent.route", return_value={
        "answer": "ok", "model": "anthropic/claude-3-haiku",
        "provider": "openrouter", "reason": "x",
        "input_tokens": 10, "output_tokens": 5,
    })
    mocker.patch("agents.telemetry_agent.record", return_value={"cost_usd": 0.0, "record_id": 1})

    await client.post(
        "/ask",
        json={"query": "test", "token_budget": 4000},
        headers=_headers(api_key),
    )
    call_kwargs = opt_mock.call_args
    assert call_kwargs.kwargs.get("token_budget") == 4000 or \
           (call_kwargs.args and 4000 in call_kwargs.args)


# ── Auth failures ─────────────────────────────────────────────────────────────

async def test_ask_missing_api_key_returns_422(client):
    response = await client.post("/ask", json={"query": "test"})
    assert response.status_code == 422


async def test_ask_invalid_api_key_returns_401(client):
    response = await client.post(
        "/ask",
        json={"query": "test"},
        headers=_headers("wrong-key"),
    )
    assert response.status_code == 401


# ── Validation ────────────────────────────────────────────────────────────────

async def test_ask_missing_query_field_returns_422(client, api_key):
    response = await client.post("/ask", json={}, headers=_headers(api_key))
    assert response.status_code == 422


async def test_ask_empty_query_is_accepted(client, api_key, mocker):
    """Empty string query is valid per schema — agents handle it downstream."""
    _mock_agents(mocker)
    response = await client.post("/ask", json={"query": ""}, headers=_headers(api_key))
    assert response.status_code == 200
