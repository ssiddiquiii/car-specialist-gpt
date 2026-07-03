from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import get_users_collection
from models.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from utils.auth_utils import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate):
    users_col = get_users_collection()
    
    # Check if user exists
    existing = await users_col.find_one({"email": user.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": user.name,
        "email": user.email.lower(),
        "password_hash": get_password_hash(user.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await users_col.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id, "email": user.email.lower()})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    users_col = get_users_collection()
    
    db_user = await users_col.find_one({"email": user.email.lower()})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_access_token({"sub": db_user["_id"], "email": db_user["email"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(token: str):
    # This is a simple token validation route, 
    # we usually use Depends() but keeping it simple for React frontend
    from utils.auth_utils import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = payload.get("sub")
    users_col = get_users_collection()
    db_user = await users_col.find_one({"_id": user_id})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": db_user["_id"],
        "name": db_user["name"],
        "email": db_user["email"],
        "created_at": db_user["created_at"]
    }
