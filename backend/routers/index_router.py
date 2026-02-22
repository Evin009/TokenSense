from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import verify_api_key
from agents import query_agent, retrieval_agent

router = APIRouter()

_CHUNK_TOKEN_TARGET = 150  # keep real token count safely under OpenRouter free-tier 337-token limit


class FilePayload(BaseModel):
    source: str
    content: str


class IndexRequest(BaseModel):
    files: list[FilePayload]


class IndexResponse(BaseModel):
    indexed_files: int
    chunks: int
    status: str


def _split_into_chunks(text: str, target_tokens: int = _CHUNK_TOKEN_TARGET) -> list[str]:
    lines = text.splitlines(keepends=True)
    chunks: list[str] = []
    current: list[str] = []
    current_tokens = 0

    for line in lines:
        line_tokens = int(len(line.split()) * 1.3)
        if current_tokens + line_tokens > target_tokens and current:
            chunks.append("".join(current))
            current = []
            current_tokens = 0
        current.append(line)
        current_tokens += line_tokens

    if current:
        chunks.append("".join(current))

    return [c for c in chunks if c.strip()]


@router.post("", response_model=IndexResponse, dependencies=[Depends(verify_api_key)])
async def index_files(req: IndexRequest) -> IndexResponse:
    indexed_files = 0
    total_chunks = 0

    for file in req.files:
        if not file.content.strip():
            continue

        raw_chunks = _split_into_chunks(file.content)

        chunk_batch = []
        for chunk in raw_chunks:
            embedding = await query_agent.embed(chunk)
            chunk_batch.append({"content": chunk, "embedding": embedding, "source": file.source})

        if chunk_batch:
            await retrieval_agent.batch_store(chunk_batch)
            total_chunks += len(chunk_batch)

        indexed_files += 1

    return IndexResponse(indexed_files=indexed_files, chunks=total_chunks, status="ok")
