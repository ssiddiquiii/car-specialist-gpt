import os
import time
import subprocess
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "gemma-4-e2b-it.Q4_K_M.gguf")
LLAMA_SERVER_PORT = "8080"
LLAMA_SERVER_EXE = os.path.join(os.path.dirname(__file__), "llama-bin", "llama-server.exe")
LOG_FILE_PATH = os.path.join(os.path.dirname(__file__), "llama-server.log")

app = FastAPI(title="Car Specialist GPT Local Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

server_process = None
log_file = None

@app.on_event("startup")
async def startup_event():
    global server_process, log_file
    
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file not found at {MODEL_PATH}")
        return
        
    if not os.path.exists(LLAMA_SERVER_EXE):
        print(f"ERROR: llama-server.exe not found at {LLAMA_SERVER_EXE}")
        return

    print("Starting local llama-server in the background...")
    threads = str(max(1, (os.cpu_count() or 4) - 1))
    
    command = [
        LLAMA_SERVER_EXE,
        "-m", MODEL_PATH,
        "--port", LLAMA_SERVER_PORT,
        "-c", "2048",
        "-t", threads
    ]
    
    log_file = open(LOG_FILE_PATH, "w")
    
    server_process = subprocess.Popen(
        command,
        stdout=log_file,
        stderr=subprocess.STDOUT
    )
    
    print("Waiting for local AI server to initialize (this may take 10-15 seconds)...")
    
    for _ in range(30):
        try:
            # llama.cpp server usually has a simple health endpoint at /health
            res = requests.get(f"http://127.0.0.1:{LLAMA_SERVER_PORT}/health", timeout=1)
            if res.status_code == 200:
                print("Local AI Server is ONLINE and Ready!")
                return
        except requests.exceptions.RequestException:
            pass
        time.sleep(1)
        
    print(f"Warning: Local AI server might still be loading or failed to start. Check {LOG_FILE_PATH} for details.")

@app.on_event("shutdown")
async def shutdown_event():
    global server_process, log_file
    if server_process:
        print("Shutting down local llama-server...")
        server_process.terminate()
        server_process.wait()
    if log_file:
        log_file.close()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not server_process:
        raise HTTPException(status_code=500, detail="Local AI server is not running.")
        
    try:
        hf_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        api_url = f"http://127.0.0.1:{LLAMA_SERVER_PORT}/v1/chat/completions"
        headers = {"Content-Type": "application/json"}
        payload = {
            "messages": hf_messages,
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        print("Sending request to local AI server...")
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        reply_content = data["choices"][0]["message"]["content"]
        
        return {"reply": reply_content}

    except Exception as e:
        print(f"Error calling local AI server: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "ok", 
        "llama_server_running": server_process is not None
    }
