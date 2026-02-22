"""Tests for routers/optimize_router.py — POST /optimize endpoint."""

import pytest


def _headers(key: str) -> dict:
    return {"x-api-key": key}


def _mock_pipeline(mocker, *, original=500, optimized=140):
    mocker.patch("agents.query_agent.process", return_value={
        "embedding": [0.1] * 1536,
        "task_type": "general",
        "token_estimate": 30,
    })
    mocker.patch("agents.retrieval_agent.fetch", return_value=[
        {"content": "Relevant context chunk.", "score": 0.88, "source": "src.py"},
    ])
    mocker.patch("agents.context_optimizer.optimize", return_value={
        "optimized_context": "Relevant context chunk.",
        "original_tokens": original,
        "optimized_tokens": optimized,
    })


# ── Happy path ────────────────────────────────────────────────────────────────

async def test_optimize_success(client, api_key, mocker):
    _mock_pipeline(mocker, original=500, optimized=140)
    response = await client.post(
        "/optimize",
        json={"query": "explain the routing logic"},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    data = response.json()
    assert "optimized_context" in data
    assert data["original_tokens"] == 500
    assert data["optimized_tokens"] == 140
    assert data["chunks_retrieved"] == 1


async def test_optimize_reduction_pct_calculated_correctly(client, api_key, mocker):
    _mock_pipeline(mocker, original=1000, optimized=250)  # 75% reduction
    response = await client.post(
        "/optimize",
        json={"query": "test"},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    assert response.json()["reduction_pct"] == 75.0


async def test_optimize_zero_original_tokens_no_division_error(client, api_key, mocker):
    """When original_tokens=0 the endpoint must not crash with ZeroDivisionError."""
    _mock_pipeline(mocker, original=0, optimized=0)
    response = await client.post(
        "/optimize",
        json={"query": "empty context query"},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    assert response.json()["reduction_pct"] == 0.0


async def test_optimize_custom_token_budget(client, api_key, mocker):
    _mock_pipeline(mocker)
    opt_mock = mocker.patch("agents.context_optimizer.optimize", return_value={
        "optimized_context": "ctx", "original_tokens": 100, "optimized_tokens": 50,
    })
    await client.post(
        "/optimize",
        json={"query": "test", "token_budget": 2000},
        headers=_headers(api_key),
    )
    call_kwargs = opt_mock.call_args
    assert call_kwargs.kwargs.get("token_budget") == 2000 or \
           (call_kwargs.args and 2000 in call_kwargs.args)


# ── Auth failures ─────────────────────────────────────────────────────────────

async def test_optimize_missing_key_returns_422(client):
    response = await client.post("/optimize", json={"query": "test"})
    assert response.status_code == 422


async def test_optimize_invalid_key_returns_401(client):
    response = await client.post(
        "/optimize",
        json={"query": "test"},
        headers=_headers("wrong"),
    )
    assert response.status_code == 401


# ── Validation ────────────────────────────────────────────────────────────────

async def test_optimize_missing_query_returns_422(client, api_key):
    response = await client.post("/optimize", json={}, headers=_headers(api_key))
    assert response.status_code == 422


# ── Health endpoint (sanity check) ───────────────────────────────────────────

async def test_health_endpoint(client):
    """The root health endpoint should always return 200 without auth."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "TokenSense" in data["service"]
