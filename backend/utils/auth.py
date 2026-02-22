import os
from fastapi import Header, HTTPException
from dotenv import load_dotenv
from utils.db import validate_api_key

load_dotenv()

# Master key from env — always valid (admin / CI use)
_MASTER_KEY = os.getenv("TOKENSENSE_API_KEY", "")


async def verify_api_key(x_api_key: str = Header(...)) -> None:
    # Accept the master env key immediately
    if _MASTER_KEY and x_api_key == _MASTER_KEY:
        return
    # Otherwise look the key up in the DB
    if await validate_api_key(x_api_key):
        return
    raise HTTPException(status_code=401, detail="Invalid API key")
