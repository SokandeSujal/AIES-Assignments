import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from langgraph_arena import run_arena
from prompts import GENERAL_SYSTEM_PROMPT, build_avatar_system_prompt


load_dotenv()

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="Cortex AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[Message] = Field(default_factory=list)


class ArenaRequest(BaseModel):
    topic: str = Field(min_length=1)


async def generate_chat_response(system_prompt: str, request: ChatRequest) -> str:
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing in backend/.env")

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(
        {"role": message.role, "content": message.content}
        for message in request.history[-12:]
    )
    messages.append({"role": "user", "content": request.message})

    try:
        completion = await client.chat.completions.create(
            model=MODEL_NAME,
            temperature=0.7,
            messages=messages,
        )
    except Exception as exc:  # pragma: no cover - defensive for live demo
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return completion.choices[0].message.content or "I could not generate a response."


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/ask")
async def ask_ai(request: ChatRequest) -> dict[str, str]:
    response = await generate_chat_response(GENERAL_SYSTEM_PROMPT, request)
    return {"response": response}


@app.post("/api/avatar")
async def ask_avatar(request: ChatRequest) -> dict[str, str]:
    response = await generate_chat_response(build_avatar_system_prompt(), request)
    return {"response": response}


@app.post("/api/arena")
async def run_agent_arena(request: ArenaRequest) -> dict[str, str]:
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing in backend/.env")

    try:
        result = await run_arena(request.topic)
    except Exception as exc:  # pragma: no cover - defensive for live demo
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "thinker": result.get("thinker", ""),
        "critic": result.get("critic", ""),
        "judge": result.get("judge", ""),
    }
