"""
TokenSense CLI — developer command-line interface for the TokenSense API.

Usage:
    python tokensense.py init
    python tokensense.py index <path>
    python tokensense.py ask "<query>"
    python tokensense.py stats
"""

import json
import sys
from pathlib import Path

import httpx
import typer
from rich import print as rprint
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

app = typer.Typer(
    name="tokensense",
    help="TokenSense — AI orchestration engine CLI",
    no_args_is_help=True,
)
console = Console()

_CONFIG_DIR = Path.home() / ".tokensense"
_CONFIG_FILE = _CONFIG_DIR / "config"
_DEFAULT_URL = "http://localhost:8000"


# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------


def _load_config() -> dict:
    if not _CONFIG_FILE.exists():
        typer.echo(
            "Config not found. Run 'tokensense init' first to set your API URL and key.",
            err=True,
        )
        raise typer.Exit(1)
    with _CONFIG_FILE.open() as f:
        return json.load(f)


def _api_headers(config: dict) -> dict:
    return {"X-API-Key": config["api_key"], "Content-Type": "application/json"}


def _handle_http_error(resp: httpx.Response) -> None:
    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail", resp.text)
        except Exception:
            detail = resp.text
        typer.echo(f"API error {resp.status_code}: {detail}", err=True)
        raise typer.Exit(1)


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------


@app.command()
def init() -> None:
    """Configure the API URL and key. Saves to ~/.tokensense/config."""
    api_url = typer.prompt("API URL", default=_DEFAULT_URL)
    api_key = typer.prompt("API key", hide_input=True)

    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    config = {"api_url": api_url.rstrip("/"), "api_key": api_key}
    with _CONFIG_FILE.open("w") as f:
        json.dump(config, f, indent=2)

    rprint(f"[green]✓ Config saved to {_CONFIG_FILE}[/green]")


@app.command()
def index(
    path: str = typer.Argument(..., help="Local directory to index into TokenSense"),
    extensions: str = typer.Option(
        ".py,.ts,.tsx,.js,.md,.txt",
        "--ext",
        help="Comma-separated list of file extensions to index",
    ),
) -> None:
    """Walk a local directory and index its files into the vector database."""
    config = _load_config()
    ext_list = [e.strip() for e in extensions.split(",")]

    with console.status("[bold cyan]Indexing files…[/bold cyan]"):
        try:
            resp = httpx.post(
                f"{config['api_url']}/index",
                headers=_api_headers(config),
                json={"path": path, "file_extensions": ext_list},
                timeout=300.0,
            )
        except httpx.ConnectError:
            typer.echo(
                f"Could not connect to {config['api_url']}. Is the backend running?",
                err=True,
            )
            raise typer.Exit(1)

    _handle_http_error(resp)
    data = resp.json()

    panel = Panel(
        f"  [bold]Files indexed:[/bold]  {data['indexed_files']}\n"
        f"  [bold]Total chunks:[/bold]   {data['chunks']}\n"
        f"  [bold]Status:[/bold]         [green]{data['status']}[/green]",
        title="[bold cyan]Index Complete[/bold cyan]",
        expand=False,
    )
    console.print(panel)


@app.command()
def ask(
    query: str = typer.Argument(..., help="Question or prompt to send to TokenSense"),
    token_budget: int = typer.Option(8000, "--budget", help="Max token budget for context"),
) -> None:
    """Send a query through the full TokenSense pipeline and print the answer."""
    config = _load_config()

    with console.status("[bold cyan]Thinking…[/bold cyan]"):
        try:
            resp = httpx.post(
                f"{config['api_url']}/ask",
                headers=_api_headers(config),
                json={"query": query, "token_budget": token_budget},
                timeout=120.0,
            )
        except httpx.ConnectError:
            typer.echo(
                f"Could not connect to {config['api_url']}. Is the backend running?",
                err=True,
            )
            raise typer.Exit(1)

    _handle_http_error(resp)
    data = resp.json()

    # Print the answer
    console.print()
    console.print(Panel(data["answer"], title="[bold green]Answer[/bold green]", expand=True))
    console.print()

    # Token stats table
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Metric", style="dim")
    table.add_column("Value")

    table.add_row("Model", data["model"])
    table.add_row("Input tokens", str(data["input_tokens"]))
    table.add_row("Output tokens", str(data["output_tokens"]))
    table.add_row("Optimized tokens", str(data["optimized_tokens"]))
    table.add_row("Context reduction", f"{data['context_reduction_pct']}%")
    table.add_row("Cost", f"${data['cost_usd']:.6f}")
    table.add_row("Latency", f"{data['latency_ms']} ms")

    console.print(table)


@app.command()
def stats(
    limit: int = typer.Option(20, "--limit", "-n", help="Number of recent queries to show"),
) -> None:
    """Show usage summary and recent query history."""
    config = _load_config()

    with console.status("[bold cyan]Fetching stats…[/bold cyan]"):
        try:
            resp = httpx.get(
                f"{config['api_url']}/stats",
                headers=_api_headers(config),
                params={"limit": limit},
                timeout=30.0,
            )
        except httpx.ConnectError:
            typer.echo(
                f"Could not connect to {config['api_url']}. Is the backend running?",
                err=True,
            )
            raise typer.Exit(1)

    _handle_http_error(resp)
    data = resp.json()
    summary = data["summary"]

    # Summary panel
    panel = Panel(
        f"  [bold]Total queries:[/bold]   {summary['total_queries']}\n"
        f"  [bold]Avg reduction:[/bold]   {summary['avg_token_reduction_pct']:.1f}%\n"
        f"  [bold]Total cost:[/bold]      ${summary['total_cost_usd']:.4f}\n"
        f"  [bold]Avg latency:[/bold]     {summary['avg_latency_ms']} ms",
        title="[bold cyan]Summary[/bold cyan]",
        expand=False,
    )
    console.print(panel)
    console.print()

    # Recent queries table
    recent = data["recent_queries"]
    if not recent:
        console.print("[dim]No queries recorded yet.[/dim]")
        return

    table = Table(
        title=f"Recent Queries ({len(recent)})",
        show_header=True,
        header_style="bold magenta",
    )
    table.add_column("Query", max_width=40, no_wrap=True)
    table.add_column("Model", style="dim")
    table.add_column("Cost", justify="right")
    table.add_column("Latency", justify="right")

    for row in recent:
        snippet = (row.get("query_snippet") or "")[:40]
        model = row.get("model_used") or "—"
        cost = f"${row.get('cost_usd', 0):.6f}"
        latency = f"{row.get('latency_ms', 0)} ms"
        table.add_row(snippet, model, cost, latency)

    console.print(table)


if __name__ == "__main__":
    app()
