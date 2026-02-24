"""
Shared pytest fixtures for all backend tests.

Adds backend/ to sys.path so every agent/router/util can be imported
without installing the package.  External services (OpenRouter, Gemini,
Actian DB) are never contacted — individual tests mock at the agent level.
"""

import sys
import os

# Make backend importable regardless of where pytest is invoked from
sys.path.insert(
    0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
)

import pytest
from unittest.mock import AsyncMock


# ── Shared constants ──────────────────────────────────────────────────────────

TEST_API_KEY = "test-secret-key-abc123"


# ── Environment fixtures ──────────────────────────────────────────────────────

@pytest.fixture
def api_key() -> str:
    return TEST_API_KEY


@pytest.fixture(autouse=True)
def patch_auth_key(monkeypatch, api_key):
    """
    Patch the in-memory API key used by verify_api_key so tests work
    without a real .env file.  Runs automatically for every test.
    Stubs validate_api_key so no real DB is touched for simple auth tests.
    """
    import utils.auth as auth_mod
    monkeypatch.setattr(auth_mod, "_MASTER_KEY", api_key)
    monkeypatch.setattr(auth_mod, "validate_api_key", AsyncMock(return_value=False))


@pytest.fixture(autouse=True)
def patch_llm_keys(monkeypatch):
    """Prevent any real LLM key lookups from breaking tests."""
    import agents.routing_agent as ra
    import agents.query_agent as qa
    monkeypatch.setattr(ra, "_OPENROUTER_KEY", "sk-or-test")
    monkeypatch.setattr(ra, "_GEMINI_KEY", "AIza-test")
    monkeypatch.setattr(qa, "_OPENROUTER_KEY", "sk-or-test")


# ── Database fixtures ─────────────────────────────────────────────────────────

@pytest.fixture
async def temp_db(tmp_path, monkeypatch):
    """
    Replace the global DB_PATH with a per-test temp file so no production
    data is touched and each test starts with a clean database.
    """
    import utils.db as db
    db_path = str(tmp_path / "telemetry.db")
    monkeypatch.setattr(db, "DB_PATH", db_path)
    await db.init_db()
    return db_path


# ── HTTP client fixture ───────────────────────────────────────────────────────

@pytest.fixture
async def client(temp_db):
    """
    Async HTTPX test client wired directly to the FastAPI app via
    ASGITransport.  No real network I/O is performed.

    Individual tests are responsible for mocking agent calls.
    """
    from httpx import AsyncClient, ASGITransport
    from main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
