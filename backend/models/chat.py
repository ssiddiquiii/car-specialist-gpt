from pydantic import BaseModel
from typing import List, Optional

class MessageBase(BaseModel):
    role: str
    content: str
    timestamp: str

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    messages: List[MessageBase]

class ConversationCreate(BaseModel):
    title: str = "New Chat"

class AddMessageRequest(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None
