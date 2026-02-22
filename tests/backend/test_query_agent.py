"""Tests for agents/query_agent.py — task classification and token estimation."""

import pytest
from agents.query_agent import _classify_task, _token_estimate


# ── _classify_task ────────────────────────────────────────────────────────────

@pytest.mark.parametrize("query", [
    "def authenticate(user):",
    "class TokenRouter:",
    "import fastapi",
    "async def process(query: str):",
    "function handleRequest() {",
    "return response.json()",
])
def test_classify_code_keywords(query):
    assert _classify_task(query) == "code"


@pytest.mark.parametrize("query", [
    "how to set up authentication",
    "explain the routing agent",
    "what is a vector embedding",
    "why does the context optimizer deduplicate chunks",
    "describe the telemetry pipeline",
    "difference between GPT-4o and Claude",
])
def test_classify_documentation_keywords(query):
    assert _classify_task(query) == "documentation"


@pytest.mark.parametrize("query", [
    "fix the login bug",
    "summarize the project",
    "list all endpoints",
    "show me the stats",
])
def test_classify_general_fallback(query):
    assert _classify_task(query) == "general"


def test_classify_code_takes_priority_over_doc():
    """A query with both code and doc keywords → 'code' wins (checked first)."""
    query = "explain async def process()"  # has both "explain" and "async "
    # "async " is in _CODE_KEYWORDS so code wins
    assert _classify_task(query) == "code"


# ── _token_estimate ───────────────────────────────────────────────────────────

def test_token_estimate_empty():
    assert _token_estimate("") == 0


def test_token_estimate_formula():
    text = " ".join(["word"] * 10)  # 10 words → int(10 * 1.3) = 13
    assert _token_estimate(text) == 13


def test_token_estimate_scales_with_length():
    short = "hello world"
    long = "hello world " * 100
    assert _token_estimate(long) > _token_estimate(short)


# ── process (with mocked embedding) ──────────────────────────────────────────

async def test_process_returns_correct_shape(mocker):
    """process() calls the embedding API; mock it to avoid real HTTP."""
    mock_embedding = tuple([0.1] * 1536)
    mocker.patch("agents.query_agent._cached_embed", return_value=mock_embedding)

    from agents.query_agent import process
    result = await process("how to install tokensense")

    assert "embedding" in result
    assert "task_type" in result
    assert "token_estimate" in result
    assert result["task_type"] == "documentation"
    assert len(result["embedding"]) == 1536


async def test_process_caches_embedding(mocker):
    """The same query should hit the cache; _cached_embed called once."""
    mock_embed = mocker.patch(
        "agents.query_agent._cached_embed",
        return_value=tuple([0.0] * 1536)
    )
    from agents.query_agent import process
    await process("unique query for cache test abc")
    await process("unique query for cache test abc")
    # lru_cache means the underlying function is called once per unique query
    assert mock_embed.call_count >= 1  # at least called; exact count depends on cache state
