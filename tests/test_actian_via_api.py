"""
Actian VectorAI DB test — via the TokenSense backend HTTP API.
Tests the full pipeline: index → ask → stats, confirming Actian
is being written to and read from correctly.

Requirements:
    1. Actian VectorAI DB running on localhost:50051
    2. Backend running:  cd backend && uvicorn main:app --reload --port 8000
    3. .env file configured with TOKENSENSE_API_KEY and OPENROUTER_API_KEY

Install deps (if not already):
    pip install httpx rich

Run from project root:
    python tests/test_actian_via_api.py
"""

import json
import os
import sys
import time
from pathlib import Path

try:
    import httpx
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
except ImportError:
    print("Missing deps. Run: pip install httpx rich")
    sys.exit(1)

# ── config ────────────────────────────────────────────────────────────────────
_CONFIG_FILE = Path.home() / ".tokensense" / "config"

def _load_config() -> dict:
    """Load from ~/.tokensense/config (created by CLI init)."""
    if _CONFIG_FILE.exists():
        with _CONFIG_FILE.open() as f:
            return json.load(f)
    # Fall back to env vars
    key = os.getenv("TOKENSENSE_API_KEY", "")
    url = os.getenv("TOKENSENSE_API_URL", "http://localhost:8000")
    if not key:
        print("No config found. Run 'python cli/tokensense.py init' or set TOKENSENSE_API_KEY.")
        sys.exit(1)
    return {"api_url": url, "api_key": key}

config  = _load_config()
API_URL = config["api_url"].rstrip("/")
HEADERS = {"X-API-Key": config["api_key"], "Content-Type": "application/json"}

console = Console()

# ── path to index (use the backend folder) ────────────────────────────────────
BACKEND_PATH = str((Path(__file__).parent.parent / "backend").resolve())

# ── helpers ───────────────────────────────────────────────────────────────────
passed = 0
failed = 0

def ok(label: str, detail: str = ""):
    global passed
    passed += 1
    extra = f"  [dim]{detail}[/dim]" if detail else ""
    console.print(f"  [green]✓[/green] {label}{extra}")

def fail(label: str, detail: str = ""):
    global failed
    failed += 1
    extra = f"  [dim]{detail}[/dim]" if detail else ""
    console.print(f"  [red]✗[/red] {label}{extra}")

def section(title: str):
    console.rule(f"[bold cyan]{title}[/bold cyan]")

def assert_eq(label, got, expected):
    if got == expected:
        ok(label, f"got={got!r}")
    else:
        fail(label, f"expected={expected!r}  got={got!r}")

def assert_gt(label, got, threshold):
    if got > threshold:
        ok(label, f"{got} > {threshold}")
    else:
        fail(label, f"expected > {threshold}, got {got}")

# ── tests ─────────────────────────────────────────────────────────────────────

def test_health():
    section("1. Backend Health")
    try:
        r = httpx.get(f"{API_URL}/", timeout=5)
        assert_eq("HTTP 200", r.status_code, 200)
        data = r.json()
        assert_eq("status=ok", data.get("status"), "ok")
        assert_eq("service name", data.get("service"), "TokenSense")
    except httpx.ConnectError:
        fail(f"Cannot connect to {API_URL} — is the backend running?")
        sys.exit(1)


def test_index():
    section("2. Index — Write to Actian")
    console.print(f"  [dim]Indexing path: {BACKEND_PATH}[/dim]")
    t0 = time.monotonic()
    r = httpx.post(
        f"{API_URL}/index",
        headers=HEADERS,
        json={"path": BACKEND_PATH, "file_extensions": [".py"]},
        timeout=300.0,
    )
    elapsed = int((time.monotonic() - t0) * 1000)

    assert_eq("HTTP 200", r.status_code, 200)
    data = r.json()
    assert_eq("status=ok", data.get("status"), "ok")
    assert_gt("indexed_files > 0", data.get("indexed_files", 0), 0)
    assert_gt("chunks > 0", data.get("chunks", 0), 0)
    ok(f"Indexed {data.get('indexed_files')} files / {data.get('chunks')} chunks in {elapsed}ms")
    return data


