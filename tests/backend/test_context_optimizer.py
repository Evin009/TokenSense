"""Tests for agents/context_optimizer.py — dedup, re-rank, truncate."""

import pytest
from agents.context_optimizer import optimize, _overlap_ratio, _deduplicate, _token_count


# ── _token_count ──────────────────────────────────────────────────────────────

def test_token_count_empty_string():
    assert _token_count("") == 0


def test_token_count_single_word():
    # 1 word * 1.3 → 1 (int truncation)
    assert _token_count("hello") == 1


def test_token_count_ten_words():
    text = " ".join(["word"] * 10)
    assert _token_count(text) == 13


# ── _overlap_ratio ────────────────────────────────────────────────────────────

def test_overlap_ratio_identical_strings():
    assert _overlap_ratio("hello world", "hello world") == 1.0


def test_overlap_ratio_no_overlap():
    ratio = _overlap_ratio("hello world", "foo bar baz")
    assert ratio == 0.0


def test_overlap_ratio_partial_overlap():
    ratio = _overlap_ratio("the quick brown fox", "the quick red dog")
    # shared: "the", "quick" → 2/4 = 0.5
    assert abs(ratio - 0.5) < 0.05


def test_overlap_ratio_empty_string():
    assert _overlap_ratio("", "something") == 0.0
    assert _overlap_ratio("something", "") == 0.0


# ── _deduplicate ──────────────────────────────────────────────────────────────

def test_deduplicate_removes_near_duplicates():
    chunks = [
        {"content": "The routing agent selects the best model for each query."},
        {"content": "The routing agent selects the best model for each query."},  # exact dup
    ]
    result = _deduplicate(chunks)
    assert len(result) == 1


def test_deduplicate_keeps_distinct_chunks():
    chunks = [
        {"content": "TokenSense reduces token costs by compressing context."},
        {"content": "The FastAPI backend handles async agent orchestration."},
    ]
    result = _deduplicate(chunks)
    assert len(result) == 2


def test_deduplicate_preserves_order():
    chunks = [
        {"content": "First unique sentence about agents."},
        {"content": "Second unique sentence about routing."},
        {"content": "Third unique sentence about telemetry."},
    ]
    result = _deduplicate(chunks)
    assert [c["content"] for c in result] == [c["content"] for c in chunks]


# ── optimize (full pipeline) ──────────────────────────────────────────────────

async def test_optimize_empty_input():
    result = await optimize(chunks=[], token_budget=8000)
    assert result["optimized_context"] == ""
    assert result["original_tokens"] == 0
    assert result["optimized_tokens"] == 0


async def test_optimize_single_chunk_within_budget():
    chunks = [{"content": "Hello world this is a test.", "score": 0.9, "source": "test.md"}]
    result = await optimize(chunks=chunks, token_budget=8000)
    assert "Hello world" in result["optimized_context"]
    assert result["optimized_tokens"] > 0


async def test_optimize_deduplicates_chunks():
    text = "The context optimizer removes duplicate chunks from the retrieved results."
    chunks = [
        {"content": text, "score": 0.95, "source": "a.md"},
        {"content": text, "score": 0.90, "source": "b.md"},  # duplicate
    ]
    result = await optimize(chunks=chunks, token_budget=8000)
    # The deduplicated text should appear only once
    assert result["optimized_context"].count(text) == 1


async def test_optimize_respects_token_budget():
    """Chunks exceeding the token budget should be excluded."""
    # Build chunks with known token counts — each is ~650 tokens (500 words * 1.3)
    big_chunk = " ".join(["word"] * 500)
    chunks = [
        {"content": big_chunk, "score": 0.9, "source": "a.md"},
        {"content": big_chunk, "score": 0.8, "source": "b.md"},
        {"content": big_chunk, "score": 0.7, "source": "c.md"},
    ]
    result = await optimize(chunks=chunks, token_budget=700)
    # With budget=700 only the first chunk (~650 tokens) should fit
    assert result["optimized_tokens"] <= 750  # some slack for header overhead


async def test_optimize_reranks_by_score():
    """Higher-scored chunks should appear first in the output."""
    chunks = [
        {"content": "Low relevance chunk about logging.", "score": 0.3, "source": "a.md"},
        {"content": "High relevance chunk about authentication.", "score": 0.95, "source": "b.md"},
    ]
    result = await optimize(chunks=chunks, token_budget=8000)
    ctx = result["optimized_context"]
    # High-relevance content should come before low-relevance
    assert ctx.index("authentication") < ctx.index("logging")


async def test_optimize_includes_source_headers(temp_db):
    chunks = [{"content": "Some content here.", "score": 0.8, "source": "docs/readme.md"}]
    result = await optimize(chunks=chunks, token_budget=8000)
    assert "[Source: docs/readme.md]" in result["optimized_context"]
