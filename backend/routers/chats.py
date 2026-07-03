from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from database import get_conversations_collection
from models.chat import ConversationResponse, ConversationCreate, AddMessageRequest
from utils.auth_utils import decode_access_token

router = APIRouter(prefix="/api/chats", tags=["chats"])

def get_user_id_from_token(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")

@router.get("", response_model=List[ConversationResponse])
async def get_conversations(authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    col = get_conversations_collection()
    
    # Sort by updated_at descending
    cursor = col.find({"user_id": user_id}).sort("updated_at", -1)
    chats = await cursor.to_list(length=100)
    
    return [
        {
            "id": c["_id"],
            "user_id": c["user_id"],
            "title": c.get("title", "New Chat"),
            "created_at": c["created_at"],
            "updated_at": c["updated_at"],
            "messages": c.get("messages", [])
        }
        for c in chats
    ]

@router.post("", response_model=ConversationResponse)
async def create_conversation(req: ConversationCreate, authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    col = get_conversations_collection()
    
    chat_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "_id": chat_id,
        "user_id": user_id,
        "title": req.title,
        "created_at": now,
        "updated_at": now,
        "messages": []
    }
    
    await col.insert_one(doc)
    
    return {
        "id": chat_id,
        "user_id": user_id,
        "title": req.title,
        "created_at": now,
        "updated_at": now,
        "messages": []
    }

@router.post("/{chat_id}/message")
async def add_message(chat_id: str, msg: AddMessageRequest, authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    col = get_conversations_collection()
    
    chat = await col.find_one({"_id": chat_id, "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    now = datetime.now(timezone.utc).isoformat()
    msg_doc = {
        "role": msg.role,
        "content": msg.content,
        "timestamp": msg.timestamp or now
    }
    
    await col.update_one(
        {"_id": chat_id},
        {
            "$push": {"messages": msg_doc},
            "$set": {"updated_at": now}
        }
    )
    
    return {"status": "ok", "message": msg_doc}

@router.put("/{chat_id}/title")
async def update_title(chat_id: str, title: str, authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    col = get_conversations_collection()
    
    res = await col.update_one(
        {"_id": chat_id, "user_id": user_id},
        {"$set": {"title": title, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "ok"}

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, authorization: Optional[str] = Header(None)):
    user_id = get_user_id_from_token(authorization)
    col = get_conversations_collection()
    
    res = await col.delete_one({"_id": chat_id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "ok"}
