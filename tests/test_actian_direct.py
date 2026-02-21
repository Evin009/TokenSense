"""
Direct Actian VectorAI DB test — bypasses the backend entirely.
Tests the cortex client at the lowest level.

Run from the backend/ directory (cortex must be installed):
    cd backend
    python ../tests/test_actian_direct.py

Requirements:
    pip install actiancortex-0.1.0b1-py3-none-any.whl
"""

import asyncio
import sys
import time

# ── colour helpers (no rich dep needed here) ─────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def ok(msg):  print(f"  {GREEN}✓{RESET} {msg}")
def fail(msg): print(f"  {RED}✗{RESET} {msg}"); sys.exit(1)
def info(msg): print(f"  {CYAN}→{RESET} {msg}")
def section(title): print(f"\n{BOLD}{title}{RESET}\n" + "─" * 50)

# ── config ────────────────────────────────────────────────────────────────────
HOST       = "localhost:50051"
COLLECTION = "tokensense_test"   # separate from production collection
DIMENSION  = 1536

# ── test vectors ──────────────────────────────────────────────────────────────
def _vec(hot_index: int) -> list[float]:
    """Unit vector with 1.0 at hot_index — cosine similarity = 1.0 with itself."""
    v = [0.0] * DIMENSION
    v[hot_index] = 1.0
    return v

VEC_A = _vec(0)   # "document A"
VEC_B = _vec(100) # "document B" — orthogonal to A
VEC_C = _vec(200) # "document C" — orthogonal to A and B


async def run_tests():
    try:
        from cortex import AsyncCortexClient, DistanceMetric
    except ImportError:
        fail("cortex package not found. Run: pip install actiancortex-0.1.0b1-py3-none-any.whl")

    async with AsyncCortexClient(HOST) as client:

        # ── 1. Connection ─────────────────────────────────────────────────────
        section("1. Connection")
        info(f"Connecting to {HOST}")
        ok("Connected to Actian VectorAI DB")

        # ── 2. Collection management ──────────────────────────────────────────
        section("2. Collection Management")

        # Clean slate — drop test collection if it exists from a previous run
        exists_before = await client.has_collection(COLLECTION)
        info(f"Collection '{COLLECTION}' exists before test: {exists_before}")

        if exists_before:
            await client.delete_collection(COLLECTION)
            info("Dropped stale test collection")

        # Create
        await client.create_collection(
            name=COLLECTION,
            dimension=DIMENSION,
            distance_metric=DistanceMetric.COSINE,
        )
        ok(f"Created collection '{COLLECTION}' (dim={DIMENSION}, metric=COSINE)")

        exists_after = await client.has_collection(COLLECTION)
        if not exists_after:
            fail("has_collection returned False right after create_collection")
        ok("has_collection returns True")

        # ── 3. Single upsert ──────────────────────────────────────────────────
        section("3. Single Upsert")
        await client.upsert(
            COLLECTION,
            id=1,
            vector=VEC_A,
            payload={"content": "TokenSense reduces token costs", "source": "readme.md"},
        )
        ok("Upsert id=1 succeeded")

        await client.upsert(
            COLLECTION,
            id=2,
            vector=VEC_B,
            payload={"content": "FastAPI backend with async agents", "source": "main.py"},
        )
        ok("Upsert id=2 succeeded")

        # ── 4. Idempotent upsert (same id, different payload) ─────────────────
        section("4. Idempotent Upsert")
        await client.upsert(
            COLLECTION,
            id=1,
            vector=VEC_A,
            payload={"content": "UPDATED: TokenSense reduces token costs", "source": "readme.md"},
        )
        ok("Re-upsert same id=1 with updated payload succeeded")

        # ── 5. Batch upsert ───────────────────────────────────────────────────
        section("5. Batch Upsert")
        t0 = time.monotonic()
        await client.batch_upsert(
            COLLECTION,
            ids=[10, 11, 12],
            vectors=[_vec(300), _vec(400), _vec(500)],
            payloads=[
                {"content": "Context optimizer deduplicates chunks", "source": "context_optimizer.py"},
                {"content": "Routing agent selects the cheapest model", "source": "routing_agent.py"},
                {"content": "Telemetry agent logs cost to SQLite",    "source": "telemetry_agent.py"},
            ],
        )
        elapsed = int((time.monotonic() - t0) * 1000)
        ok(f"Batch upsert of 3 vectors in {elapsed}ms")

        # ── 6. Search — exact match ───────────────────────────────────────────
        section("6. Search — Exact Match")
        results = await client.search(COLLECTION, query=VEC_A, top_k=1)
        if not results:
            fail("Search returned 0 results for VEC_A")
        top = results[0]
        info(f"Top result: id={top.id}  score={top.score:.6f}  source={top.payload.get('source')}")
        if top.score < 0.99:
            fail(f"Expected score ≈ 1.0 for exact vector, got {top.score:.6f}")
        ok(f"Exact match score = {top.score:.6f} (≥ 0.99)")

        # ── 7. Search — top-k ordering ────────────────────────────────────────
        section("7. Search — top-k Ordering")
        results = await client.search(COLLECTION, query=VEC_B, top_k=3)
        if len(results) < 2:
            fail(f"Expected ≥ 2 results, got {len(results)}")
        scores = [r.score for r in results]
        if scores != sorted(scores, reverse=True):
            fail(f"Results not sorted descending: {scores}")
        ok(f"top-3 scores descending: {[round(s, 4) for s in scores]}")

        # ── 8. Search — payload retrieval ─────────────────────────────────────
        section("8. Payload Retrieval")
        results = await client.search(COLLECTION, query=VEC_A, top_k=1)
        payload = results[0].payload
        if "content" not in payload or "source" not in payload:
            fail(f"Payload missing keys: {payload}")
        ok(f"Payload intact: content='{payload['content'][:40]}…'  source='{payload['source']}'")

        # ── 9. Cleanup ────────────────────────────────────────────────────────
        section("9. Cleanup")
        await client.delete_collection(COLLECTION)
        still_exists = await client.has_collection(COLLECTION)
        if still_exists:
            fail("Collection still exists after delete_collection")
        ok(f"Test collection '{COLLECTION}' deleted")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{GREEN}{BOLD}All tests passed.{RESET}\n")


if __name__ == "__main__":
    asyncio.run(run_tests())
