import os
import time
import asyncio
import json
import subprocess
import requests as sync_requests
import httpx
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from database import get_preference_collection, close_connection, get_conversations_collection
from models.preference import (
    Message, DualChatRequest, DualChatResponse, SingleResponse,
    PreferenceRequest, PreferenceResponse,
)

from routers import auth, chats

load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "gemma-4-e2b-it.Q4_K_M.gguf")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma-4-e2b-it")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
LLAMA_SERVER_PORT = "8080"
LLAMA_SERVER_EXE = os.path.join(os.path.dirname(__file__), "llama-bin", "llama-server.exe")
LLAMA_API_URL = f"http://127.0.0.1:{LLAMA_SERVER_PORT}/v1/chat/completions"
LOG_FILE_PATH = os.path.join(os.path.dirname(__file__), "llama-server.log")

app = FastAPI(title="Car Specialist GPT — Local Backend (Streaming)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chats.router)

server_process = None
log_file = None


# ── Lifecycle ────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    global server_process, log_file

    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model file not found at {MODEL_PATH}")
        return

    if not os.path.exists(LLAMA_SERVER_EXE):
        print(f"ERROR: llama-server.exe not found at {LLAMA_SERVER_EXE}")
        return

    print("Starting local llama-server in the background (CUDA enabled if available)...")
    threads = str(max(1, (os.cpu_count() or 4) - 1))

    command = [
        LLAMA_SERVER_EXE,
        "-m", MODEL_PATH,
        "--port", LLAMA_SERVER_PORT,
        "-c", "4096",          # Context window
        "-t", threads,
        "--parallel", "2"      # Allow 2 parallel inference slots
    ]

    log_file = open(LOG_FILE_PATH, "w")
    server_process = subprocess.Popen(command, stdout=log_file, stderr=subprocess.STDOUT)

    print("Waiting for local AI server to initialize (this may take 10-15 seconds)...")
    for _ in range(30):
        try:
            res = sync_requests.get(f"http://127.0.0.1:{LLAMA_SERVER_PORT}/health", timeout=1)
            if res.status_code == 200:
                print("Local AI Server is ONLINE and Ready!")
                return
        except sync_requests.exceptions.RequestException:
            pass
        time.sleep(1)

    print(f"Warning: Local AI server may still be loading. Check {LOG_FILE_PATH}.")


@app.on_event("shutdown")
async def shutdown_event():
    global server_process, log_file
    if server_process:
        print("Shutting down local llama-server...")
        server_process.terminate()
        server_process.wait()
    if log_file:
        log_file.close()
    await close_connection()


# ── Helper: stream async LLM call ────────────────────────────────────────────

async def stream_llm(client: httpx.AsyncClient, messages: list, temperature: float, queue: asyncio.Queue, stream_id: str):
    """
    Fire one async request with `stream=True` to llama-server.
    Reads SSE chunks and puts them into the shared queue.
    """
    payload = {
        "messages": messages,
        "max_tokens": 2000,
        "temperature": temperature,
        "stream": True
    }
    
    start_time = time.monotonic()
    token_count = 0

    try:
        async with client.stream('POST', LLAMA_API_URL, json=payload, timeout=200.0) as response:
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break
                    
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0]["delta"]
                        
                        # Gemma-4 might stream via content or reasoning_content
                        content_piece = delta.get("content", "") or delta.get("reasoning_content", "")
                        
                        if content_piece:
                            token_count += 1
                            await queue.put({
                                "type": stream_id,
                                "chunk": content_piece
                            })
                    except json.JSONDecodeError:
                        pass
        
        elapsed_ms = (time.monotonic() - start_time) * 1000
        # Send a "done" message for this stream with metadata
        await queue.put({
            "type": f"{stream_id}_done",
            "metadata": {
                "token_count": token_count,
                "latency_ms": round(elapsed_ms, 1)
            }
        })

    except Exception as e:
        print(f"Error in stream {stream_id}: {e}")
        await queue.put({
            "type": stream_id,
            "chunk": f"\n\n[Error: Connection failed: {e}]"
        })
        await queue.put({"type": f"{stream_id}_done", "metadata": {"token_count": 0, "latency_ms": 0}})


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/chat/dual")
async def dual_chat_endpoint(request: Request):
    """
    Streams two LLM calls in parallel.
    Uses Server-Sent Events (SSE) to send mixed chunks back to the client.
    """
    if not server_process:
        raise HTTPException(status_code=503, detail="Local AI server is not running.")

    body = await request.json()
    api_messages = body.get("messages", [])
    
    prompt = next(
        (m["content"] for m in reversed(api_messages) if m.get("role") == "user"),
        ""
    )
    conv_id = body.get("conversation_id", "anon")
    user_id = body.get("user_id", "anon")

    async def sse_generator():
        queue = asyncio.Queue()
        
        # Initial payload so frontend knows prompt + IDs
        init_data = json.dumps({
            "type": "init", 
            "prompt": prompt, 
            "conversation_id": conv_id, 
            "user_id": user_id
        })
        yield f"data: {init_data}\n\n"

        async with httpx.AsyncClient() as client:
            # Fire both tasks in the background
            task_a = asyncio.create_task(stream_llm(client, api_messages, 0.7, queue, "stream_a"))
            task_b = asyncio.create_task(stream_llm(client, api_messages, 0.95, queue, "stream_b"))
            
            done_count = 0
            
            while done_count < 2:
                msg = await queue.get()
                
                if msg["type"] in ("stream_a_done", "stream_b_done"):
                    done_count += 1
                
                # Send SSE chunk to client
                yield f"data: {json.dumps(msg)}\n\n"
                
                if done_count == 2:
                    break

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@app.post("/api/preference", response_model=PreferenceResponse)
async def save_preference(request: PreferenceRequest):
    """
    Save the user's preference (chosen response) to MongoDB.
    Returns the chosen content so frontend can display it.
    """
    chosen_content = (
        request.response_a.content if request.chosen == "a"
        else request.response_b.content if request.chosen == "b"
        else request.response_a.content  # default for "skipped"
    )

    from utils.auth_utils import decode_access_token
    real_user_id = request.user_id
    if request.user_id and request.user_id.count('.') == 2:
        payload = decode_access_token(request.user_id)
        if payload and "sub" in payload:
            real_user_id = payload["sub"]

    log_doc = {
        "conversation_id": request.conversation_id,
        "user_id": real_user_id,
        "prompt": request.prompt,
        "context": [{"role": m.role, "content": m.content} for m in request.context],
        "response_a": request.response_a.model_dump(),
        "response_b": request.response_b.model_dump(),
        "chosen": request.chosen,
        "chosen_content": chosen_content,
        "chosen_at": datetime.now(timezone.utc),
        "metadata": {
            "model_name": MODEL_NAME,
            "app_version": APP_VERSION,
            "created_at": datetime.now(timezone.utc),
        },
    }

    try:
        collection = get_preference_collection()
        result = await collection.insert_one(log_doc)
        log_id = str(result.inserted_id)
        print(f"Preference saved → MongoDB _id: {log_id} | chosen: {request.chosen}")
        
        # Now also append the chosen response to the conversation's message history
        if request.conversation_id:
            conv_col = get_conversations_collection()
            now_str = datetime.now(timezone.utc).isoformat()
            msg_doc = {
                "role": "assistant",
                "content": chosen_content,
                "timestamp": now_str
            }
            await conv_col.update_one(
                {"_id": request.conversation_id},
                {
                    "$push": {"messages": msg_doc},
                    "$set": {"updated_at": now_str}
                }
            )
            print(f"Appended assistant response to conversation {request.conversation_id}")
            
    except Exception as e:
        print(f"Warning: Failed to save preference/history to MongoDB: {e}")
        log_id = "db_unavailable"

    return PreferenceResponse(
        saved=log_id != "db_unavailable",
        log_id=log_id,
        chosen_content=chosen_content,
    )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "llama_server_running": server_process is not None,
    }
