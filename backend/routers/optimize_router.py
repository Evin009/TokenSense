from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import verify_api_key
from agents import query_agent, retrieval_agent, context_optimizer

router = APIRouter()


class OptimizeRequest(BaseModel):
    query: str
    token_budget: int = 8000


class OptimizeResponse(BaseModel):
    optimized_context: str
    original_tokens: int
    optimized_tokens: int
    reduction_pct: float
    chunks_retrieved: int


@router.post("", response_model=OptimizeResponse, dependencies=[Depends(verify_api_key)])
async def optimize(req: OptimizeRequest) -> OptimizeResponse:
    query_result = await query_agent.process(req.query)
    chunks = await retrieval_agent.fetch(query_result["embedding"])

    opt = await context_optimizer.optimize(
        chunks=chunks,
        token_budget=req.token_budget,
        query=req.query,
    )

    original = opt["original_tokens"]
    optimized = opt["optimized_tokens"]
    reduction_pct = (
        round((original - optimized) / original * 100, 2) if original > 0 else 0.0
    )

    return OptimizeResponse(
        optimized_context=opt["optimized_context"],
        original_tokens=original,
        optimized_tokens=optimized,
        reduction_pct=reduction_pct,
        chunks_retrieved=len(chunks),
    )
