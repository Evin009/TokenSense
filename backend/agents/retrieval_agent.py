import os
import logging
from dotenv import load_dotenv
from cortex import AsyncCortexClient, DistanceMetric

load_dotenv()
logger = logging.getLogger(__name__)

_HOST = os.getenv("ACTIAN_HOST", "localhost")
_PORT = int(os.getenv("ACTIAN_PORT", "50051"))
_COLLECTION = "tokensense_chunks"
_DIMENSION = 1536  # openai/text-embedding-ada-002 output dimension


def _client() -> AsyncCortexClient:
    return AsyncCortexClient(f"{_HOST}:{_PORT}")


def _content_id(content: str) -> int:
    """Deterministic integer ID derived from content hash."""
    return abs(hash(content)) % (2**62)


async def _ensure_collection(client: AsyncCortexClient) -> None:
    exists = await client.has_collection(_COLLECTION)
    if not exists:
        await client.create_collection(
            name=_COLLECTION,
            dimension=_DIMENSION,
            distance_metric=DistanceMetric.COSINE,
        )


async def store_chunk(content: str, embedding: list[float], source: str) -> None:
    """Upsert an embedded chunk into the Actian VectorAI DB collection."""
    async with _client() as client:
        await _ensure_collection(client)
        await client.upsert(
            _COLLECTION,
            id=_content_id(content),
            vector=embedding,
            payload={"content": content, "source": source},
        )


async def batch_store(chunks: list[dict]) -> None:
    """
    Upsert multiple chunks in a single batch call.
    Each chunk must have: content, embedding, source.
    """
    async with _client() as client:
        await _ensure_collection(client)
        await client.batch_upsert(
            _COLLECTION,
            ids=[_content_id(c["content"]) for c in chunks],
            vectors=[c["embedding"] for c in chunks],
            payloads=[{"content": c["content"], "source": c["source"]} for c in chunks],
        )


async def fetch(embedding: list[float], top_k: int = 5) -> list[dict]:
    """
    Return the top-k most semantically relevant chunks for the given embedding.

    Returns:
        list of { "content": str, "score": float, "source": str }
    """
    try:
        async with _client() as client:
            await _ensure_collection(client)
            results = await client.search(_COLLECTION, query=embedding, top_k=top_k)
            return [
                {
                    "content": r.payload.get("content", ""),
                    "score": r.score,
                    "source": r.payload.get("source", "unknown"),
                }
                for r in results
            ]
    except Exception as exc:
        logger.warning("Actian retrieval failed: %s", exc)
        return []
