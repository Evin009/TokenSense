import os
import httpx
from dotenv import load_dotenv

load_dotenv()

_OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
_OPENROUTER_CHAT = "https://openrouter.ai/api/v1/chat/completions"
_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _select_model(task_type: str, optimized_tokens: int) -> dict:
    if task_type == "code" or optimized_tokens > 6000:
        return {
            "model": "google/gemini-pro",
            "provider": "gemini",
            "reason": "Code/large context → Gemini Pro",
        }
    if task_type == "documentation" or optimized_tokens > 3000:
        return {
            "model": "openai/gpt-4o-mini",
            "provider": "openrouter",
            "reason": "Documentation/medium context → GPT-4o mini",
        }
    return {
        "model": "anthropic/claude-3-haiku",
        "provider": "openrouter",
        "reason": "General/small context → Claude Haiku (fast + cheap)",
    }


async def _call_openrouter(model: str, context: str, query: str) -> str:
    messages = []
    if context:
        messages.append({"role": "system", "content": f"Use the following context:\n\n{context}"})
    messages.append({"role": "user", "content": query})

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            _OPENROUTER_CHAT,
            headers={
                "Authorization": f"Bearer {_OPENROUTER_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": model, "messages": messages},
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def _call_gemini(context: str, query: str) -> str:
    prompt = query
    if context:
        prompt = f"Context:\n{context}\n\nQuestion: {query}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{_GEMINI_BASE}/gemini-1.5-flash:generateContent?key={_GEMINI_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def route(
    task_type: str,
    token_estimate: int,
    optimized_tokens: int,
    optimized_context: str,
    query: str,
) -> dict:
    """
    Select the best model and call the LLM.

    Returns:
        {
            "answer": str,
            "model": str,
            "provider": str,
            "reason": str,
            "input_tokens": int,
            "output_tokens": int
        }
    """
    selection = _select_model(task_type, optimized_tokens)
    model = selection["model"]
    provider = selection["provider"]

    if provider == "gemini":
        answer = await _call_gemini(optimized_context, query)
    else:
        answer = await _call_openrouter(model, optimized_context, query)

    input_tokens = optimized_tokens + int(len(query.split()) * 1.3)
    output_tokens = int(len(answer.split()) * 1.3)

    return {
        "answer": answer,
        "model": model,
        "provider": provider,
        "reason": selection["reason"],
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
    }
