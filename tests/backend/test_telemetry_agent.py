"""Tests for agents/telemetry_agent.py — cost calculation and DB persistence."""

import pytest
from agents.telemetry_agent import _calculate_cost


# ── _calculate_cost ───────────────────────────────────────────────────────────

class TestCalculateCost:
    def test_claude_haiku_pricing(self):
        # input: 1000 tokens at $0.00025/1k = $0.00025
        # output: 1000 tokens at $0.00125/1k = $0.00125
        cost = _calculate_cost("anthropic/claude-3-haiku", 1000, 1000)
        assert abs(cost - 0.00150) < 1e-9

    def test_gpt4o_mini_pricing(self):
        # input: 1000 at $0.00015 = $0.00015
        # output: 1000 at $0.00060 = $0.00060 → total $0.00075
        cost = _calculate_cost("openai/gpt-4o-mini", 1000, 1000)
        assert abs(cost - 0.00075) < 1e-9

    def test_gemini_pro_pricing(self):
        # input: 1000 at $0.00050 = $0.00050
        # output: 1000 at $0.00150 = $0.00150 → total $0.00200
        cost = _calculate_cost("google/gemini-pro", 1000, 1000)
        assert abs(cost - 0.00200) < 1e-9

    def test_unknown_model_uses_default_pricing(self):
        """Unknown models fall back to the default pricing table."""
        cost_unknown = _calculate_cost("unknown/new-model", 1000, 1000)
        cost_default = _calculate_cost("google/gemini-pro", 1000, 1000)
        # Default is the same as gemini-pro pricing
        assert abs(cost_unknown - cost_default) < 1e-9

    def test_zero_tokens_returns_zero_cost(self):
        assert _calculate_cost("anthropic/claude-3-haiku", 0, 0) == 0.0

    def test_cost_scales_linearly_with_tokens(self):
        cost_1k = _calculate_cost("openai/gpt-4o-mini", 1000, 0)
        cost_2k = _calculate_cost("openai/gpt-4o-mini", 2000, 0)
        assert abs(cost_2k - 2 * cost_1k) < 1e-12


# ── record (full pipeline with DB) ───────────────────────────────────────────

async def test_record_returns_cost_and_id(temp_db):
    from agents.telemetry_agent import record
    result = await record(
        query="explain the auth system",
        model="anthropic/claude-3-haiku",
        input_tokens=800,
        output_tokens=200,
        optimized_tokens=600,
        latency_ms=145,
    )
    assert "cost_usd" in result
    assert "record_id" in result
    assert result["cost_usd"] > 0
    assert isinstance(result["record_id"], int)


async def test_record_persists_to_db(temp_db):
    from agents.telemetry_agent import record
    from utils import db

    await record(
        query="test query for persistence check",
        model="openai/gpt-4o-mini",
        input_tokens=500,
        output_tokens=100,
        optimized_tokens=400,
        latency_ms=200,
    )

    rows = await db.get_stats(limit=10)
    assert len(rows) == 1
    assert rows[0]["model_used"] == "openai/gpt-4o-mini"
    assert rows[0]["input_tokens"] == 500
