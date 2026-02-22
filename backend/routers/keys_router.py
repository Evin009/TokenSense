import secrets
from fastapi import APIRouter
from pydantic import BaseModel
from utils.db import create_api_key

router = APIRouter()


class KeyRequest(BaseModel):
    label: str = ""


class KeyResponse(BaseModel):
    key: str
    label: str
    message: str


@router.post("", response_model=KeyResponse)
async def generate_key(req: KeyRequest = KeyRequest()) -> KeyResponse:
    """Generate a new API key and store it in the database. No auth required."""
    key = "ts-" + secrets.token_hex(24)
    await create_api_key(key, req.label)
    return KeyResponse(
        key=key,
        label=req.label,
        message="Save this key — it won't be shown again.",
    )
