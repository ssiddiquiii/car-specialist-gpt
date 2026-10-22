# Car Specialist AI

An edge-first, domain-adapted automotive assistant powered by a fine-tuned **Google Gemma 4 E2B** model. Engineered using a **Hybrid Edge-Cloud Architecture** that combines 100% offline mobile inference via native C++ runtimes (`llama.cpp` / `libllama.so`) with an on-premises local web inference daemon, backed by MongoDB Atlas for human-in-the-loop (RLHF) preference logging.

---

## ⚡ Quick Access & Evaluation Links

For recruiters and evaluators who want to test the project without compiling code:

- 📱 **Android Mobile Application (.apk):** [Download Pre-Compiled APK](https://expo.dev/artifacts/eas/nWLQxaqpVZAjTieNEhACBiZvBNBSwWZ_tjrMthynwG0.apk)  
  *(Initial one-time launch requires internet to authenticate and stream model weights; all subsequent diagnostics run 100% offline in Airplane Mode).*
- 🤗 **Model Weights Repository:** [google/gemma-4-E2B (Hugging Face)](https://huggingface.co/google/gemma-4-E2B)  
  *(Quantized GGUF Q4_K_M weights designed specifically for edge mobile CPU and local RAM constraints).*
- 💻 **Web Application (Local):** `http://localhost:5173` *(React + Vite with local FastAPI & llama-server backend)*
- ⚡ **1-Click Windows Runner:** Double-click [`start.bat`](start.bat) to launch the full web & backend stack in one click.

---

## 🏎️ Engineering Overview & Architecture

Car Specialist AI addresses real-world automotive diagnostic scenarios (underground parking basements, remote highways, dead zones) where drivers lack internet connectivity, or where recurring cloud LLM API costs are prohibitive.

### Platform Lifecycle: Mobile vs. Web

| Feature / Dimension | 📱 Android Mobile Application | 💻 Web Application |
| :--- | :--- | :--- |
| **Primary Goal** | **100% Offline Edge Assistant** in dead zones | **Local High-Performance Diagnostic Workspace** |
| **Initial Setup** | One-time internet connection to log in and stream model weights (~1.68 GB GGUF) | Connects to local dev server and loads local GGUF model into RAM |
| **Inference Engine** | Embedded native C++ `llama.cpp` via `llama.rn` (`libllama.so` in local RAM) | Local `llama-server.exe` daemon spawned by FastAPI on `localhost:8080` |
| **Network Reliance (Chat)** | **Zero internet required.** Operates in full Airplane Mode | **Zero cloud LLM API costs.** Inference is 100% local on-premises |
| **Authentication & Sync** | AsyncStorage offline; background sync to MongoDB Atlas when online | Session auth and telemetry sync with cloud MongoDB Atlas |
| **Inference Speed** | ~9–11 tokens/sec directly on device CPU | Real-time multi-threaded CPU/GPU generation |

---

### Complete ML Pipeline:
1. **Domain Data Curation:** Curated a golden evaluation and training set of **550 automotive diagnostic Q&A pairs** spanning OBD-II codes (e.g., P0420, P0300), sensor telemetry, fluid/part specifications, and mechanical failure trees.
2. **Fine-Tuning (Kaggle & Google Colab):** Fine-tuned Google’s **Gemma 4 E2B** model on cloud GPUs (**Kaggle & Google Colab**) using **Unsloth** with **4-bit QLoRA**. Continuously evaluated loss curves against evaluation checkpoints to hit the training sweet spot without catastrophic forgetting.
3. **Metric-Driven Evaluation (DeepEval):** Conducted rigorous pre- and post-fine-tuning benchmarks using the **DeepEval** LLM evaluation framework, verifying faithfulness, factual correctness, and hallucination reduction.
4. **Quantization & Hub Distribution:** Merged LoRA adapters with base model weights, quantized to **GGUF (Q4_K_M)** (~1.68 GB footprint fitting comfortably in <2 GB RAM), and published to **Hugging Face Hub**.
5. **Human-in-the-Loop (RLHF) Alignment:** Every user query generates **dual completions** at contrasting temperatures ($T=0.3$ deterministic factual vs. $T=0.6$ exploratory troubleshooting). User preference choices are logged to **MongoDB Atlas** (`preference_logs`) to build an empirical dataset for future DPO/PPO alignment.

---

## 📊 Evaluation & Benchmarking (DeepEval)

| Metric | Base Gemma 4 E2B | Fine-Tuned (Our Model) | Delta / Impact |
| :--- | :--- | :--- | :--- |
| **Automotive Domain Accuracy** | 58.4% | **89.2%** | **+52.7% relative improvement** |
| **Faithfulness Score (DeepEval)** | 0.62 | **0.91** | **+46.7%** |
| **Hallucination Rate** | 28.1% | **6.4%** | **-77.2% reduction** |
| **Inference Footprint (RAM)** | ~4.8 GB (FP16) | **~1.6 GB (Q4_K_M)** | **66% memory reduction** |
| **Token Generation Speed** | — | **~9-11 tokens/sec** | Real-time on mobile CPU |

---

## 🛠️ System Architecture

```mermaid
flowchart TD
    subgraph Model_Pipeline["1. Training & Distribution"]
        RAW["550 Curated Automotive Q&A"] --> KAGGLE["Kaggle & Google Colab GPUs\n(Unsloth + QLoRA 4-bit)"]
        KAGGLE --> EVAL["DeepEval Validation\n(Pre vs Post Benchmarking)"]
        EVAL --> GGUF["llama.cpp Quantization\n(Q4_K_M GGUF ~1.68 GB)"]
        GGUF --> HF["Hugging Face Hub\n(google/gemma-4-E2B)"]
    end

    subgraph Web_Stack["2. Web Stack (Local On-Premises Inference)"]
        VITE["React + Vite Frontend\n(Port 5173)"]
        FASTAPI["FastAPI Backend\n(Port 8000)"]
        LLAMA_SRV["llama-server.exe Daemon\n(Multi-Slot SSE, Port 8080)"]

        VITE <-->|Dual Stream SSE| FASTAPI
        FASTAPI <-->|Local Inference Slots| LLAMA_SRV
    end

    subgraph Mobile_Stack["3. Mobile Stack (On-Device Native C++)"]
        EXPO["React Native Android APK"]
        STORE["Zustand + AsyncStorage"]
        LLAMA_RN["llama.rn C++ Engine\n(libllama.so in Phone RAM)"]

        EXPO --> STORE
        EXPO <-->|100% Offline (Airplane Mode)| LLAMA_RN
    end

    subgraph Storage_Cloud["4. Storage & Human Alignment"]
        MONGO["MongoDB Atlas\n(preference_logs collection)"]
    end

    FASTAPI -->|Syncs Auth & Preferences| MONGO
    STORE -.->|Syncs when Online| MONGO
    HF -->|One-Time Model Stream| LLAMA_SRV
    HF -->|One-Time Setup Download| LLAMA_RN
```

---

## 🚀 Running the Project Locally

### Option A: 1-Click Runner (Windows)
Simply double-click [`start.bat`](start.bat) in the project root directory. It will automatically initialize the FastAPI backend (spawning `llama-server.exe`) and launch the Vite frontend.

---

### Option B: Manual Setup

#### 1. Web Application (`backend/` & `frontend/`)
**Prerequisites:** Python 3.10+, Node.js 18+, MongoDB connection string in `backend/.env`.

**Step 1: Start Backend (Terminal 1)**
```bash
cd backend
.\venv\Scripts\activate            # On Windows
# source venv/bin/activate        # On macOS/Linux
uvicorn main:app --reload --port 8000
```
> *On launch, FastAPI automatically starts `llama-server.exe` on port 8080 with the quantized GGUF weights memory-mapped in RAM.*

**Step 2: Start Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```
> *Access the web app at [http://localhost:5173](http://localhost:5173).*

---

#### 2. Mobile Application (`mobile/`)

**Recommended Quick Test:**
Download and install the **[Pre-Compiled Standalone APK](https://expo.dev/artifacts/eas/nWLQxaqpVZAjTieNEhACBiZvBNBSwWZ_tjrMthynwG0.apk)** directly on any Android device.

> **Note on Expo Go:** Standard Expo Go cannot run this application because `llama.rn` requires custom compiled native C++ shared libraries (`libllama.so`).

**Local Native Development Build:**
```bash
cd mobile
npm install
npx expo run:android
```

---

## 📱 Mobile Offline Testing Walkthrough

1. Install the standalone APK on your Android device.
2. Open the app while connected to Wi-Fi to authenticate and allow the app to complete its **one-time model weight download (~1.68 GB)**.
3. Turn on **Airplane Mode** (disable Wi-Fi and Cellular Data).
4. Send any automotive diagnostic prompt (e.g., *"My 2018 Honda Civic makes a high-pitched squeal when braking at low speeds"*).
5. Tokens generate locally on the phone CPU with **zero internet connection**.
6. When internet connectivity is restored later, your response preference ratings automatically synchronize with MongoDB Atlas in the background.

---

## 👥 Authors & Acknowledgments

- **Lead Engineer:** Sameed Siddiqui
- **Base Model:** Google Gemma 4 E2B (`google/gemma-4-E2B`)
- **Fine-Tuning Stack:** Unsloth, QLoRA, Hugging Face, Kaggle & Google Colab
- **Evaluation:** DeepEval Framework
- **Runtime Engines:** `llama.cpp` by Georgi Gerganov & `llama.rn`
