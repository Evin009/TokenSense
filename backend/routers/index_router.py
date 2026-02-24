import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from utils.auth import verify_api_key
from agents import query_agent, retrieval_agent

router = APIRouter()

_CHUNK_TOKEN_TARGET = 150  # keep real token count safely under OpenRouter free-tier 337-token limit
_DEFAULT_EXTENSIONS = {".py", ".md", ".txt", ".js", ".ts", ".jsx", ".tsx", ".rst", ".yaml", ".yml"}


class IndexRequest(BaseModel):
    path: str
    file_extensions: list[str] = list(_DEFAULT_EXTENSIONS)


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
async def index_directory(req: IndexRequest) -> IndexResponse:
    if not os.path.exists(req.path):
        raise HTTPException(status_code=400, detail=f"Path not found: {req.path}")

    extensions = set(req.file_extensions)
    indexed_files = 0
    total_chunks = 0

    for root, _dirs, files in os.walk(req.path):
        for filename in files:
            if os.path.splitext(filename)[1] not in extensions:
                continue
            filepath = os.path.join(root, filename)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except OSError:
                continue

            if not content.strip():
                continue

            raw_chunks = _split_into_chunks(content)
            chunk_batch = []
            for chunk in raw_chunks:
                embedding = await query_agent.embed(chunk)
                chunk_batch.append({"content": chunk, "embedding": embedding, "source": filepath})

            if chunk_batch:
                await retrieval_agent.batch_store(chunk_batch)
                total_chunks += len(chunk_batch)

            indexed_files += 1

    return IndexResponse(indexed_files=indexed_files, chunks=total_chunks, status="ok")
