import os
from typing import TypedDict

from dotenv import load_dotenv
from langgraph.graph import END, START, StateGraph
from openai import AsyncOpenAI

from prompts import CRITIC_SYSTEM_PROMPT, JUDGE_SYSTEM_PROMPT, THINKER_SYSTEM_PROMPT


load_dotenv()


class ArenaState(TypedDict, total=False):
    topic: str
    thinker: str
    critic: str
    judge: str


_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def _complete(system_prompt: str, user_prompt: str) -> str:
    completion = await _client.chat.completions.create(
        model=_model,
        temperature=0.8,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return completion.choices[0].message.content or ""


async def thinker_node(state: ArenaState) -> ArenaState:
    topic = state["topic"]
    thinker = await _complete(
        THINKER_SYSTEM_PROMPT,
        f"Debate topic: {topic}\n\nGive a strong opening position.",
    )
    return {"thinker": thinker}


async def critic_node(state: ArenaState) -> ArenaState:
    topic = state["topic"]
    thinker = state["thinker"]
    critic = await _complete(
        CRITIC_SYSTEM_PROMPT,
        f"Debate topic: {topic}\n\nThinker said:\n{thinker}\n\nCritique the reasoning, expose gaps, and strengthen the discussion.",
    )
    return {"critic": critic}


async def judge_node(state: ArenaState) -> ArenaState:
    topic = state["topic"]
    thinker = state["thinker"]
    critic = state["critic"]
    judge = await _complete(
        JUDGE_SYSTEM_PROMPT,
        f"Debate topic: {topic}\n\nThinker:\n{thinker}\n\nCritic:\n{critic}\n\nDeliver the final synthesis.",
    )
    return {"judge": judge}


_builder = StateGraph(ArenaState)
_builder.add_node("thinker", thinker_node)
_builder.add_node("critic", critic_node)
_builder.add_node("judge", judge_node)
_builder.add_edge(START, "thinker")
_builder.add_edge("thinker", "critic")
_builder.add_edge("critic", "judge")
_builder.add_edge("judge", END)
arena_graph = _builder.compile()


async def run_arena(topic: str) -> ArenaState:
    return await arena_graph.ainvoke({"topic": topic})
