import os
import logging
import asyncio
from dotenv import load_dotenv
from cortex import AsyncCortexClient, DistanceMetric

load_dotenv()
logger = logging.getLogger(__name__)

_HOST = os.getenv("ACTIAN_HOST", "localhost")
_PORT = int(os.getenv("ACTIAN_PORT", "50051"))
_COLLECTION = "tokensense_chunks"
_DIMENSION = 1536  # openai/text-embedding-ada-002 output dimension

# Lock to prevent concurrent collection creation
_collection_lock = asyncio.Lock()
_collection_ensured = False


def _client() -> AsyncCortexClient:
    return AsyncCortexClient(f"{_HOST}:{_PORT}")


def _content_id(content: str) -> int:
    """Deterministic integer ID derived from content hash."""
    return abs(hash(content)) % (2**62)


async def _ensure_collection(client: AsyncCortexClient) -> None:
    """Thread-safe collection creation with caching."""
    global _collection_ensured
    
    if _collection_ensured:
        return
    
    async with _collection_lock:
        if _collection_ensured:
            return
        
        try:
            exists = await client.has_collection(_COLLECTION)
            if not exists:
                logger.info(f"Creating Actian collection: {_COLLECTION}")
                await client.create_collection(
                    name=_COLLECTION,
                    dimension=_DIMENSION,
                    distance_metric=DistanceMetric.COSINE,
                )
                logger.info(f"Collection {_COLLECTION} created successfully")
            _collection_ensured = True
        except Exception as exc:
            logger.error(f"Failed to ensure collection: {exc}", exc_info=True)
            raise


async def store_chunk(content: str, embedding: list[float], source: str) -> None:
    """Upsert an embedded chunk into the Actian VectorAI DB collection."""
    try:
        async with _client() as client:
            await _ensure_collection(client)
            await client.upsert(
                _COLLECTION,
                id=_content_id(content),
                vector=embedding,
                payload={"content": content, "source": source},
            )
    except Exception as exc:
        logger.error(f"store_chunk failed: {exc}", exc_info=True)
        raise


async def batch_store(chunks: list[dict]) -> None:
    """
    Upsert multiple chunks in a single batch call.
    Each chunk must have: content, embedding, source.
    """
    if not chunks:
        logger.warning("batch_store called with empty chunks list")
        return
    
    try:
        async with _client() as client:
            await _ensure_collection(client)
            
            ids = [_content_id(c["content"]) for c in chunks]
            vectors = [c["embedding"] for c in chunks]
            payloads = [{"content": c["content"], "source": c["source"]} for c in chunks]
            
            logger.info(f"Storing {len(chunks)} chunks to Actian collection {_COLLECTION}")
            await client.batch_upsert(
                _COLLECTION,
                ids=ids,
                vectors=vectors,
                payloads=payloads,
            )
            logger.info(f"Successfully stored {len(chunks)} chunks")
    except Exception as exc:
        logger.error(f"batch_store failed: {exc}", exc_info=True)
        raise


async def fetch(embedding: list[float], top_k: int = 5) -> list[dict]:
    """
    Return the top-k most semantically relevant chunks for the given embedding.

    Returns:
        list of { "content": str, "score": float, "source": str }
    """
    try:
        async with _client() as client:
            await _ensure_collection(client)
            
            # IMPORTANT: with_payload=True is required to get payload data back
            results = await client.search(_COLLECTION, query=embedding, top_k=top_k, with_payload=True)
            
            logger.info(f"Actian search returned {len(results)} results for top_k={top_k}")
            
            # Filter out results with None payload and safely extract data
            chunks = []
            for idx, r in enumerate(results):
                # Check if payload exists and has the required structure
                if not hasattr(r, 'payload') or r.payload is None:
                    logger.warning(f"Result {idx}: No payload attribute or payload is None (score={r.score})")
                    continue
                
                # Handle both dict-like and object-like payload access
                try:
                    if isinstance(r.payload, dict):
                        content = r.payload.get("content", "")
                        source = r.payload.get("source", "unknown")
                    else:
                        # Payload might be an object with attributes
                        content = getattr(r.payload, "content", "")
                        source = getattr(r.payload, "source", "unknown")
                except Exception as e:
                    logger.warning(f"Result {idx}: Error accessing payload: {e}")
                    continue
                
                if not content:
                    logger.warning(f"Result {idx}: Empty content")
                    continue
                
                logger.debug(f"Result {idx}: Valid chunk, score={r.score}, content_len={len(content)}, source={source}")
                
                chunks.append({
                    "content": content,
                    "score": r.score,
                    "source": source,
                })
            
            if not chunks:
                logger.warning(f"No valid chunks retrieved from Actian (searched {len(results)} results, all had None/empty payloads)")
            else:
                logger.info(f"Successfully retrieved {len(chunks)} valid chunks from Actian")
            
            return chunks
    except Exception as exc:
        logger.error("Actian retrieval failed: %s", exc, exc_info=True)
        return []
