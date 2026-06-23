# Host Your Fine-Tuned Model on Kaggle (Updated with Unsloth)

Ye error is wajah se aaya kyunke aapne training mein **Unsloth** ka special model (`gemma-4-E2B-it` ya `gemma2`) use kiya tha jo normal `transformers` library ki purani version nahi samajh pa rahi thi. 

Is maslay ko hal karne ke liye hum model ko **Unsloth** ke zariye hi load karenge! Iska faida ye hai ke ye double speed par chalega aur 4-bit mein hone ki wajah se Kaggle ka GPU crash nahi hoga.

Apni Hosting wali notebook ka purana code mita dein aur ye naya code paste kar ke chalayen:

```python
# 1. Install Unsloth and API requirements
!pip install -q fastapi uvicorn pyngrok nest_asyncio
!pip install -q -U unsloth
!pip install -q -U "unsloth[kaggle-new] @ git+https://github.com/unslothai/unsloth.git"

import nest_asyncio
import uvicorn
from pyngrok import ngrok
from fastapi import FastAPI, Request
from unsloth import FastModel
import torch
import warnings

warnings.filterwarnings("ignore")

# 2. Ngrok Setup (Using Kaggle Secrets for Security)
from kaggle_secrets import UserSecretsClient

try:
    user_secrets = UserSecretsClient()
    NGROK_AUTH_TOKEN = user_secrets.get_secret("NGROK_AUTH_TOKEN")
except Exception as e:
    print("⚠️ Please add NGROK_AUTH_TOKEN to your Kaggle Secrets!")
    NGROK_AUTH_TOKEN = "YOUR_FALLBACK_TOKEN"

ngrok.set_auth_token(NGROK_AUTH_TOKEN)

# 3. Load Your Custom Model via Unsloth
print("Loading model via Unsloth... (this may take a minute)")
model_id = "ssiddiquii/merged-car-specialist-gemma" 

model, tokenizer = FastModel.from_pretrained(
    model_name=model_id,
    load_in_4bit=True,   # Saves VRAM and runs faster on Kaggle
    dtype=torch.float16,
)
FastModel.for_inference(model) # Enable 2x faster inference
print("Model loaded successfully!")

# 4. Create FastAPI Server
app = FastAPI()

@app.post("/v1/chat/completions")
async def chat_endpoint(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    
    # Format messages for the model
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([prompt], return_tensors="pt").to("cuda")
    
    # Generate answer
    outputs = model.generate(**inputs, max_new_tokens=500, use_cache=True, temperature=0.7, do_sample=True)
    generated_text = tokenizer.batch_decode(outputs)[0]
    
    # Extract only the assistant's response (remove the prompt text)
    response_text = generated_text.replace(prompt, "").replace("<eos>", "").replace("<|end_of_text|>", "").strip()
    
    return {
        "choices": [{"message": {"role": "assistant", "content": response_text}}]
    }

# 5. Expose Server to the Internet
public_url = ngrok.connect(8000).public_url
print("="*60)
print(f"🚀 COPY THIS LINK TO YOUR .ENV FILE:")
print(f"API_URL={public_url}/v1/chat/completions")
print("="*60)

# 6. Start the Server in the background (Fixes asyncio RuntimeError)
import threading

def run_server():
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Start server in a separate thread so it doesn't block the notebook
server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()

print("✅ Server is running in the background!")
# Do not close the browser tab to keep the server alive.
```

## Next Step
Jab ye code chal jaye aur output mein `🚀 COPY THIS LINK TO YOUR .ENV FILE:` aaye, toh us link ko copy kar ke apne local PC ki `backend/.env` file mein daal dijiyega. Aur phir local frontend se test kijiye ga!
