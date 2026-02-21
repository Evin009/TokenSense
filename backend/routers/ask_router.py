import time
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import verify_api_key
from agents import query_agent, retrieval_agent, context_optimizer, routing_agent, telemetry_agent

router = APIRouter()


class AskRequest(BaseModel):
    query: str
    token_budget: int = 8000


class AskResponse(BaseModel):
    answer: str
    model: str
    input_tokens: int
    output_tokens: int
    optimized_tokens: int
    cost_usd: float
    latency_ms: int
    context_reduction_pct: float


@router.post("", response_model=AskResponse, dependencies=[Depends(verify_api_key)])
async def ask(req: AskRequest) -> AskResponse:
    start = time.monotonic()

    # 1. Embed + classify
    query_result = await query_agent.process(req.query)

    # 2. Retrieve relevant chunks
    chunks = await retrieval_agent.fetch(query_result["embedding"])

    # 3. Optimize context
    opt = await context_optimizer.optimize(
        chunks=chunks,
        token_budget=req.token_budget,
        query=req.query,
    )

    # 4. Route + LLM call
    route_result = await routing_agent.route(
        task_type=query_result["task_type"],
        token_estimate=query_result["token_estimate"],
        optimized_tokens=opt["optimized_tokens"],
        optimized_context=opt["optimized_context"],
        query=req.query,
    )

    latency_ms = int((time.monotonic() - start) * 1000)

    # 5. Telemetry
    tel = await telemetry_agent.record(
        query=req.query,
        model=route_result["model"],
        input_tokens=route_result["input_tokens"],
        output_tokens=route_result["output_tokens"],
        optimized_tokens=opt["optimized_tokens"],
        latency_ms=latency_ms,
    )

    original = opt["original_tokens"]
    optimized = opt["optimized_tokens"]
    reduction_pct = (
        round((original - optimized) / original * 100, 2) if original > 0 else 0.0
    )

    return AskResponse(
        answer=route_result["answer"],
        model=route_result["model"],
        input_tokens=route_result["input_tokens"],
        output_tokens=route_result["output_tokens"],
        optimized_tokens=optimized,
        cost_usd=tel["cost_usd"],
        latency_ms=latency_ms,
        context_reduction_pct=reduction_pct,
    )
