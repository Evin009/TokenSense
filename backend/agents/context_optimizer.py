def _token_count(text: str) -> int:
    return int(len(text.split()) * 1.3)


def _overlap_ratio(a: str, b: str) -> float:
    """Rough overlap check using shorter string containment."""
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    if not shorter:
        return 0.0
    # Count shared words
    words_a = set(shorter.lower().split())
    words_b = set(longer.lower().split())
    if not words_a:
        return 0.0
    return len(words_a & words_b) / len(words_a)


def _deduplicate(chunks: list[dict]) -> list[dict]:
    kept: list[dict] = []
    for chunk in chunks:
        duplicate = any(
            _overlap_ratio(chunk["content"], k["content"]) > 0.8 for k in kept
        )
        if not duplicate:
            kept.append(chunk)
    return kept


async def optimize(
    chunks: list[dict],
    token_budget: int = 8000,
    query: str = "",
) -> dict:
    """
    Deduplicate, re-rank, and truncate retrieved chunks to fit within token_budget.

    Returns:
        {
            "optimized_context": str,
            "original_tokens": int,
            "optimized_tokens": int
        }
    """
    if not chunks:
        return {"optimized_context": "", "original_tokens": 0, "optimized_tokens": 0}

    original_tokens = sum(_token_count(c["content"]) for c in chunks)

    # Step 1 — Deduplication
    unique = _deduplicate(chunks)

    # Step 2 — Re-rank by score (descending)
    unique.sort(key=lambda c: c.get("score", 0.0), reverse=True)

    # Step 3 — Truncate to budget
    parts: list[str] = []
    running_tokens = 0

    for chunk in unique:
        header = f"[Source: {chunk.get('source', 'unknown')}]\n"
        block = header + chunk["content"]
        block_tokens = _token_count(block)
        if running_tokens + block_tokens > token_budget:
            break
        parts.append(block)
        running_tokens += block_tokens

    optimized_context = "\n\n".join(parts)
    optimized_tokens = _token_count(optimized_context)

    return {
        "optimized_context": optimized_context,
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
    }
