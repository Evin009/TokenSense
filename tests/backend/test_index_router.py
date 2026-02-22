"""Tests for routers/index_router.py — POST /index endpoint and _split_into_chunks."""

import os
import pytest
from routers.index_router import _split_into_chunks


def _headers(key: str) -> dict:
    return {"x-api-key": key}


def _mock_store_agents(mocker):
    mocker.patch("agents.query_agent.embed", return_value=[0.1] * 1536)
    mocker.patch("agents.retrieval_agent.batch_store", return_value=None)


# ── _split_into_chunks (pure function) ───────────────────────────────────────

def test_split_empty_string_returns_empty():
    assert _split_into_chunks("") == []


def test_split_small_text_fits_in_one_chunk():
    text = "Hello world. This is a short file."
    chunks = _split_into_chunks(text, target_tokens=500)
    assert len(chunks) == 1
    assert "Hello world" in chunks[0]


def test_split_large_text_creates_multiple_chunks():
    # ~1500 words → at 500-token target (~385 words) should produce ≥3 chunks
    line = "word " * 50 + "\n"
    text = line * 30  # 30 lines of 50 words = 1500 words
    chunks = _split_into_chunks(text, target_tokens=500)
    assert len(chunks) >= 3


def test_split_strips_blank_only_chunks():
    text = "\n\n\n   \n\n"
    chunks = _split_into_chunks(text)
    assert chunks == []


def test_split_preserves_content():
    text = "def authenticate():\n    return True\n"
    chunks = _split_into_chunks(text, target_tokens=1000)
    assert any("authenticate" in c for c in chunks)


# ── POST /index ───────────────────────────────────────────────────────────────

async def test_index_valid_directory(client, api_key, tmp_path, mocker):
    _mock_store_agents(mocker)

    # Create two indexable files
    (tmp_path / "readme.md").write_text("# TokenSense\n\nThis project reduces token costs.")
    (tmp_path / "utils.py").write_text("def helper():\n    return True\n")

    response = await client.post(
        "/index",
        json={"path": str(tmp_path)},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["indexed_files"] == 2
    assert data["chunks"] >= 2


async def test_index_nonexistent_path_returns_400(client, api_key):
    response = await client.post(
        "/index",
        json={"path": "/nonexistent/path/xyz"},
        headers=_headers(api_key),
    )
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()


async def test_index_filters_by_extension(client, api_key, tmp_path, mocker):
    _mock_store_agents(mocker)

    (tmp_path / "code.py").write_text("print('hello')")
    (tmp_path / "notes.pdf").write_bytes(b"%PDF-ignored")  # not in default extensions

    response = await client.post(
        "/index",
        json={"path": str(tmp_path), "file_extensions": [".py"]},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    assert response.json()["indexed_files"] == 1


async def test_index_empty_directory_returns_zero_counts(client, api_key, tmp_path, mocker):
    _mock_store_agents(mocker)
    response = await client.post(
        "/index",
        json={"path": str(tmp_path)},
        headers=_headers(api_key),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["indexed_files"] == 0
    assert data["chunks"] == 0


async def test_index_missing_key_returns_422(client):
    response = await client.post("/index", json={"path": "."})
    assert response.status_code == 422


async def test_index_invalid_key_returns_401(client):
    response = await client.post("/index", json={"path": "."}, headers=_headers("bad"))
    assert response.status_code == 401
