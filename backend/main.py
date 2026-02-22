import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.db import init_db
from routers import index_router, ask_router, optimize_router, stats_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="TokenSense API",
    description="AI orchestration engine — semantic retrieval, context compression, model routing.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://108.61.192.150:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(index_router.router, prefix="/index", tags=["Index"])
app.include_router(ask_router.router, prefix="/ask", tags=["Ask"])
app.include_router(optimize_router.router, prefix="/optimize", tags=["Optimize"])
app.include_router(stats_router.router, prefix="/stats", tags=["Stats"])


@app.get("/", tags=["Health"])
async def health():
    return {"status": "ok", "service": "TokenSense", "version": "0.1.0"}
