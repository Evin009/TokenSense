from datetime import datetime, timezone
from utils import db

_PRICE_PER_1K: dict[str, dict[str, float]] = {
    "anthropic/claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    "openai/gpt-4o-mini":       {"input": 0.00015, "output": 0.00060},
    "google/gemini-pro":        {"input": 0.00050, "output": 0.00150},
}
_DEFAULT_PRICE = {"input": 0.00050, "output": 0.00150}


def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    price = _PRICE_PER_1K.get(model, _DEFAULT_PRICE)
    return (input_tokens / 1000 * price["input"]) + (output_tokens / 1000 * price["output"])


async def record(
    query: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    optimized_tokens: int,
    latency_ms: int,
) -> dict:
    """
    Calculate cost and persist telemetry to SQLite.

    Returns:
        { "cost_usd": float, "record_id": int }
    """
    cost = _calculate_cost(model, input_tokens, output_tokens)

    row = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "query_snippet": query[:120],
        "model_used": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "optimized_tokens": optimized_tokens,
        "cost_usd": cost,
        "latency_ms": latency_ms,
    }

    record_id = await db.log_query(row)
    return {"cost_usd": round(cost, 8), "record_id": record_id}
