"""Tests for utils/auth.py — API key middleware."""

import pytest
from unittest.mock import AsyncMock
from fastapi import HTTPException
from utils.auth import verify_api_key


async def test_valid_key_does_not_raise(api_key):
    """Correct key → function returns cleanly."""
    await verify_api_key(x_api_key=api_key)  # no exception


async def test_wrong_key_raises_401(api_key):
    """Wrong key → 401 Unauthorized."""
    with pytest.raises(HTTPException) as exc_info:
        await verify_api_key(x_api_key="totally-wrong-key")
    assert exc_info.value.status_code == 401
    assert "Invalid" in exc_info.value.detail


async def test_empty_key_raises_401(api_key):
    """Empty string key → 401 (not a 500 — key is present on server)."""
    with pytest.raises(HTTPException) as exc_info:
        await verify_api_key(x_api_key="")
    assert exc_info.value.status_code == 401


async def test_unconfigured_server_key_raises_401(monkeypatch):
    """
    If the server has no master key configured and the key is not in the DB,
    every request must return 401.
    """
    import utils.auth as auth_mod
    monkeypatch.setattr(auth_mod, "_MASTER_KEY", "")
    monkeypatch.setattr(auth_mod, "validate_api_key", AsyncMock(return_value=False))
    with pytest.raises(HTTPException) as exc_info:
        await verify_api_key(x_api_key="any-key")
    assert exc_info.value.status_code == 401


async def test_key_comparison_is_exact(api_key):
    """Key with extra whitespace is not accepted."""
    with pytest.raises(HTTPException):
        await verify_api_key(x_api_key=f" {api_key} ")
