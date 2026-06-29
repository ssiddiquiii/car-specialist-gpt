import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# Try to import Llama, but handle case where it might not be installed yet
try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False

# Load environment variables
load_dotenv()

# We will look for the .gguf file in the current directory or from .env
# The default name matches Unsloth's default GGUF export for Gemma 2B
MODEL_PATH = os.getenv("MODEL_PATH", "car_specialist_gemma2b-unsloth.Q4_K_M.gguf")

app = FastAPI(title="Car Specialist GPT Local Backend")

# Allow requests from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the model at startup
llm = None

@app.on_event("startup")
async def startup_event():
    global llm
    if not LLAMA_CPP_AVAILABLE:
        print("Warning: llama-cpp-python is not installed. Please install it to use the local model.")
        return
        
    if os.path.exists(MODEL_PATH):
        print(f"Loading local model from {MODEL_PATH}...")
        try:
            llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=2048, # Context window size
                n_threads=max(1, (os.cpu_count() or 4) - 1), # Leave 1 core for OS
                verbose=False, # Set to True for debugging
                chat_format="gemma" # Use Gemma chat template
            )
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Failed to load model: {e}")
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}. Please place the .gguf file in the backend folder.")

# Pydantic models for request body
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Receives chat history from the frontend and generates a local response using llama-cpp-python.
    """
    if not LLAMA_CPP_AVAILABLE:
        raise HTTPException(status_code=500, detail="llama-cpp-python is not installed. Check server logs.")
        
    if llm is None:
        raise HTTPException(
            status_code=500, 
            detail=f"Model not loaded. Please ensure '{MODEL_PATH}' exists in the backend folder and restart the server."
        )

    try:
        # Format messages for llama_cpp
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        print(f"Generating local response for query: {messages[-1]['content'][:50]}...")
        
        # Generate response using the built-in chat completion
        output = llm.create_chat_completion(
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        
        reply_content = output["choices"][0]["message"]["content"].strip()
        
        return {"reply": reply_content}

    except Exception as e:
        print(f"Error during local inference: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "llama_installed": LLAMA_CPP_AVAILABLE,
        "model_loaded": llm is not None,
        "model_path": MODEL_PATH
    }
