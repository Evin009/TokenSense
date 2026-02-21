from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from utils.auth import verify_api_key
from utils import db

router = APIRouter()


class StatsSummary(BaseModel):
    total_queries: int
    avg_token_reduction_pct: float
    total_cost_usd: float
    avg_latency_ms: int


class StatsResponse(BaseModel):
    summary: StatsSummary
    recent_queries: list[dict]


@router.get("", response_model=StatsResponse, dependencies=[Depends(verify_api_key)])
async def get_stats(limit: int = Query(default=100, ge=1, le=1000)) -> StatsResponse:
    summary_data = await db.get_summary()
    recent = await db.get_stats(limit=limit)

    return StatsResponse(
        summary=StatsSummary(**summary_data),
        recent_queries=recent,
    )
