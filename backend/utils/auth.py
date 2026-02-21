import os
from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv()

_API_KEY = os.getenv("TOKENSENSE_API_KEY", "")


async def verify_api_key(x_api_key: str = Header(...)) -> None:
    if not _API_KEY:
        raise HTTPException(status_code=500, detail="Server API key not configured")
    if x_api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