def test_optimize():
    section("3. Optimize — Read from Actian (no LLM)")
    r = httpx.post(
        f"{API_URL}/optimize",
        headers=HEADERS,
        json={"query": "what does the retrieval agent do?", "token_budget": 8000},
        timeout=60.0,
    )
    assert_eq("HTTP 200", r.status_code, 200)
    data = r.json()
    assert_gt("chunks_retrieved > 0", data.get("chunks_retrieved", 0), 0)
    assert_gt("optimized_tokens > 0", data.get("optimized_tokens", 0), 0)
    ok(
        "Actian returned chunks",
        f"retrieved={data.get('chunks_retrieved')}  "
        f"original={data.get('original_tokens')}  "
        f"optimized={data.get('optimized_tokens')}  "
        f"reduction={data.get('reduction_pct')}%",
    )
    return data


def test_ask():
    section("4. Ask — Full Pipeline (Actian + LLM)")
    r = httpx.post(
        f"{API_URL}/ask",
        headers=HEADERS,
        json={"query": "what does the retrieval agent do?", "token_budget": 8000},
        timeout=120.0,
    )
    assert_eq("HTTP 200", r.status_code, 200)
    data = r.json()

    assert_gt("optimized_tokens > 0 (Actian read confirmed)", data.get("optimized_tokens", 0), 0)
    assert_gt("output_tokens > 0", data.get("output_tokens", 0), 0)
    assert_gt("latency_ms > 0", data.get("latency_ms", 0), 0)

    if data.get("answer"):
        ok("Got non-empty answer from LLM")
    else:
        fail("Answer is empty")

    console.print(Panel(
        data.get("answer", "")[:400] + ("…" if len(data.get("answer","")) > 400 else ""),
        title="[green]Answer preview[/green]",
        expand=False,
    ))
    return data


def test_stats():
    section("5. Stats — Telemetry Written to SQLite")
    r = httpx.get(f"{API_URL}/stats", headers=HEADERS, params={"limit": 5}, timeout=10.0)
    assert_eq("HTTP 200", r.status_code, 200)
    data = r.json()

    summary = data.get("summary", {})
    assert_gt("total_queries > 0", summary.get("total_queries", 0), 0)

    recent = data.get("recent_queries", [])
    assert_gt("recent_queries returned", len(recent), 0)

    # Print summary table
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Metric")
    table.add_column("Value", justify="right")
    table.add_row("Total queries",    str(summary.get("total_queries")))
    table.add_row("Avg reduction",    f"{summary.get('avg_token_reduction_pct', 0):.1f}%")
    table.add_row("Total cost",       f"${summary.get('total_cost_usd', 0):.6f}")
    table.add_row("Avg latency",      f"{summary.get('avg_latency_ms', 0)} ms")
    console.print(table)


def test_auth():
    section("6. Auth Guard")
    r = httpx.get(f"{API_URL}/stats", headers={"X-API-Key": "wrong-key"}, timeout=5.0)
    assert_eq("Invalid key → 401", r.status_code, 401)

    r2 = httpx.get(f"{API_URL}/stats", timeout=5.0)
    assert_eq("Missing key → 422", r2.status_code, 422)


# ── entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    console.print(f"\n[bold]TokenSense — Actian Integration Tests[/bold]")
    console.print(f"[dim]API: {API_URL}[/dim]\n")

    test_health()
    test_index()
    test_optimize()
    test_ask()
    test_stats()
    test_auth()

    console.rule()
    total = passed + failed
    color = "green" if failed == 0 else "red"
    console.print(
        f"\n[{color}][bold]{passed}/{total} tests passed[/bold][/{color}]"
        + (f"   [red]{failed} failed[/red]" if failed else "")
        + "\n"
    )
    sys.exit(0 if failed == 0 else 1)
