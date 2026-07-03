from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
import uuid


# ── Shared ────────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


# ── /api/chat/dual  (Request) ─────────────────────────────────────────────────
class DualChatRequest(BaseModel):
    messages: List[Message]
    conversation_id: Optional[str] = None
    user_id: Optional[str] = "anonymous"


# ── Single response unit returned to frontend ─────────────────────────────────
class SingleResponse(BaseModel):
    response_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    temperature: float
    latency_ms: float
    token_count: int


# ── /api/chat/dual  (Response) ────────────────────────────────────────────────
class DualChatResponse(BaseModel):
    response_a: SingleResponse
    response_b: SingleResponse
    prompt: str                      # The last user message
    conversation_id: Optional[str]
    user_id: Optional[str]


# ── /api/preference  (Request) ────────────────────────────────────────────────
class PreferenceRequest(BaseModel):
    conversation_id: Optional[str] = None
    user_id: Optional[str] = "anonymous"
    prompt: str
    context: List[Message]           # Full conversation history
    response_a: SingleResponse
    response_b: SingleResponse
    chosen: Literal["a", "b", "skipped"]


# ── /api/preference  (Response) ──────────────────────────────────────────────
class PreferenceResponse(BaseModel):
    saved: bool
    log_id: str
    chosen_content: str
