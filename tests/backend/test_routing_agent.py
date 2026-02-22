"""Tests for agents/routing_agent.py — model selection and LLM dispatch."""

import pytest
from agents.routing_agent import _select_model


# ── _select_model ─────────────────────────────────────────────────────────────

class TestSelectModel:
    def test_code_task_always_returns_gemini(self):
        result = _select_model("code", 100)
        assert result["model"] == "google/gemini-pro"
        assert result["provider"] == "gemini"

    def test_large_context_returns_gemini(self):
        # token count > 6000 regardless of task type
        result = _select_model("general", 7000)
        assert result["model"] == "google/gemini-pro"

    def test_documentation_task_returns_gpt4o_mini(self):
        result = _select_model("documentation", 500)
        assert result["model"] == "openai/gpt-4o-mini"
        assert result["provider"] == "openrouter"

    def test_medium_context_returns_gpt4o_mini(self):
        # 3000 < tokens ≤ 6000
        result = _select_model("general", 4000)
        assert result["model"] == "openai/gpt-4o-mini"

    def test_general_small_context_returns_claude_haiku(self):
        result = _select_model("general", 1000)
        assert result["model"] == "anthropic/claude-3-haiku"
        assert result["provider"] == "openrouter"

    def test_exact_boundary_6000_tokens(self):
        # At exactly 6000, code check is False, so doc/medium check applies
        result = _select_model("general", 6001)
        assert result["model"] == "google/gemini-pro"

    def test_result_always_has_reason(self):
        for task, tokens in [("code", 100), ("documentation", 500), ("general", 100)]:
            result = _select_model(task, tokens)
            assert "reason" in result and result["reason"]


# ── route (with mocked HTTP) ──────────────────────────────────────────────────

async def test_route_calls_openrouter_for_haiku(mocker):
    mock_call = mocker.patch(
        "agents.routing_agent._call_openrouter",
        return_value="The authentication uses JWT tokens."
    )
    mocker.patch("agents.routing_agent._call_gemini")

    from agents.routing_agent import route
    result = await route(
        task_type="general",
        token_estimate=50,
        optimized_tokens=500,
        optimized_context="Some context",
        query="explain auth",
    )

    mock_call.assert_called_once()
    assert result["answer"] == "The authentication uses JWT tokens."
    assert result["model"] == "anthropic/claude-3-haiku"
    assert result["input_tokens"] > 0
    assert result["output_tokens"] > 0


async def test_route_calls_gemini_for_code_task(mocker):
    mocker.patch("agents.routing_agent._call_openrouter")
    mock_gemini = mocker.patch(
        "agents.routing_agent._call_gemini",
        return_value="Here is the code explanation."
    )

    from agents.routing_agent import route
    result = await route(
        task_type="code",
        token_estimate=200,
        optimized_tokens=1000,
        optimized_context="def foo(): pass",
        query="explain this function",
    )

    mock_gemini.assert_called_once()
    assert result["provider"] == "gemini"
    assert result["answer"] == "Here is the code explanation."


async def test_route_token_counts_are_positive(mocker):
    mocker.patch("agents.routing_agent._call_openrouter", return_value="Answer here.")
    from agents.routing_agent import route
    result = await route(
        task_type="general",
        token_estimate=30,
        optimized_tokens=200,
        optimized_context="context",
        query="what is tokensense",
    )
    assert result["input_tokens"] > 0
    assert result["output_tokens"] > 0
