import os
import aiosqlite
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "telemetry.db")

_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS telemetry (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp        TEXT    NOT NULL,
    query_snippet    TEXT,
    model_used       TEXT,
    input_tokens     INTEGER,
    output_tokens    INTEGER,
    optimized_tokens INTEGER,
    cost_usd         REAL,
    latency_ms       INTEGER
);
"""


async def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(_CREATE_TABLE)
        await db.commit()


async def log_query(record: dict) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """
            INSERT INTO telemetry
                (timestamp, query_snippet, model_used, input_tokens, output_tokens,
                 optimized_tokens, cost_usd, latency_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record.get("timestamp", datetime.now(timezone.utc).isoformat()),
                record.get("query_snippet", "")[:120],
                record.get("model_used", ""),
                record.get("input_tokens", 0),
                record.get("output_tokens", 0),
                record.get("optimized_tokens", 0),
                record.get("cost_usd", 0.0),
                record.get("latency_ms", 0),
            ),
        )
        await db.commit()
        return cursor.lastrowid


async def get_stats(limit: int = 100) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM telemetry ORDER BY id DESC LIMIT ?", (limit,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_summary() -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT
                COUNT(*)                                         AS total_queries,
                AVG(
                    CASE WHEN input_tokens > 0
                    THEN CAST(input_tokens - optimized_tokens AS REAL) / input_tokens * 100
                    ELSE 0 END
                )                                                AS avg_token_reduction_pct,
                SUM(cost_usd)                                    AS total_cost_usd,
                AVG(latency_ms)                                  AS avg_latency_ms
            FROM telemetry
            """
        )
        row = await cursor.fetchone()
        if row is None:
            return {
                "total_queries": 0,
                "avg_token_reduction_pct": 0.0,
                "total_cost_usd": 0.0,
                "avg_latency_ms": 0,
            }
        return {
            "total_queries": row["total_queries"] or 0,
            "avg_token_reduction_pct": round(row["avg_token_reduction_pct"] or 0.0, 2),
            "total_cost_usd": round(row["total_cost_usd"] or 0.0, 6),
            "avg_latency_ms": int(row["avg_latency_ms"] or 0),
        }
