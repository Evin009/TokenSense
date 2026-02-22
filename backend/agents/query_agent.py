import os
import functools
import httpx
from dotenv import load_dotenv

load_dotenv()

_OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
_EMBED_MODEL = "openai/text-embedding-ada-002"
_OPENROUTER_BASE = "https://openrouter.ai/api/v1"

_CODE_KEYWORDS = {"def ", "class ", "import ", "function ", "return ", "async ", "await "}
_DOC_KEYWORDS = {"how to", "explain", "what is", "why does", "describe", "difference between"}


def _classify_task(query: str) -> str:
    lower = query.lower()
    if any(kw in query for kw in _CODE_KEYWORDS):
        return "code"
    if any(kw in lower for kw in _DOC_KEYWORDS):
        return "documentation"
    return "general"


def _token_estimate(text: str) -> int:
    return int(len(text.split()) * 1.3)


@functools.lru_cache(maxsize=512)
def _cached_embed(query: str) -> tuple[float, ...]:
    """Synchronous embedding fetch, cached by query string."""
    response = httpx.post(
        f"{_OPENROUTER_BASE}/embeddings",
        headers={
            "Authorization": f"Bearer {_OPENROUTER_KEY}",
            "Content-Type": "application/json",
        },
        json={"model": _EMBED_MODEL, "input": query},
        timeout=30.0,
    )
    response.raise_for_status()
    data = response.json()
    if "error" in data:
        raise RuntimeError(f"OpenRouter embedding error: {data['error'].get('message', data['error'])}")
    return tuple(data["data"][0]["embedding"])


async def process(query: str) -> dict:
    """
    Generate embedding and classify task type for a query.

    Returns:
        {
            "embedding": list[float],
            "task_type": "code" | "documentation" | "general",
            "token_estimate": int
        }
    """
    embedding = list(_cached_embed(query))
    return {
        "embedding": embedding,
        "task_type": _classify_task(query),
        "token_estimate": _token_estimate(query),
    }


async def embed(text: str) -> list[float]:
    """Embed a single text chunk (used by the index router)."""
    return list(_cached_embed(text))
