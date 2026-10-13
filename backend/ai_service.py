import json
import os

import httpx


OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL", "http://localhost:11434"
).rstrip("/")
OLLAMA_CHAT_URL = f"{OLLAMA_BASE_URL}/api/chat"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")

# CPU-only inference on this machine runs at roughly 5-9 tokens/sec,
# so a ~600-token answer plus prompt reading takes 1.5-3 minutes.
REQUEST_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "240"))

# Ollama defaults to a 4096-token context when it finds no GPU memory.
# The prompt and the JSON answer must both fit, otherwise llama-server
# silently shifts the context and drops the system prompt.
CONTEXT_TOKENS = 8192

# Hard ceiling on generated tokens so a rambling model cannot run
# past the request timeout.
DEFAULT_MAX_TOKENS = 800


async def generate_ai_response(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = DEFAULT_MAX_TOKENS,
) -> dict:
    """
    Generate a structured response from the local Ollama model.
    """

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "stream": False,
        "format": "json",
        # qwen3 is a reasoning model and thinks by default. Thinking
        # emits hundreds of hidden tokens before the JSON answer, which
        # alone blew past the request timeout on CPU-only inference.
        "think": False,
        "options": {
            "temperature": 0.2,
            "num_ctx": CONTEXT_TOKENS,
            "num_predict": max_tokens,
        },
    }

    try:
        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT
        ) as client:
            response = await client.post(
                OLLAMA_CHAT_URL,
                json=payload,
            )
            response.raise_for_status()

        data = response.json()

        if data.get("done_reason") == "length":
            raise RuntimeError(
                "The AI response was cut off before it finished. "
                "Please try again."
            )

        content = data.get("message", {}).get("content", "")

        result = json.loads(content)

        if not isinstance(result, dict):
            raise ValueError("The AI returned an unexpected JSON structure.")

        return result

    except httpx.ConnectError as error:
        raise RuntimeError(
            "Cannot connect to Ollama. Make sure Ollama is running."
        ) from error

    except httpx.TimeoutException as error:
        raise RuntimeError(
            "The AI model took too long to respond. Please try again."
        ) from error

    except httpx.HTTPStatusError as error:
        raise RuntimeError(
            f"Ollama returned HTTP {error.response.status_code}."
        ) from error

    except json.JSONDecodeError as error:
        raise RuntimeError(
            "The AI returned invalid JSON. Please try again."
        ) from error


async def get_ollama_status() -> dict:
    """
    Report whether Ollama is reachable and the configured model is
    installed, so the UI can say so before a multi-minute request.
    """

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()
        models = {
            model.get("name", "")
            for model in response.json().get("models", [])
        }
    except (httpx.HTTPError, ValueError):
        return {
            "available": False,
            "model": OLLAMA_MODEL,
            "model_installed": False,
            "message": "Ollama is not running. Start it to enable AI analysis.",
        }

    installed = (
        OLLAMA_MODEL in models or f"{OLLAMA_MODEL}:latest" in models
    )

    return {
        "available": installed,
        "model": OLLAMA_MODEL,
        "model_installed": installed,
        "message": (
            "AI analysis is ready."
            if installed
            else f"Ollama is running but {OLLAMA_MODEL} is not installed. "
                 f"Run: ollama pull {OLLAMA_MODEL}"
        ),
    }
