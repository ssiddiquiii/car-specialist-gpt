import os
import requests
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "gemma2-9b-it")

app = FastAPI(title="Car Specialist GPT Backend")

# Allow requests from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Hugging Face Inference Client if token exists
# If not, it will be initialized later when the user sets it up
client = None

# Pydantic models for request body
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Receives chat history from the frontend and sends it to Groq API.
    """
    
    if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your_groq_api_key_here":
        raise HTTPException(status_code=500, detail="Groq API Key is not configured in .env file")

    try:
        hf_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Groq API uses the standard OpenAI chat completions endpoint format
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": hf_messages,
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        response = requests.post(api_url, headers=headers, json=payload)
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"Groq API Error Details: {response.text}")
            raise e
        
        data = response.json()
        reply_content = data["choices"][0]["message"]["content"]
        
        return {"reply": reply_content}

    except Exception as e:
        print(f"Error during API call: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "api_configured": GROQ_API_KEY != "gsk_your_groq_api_key_here"}
