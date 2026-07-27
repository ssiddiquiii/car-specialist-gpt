# Car Specialist AI

An offline-capable automotive assistant application exploring local Large Language Model (LLM) inference across Web and Mobile platforms with online MongoDB synchronization.

---

## Overview

Car Specialist AI explores on-device AI capabilities for automotive domain queries, such as vehicle diagnostic information, specifications, and maintenance advice. The system operates local AI model inference without external LLM cloud API costs.

The project provides two target interfaces:
- **Web Application:** React + Vite frontend backed by a Python FastAPI server interfacing with `llama-server.exe` and MongoDB Atlas for online account and conversation synchronization.
- **Mobile Application:** Standalone React Native application utilizing `llama.rn` C++ native bindings to execute quantized GGUF models directly on mobile hardware.

---

## Technical Note on Mobile Execution (Expo Go vs Development Builds)

> **Important Architecture Distinction:** Standard **Expo Go** cannot run this mobile application because `llama.rn` relies on custom compiled native C++ binaries (`libllama.so`). 
> 
> To execute the mobile app on Android hardware, you must use either:
> 1. **Standalone Build:** Install the pre-compiled `.apk` file directly on an Android device.
> 2. **Development Build:** Run `npx expo run:android` or use Expo Application Services (EAS Build) to compile native C++ modules.

### How Model Delivery Works on Device
1. Upon first launching the standalone APK or Development Build, the app checks local device storage for model weights.
2. If absent, the app presents the setup screen allowing the user to download the **Google Gemma 2B GGUF weights (~1.68 GB)** directly from HuggingFace storage via background file session.
3. Once downloaded, the C++ engine (`libllama.so`) memory-maps the file in local RAM (~1.5 GB footprint) for offline inference.

---

## Features

- **Local AI Model Inference:** Queries are processed locally on device hardware using quantized GGUF models, eliminating third-party LLM API latency and usage fees.
- **Online Database Synchronization:** When connected online, user accounts, preferences, and conversation logs sync automatically with MongoDB Atlas cloud database.
- **Dual Response Evaluation:** Generates two completions per query using different sampling temperatures (`0.3` for factual responses and `0.6` for descriptive advice) to allow output comparison.
- **Dual Theme Support:** Configurable Light and Dark theme modes tailored for readability.
- **Offline & Online Storage Hybrid:** Mobile app maintains local AsyncStorage for offline sessions, syncing user state with cloud database when online connectivity is available.
- **Background Model Fetching:** Initial model downloads utilize background file sessions on mobile devices.
- **Markdown Rendering:** Formatted text output supporting lists, headings, and code snippets.

---

## Architecture

```mermaid
flowchart TD
    subgraph Web_Stack["Web Application Stack"]
        VITE["React + Vite Frontend"]
        FASTAPI["FastAPI Backend"]
        LLAMA_SERVER["llama-server.exe"]
        
        VITE --> FASTAPI
        FASTAPI --> LLAMA_SERVER
    end

    subgraph Mobile_Stack["Mobile Application Stack (Native C++)"]
        EXPO["React Native (Native Dev Build / APK)"]
        STORE["Zustand + AsyncStorage"]
        LLAMA_RN["llama.rn (libllama.so C++ Engine)"]
        
        EXPO --> STORE
        EXPO --> LLAMA_RN
    end

    subgraph Storage["Cloud Services & Assets"]
        MONGO_ATLAS["MongoDB Atlas (Cloud Sync)"]
        HF["HuggingFace CDN (GGUF Model Weights)"]
    end

    FASTAPI --> MONGO_ATLAS
    STORE -.->|Online Sync| MONGO_ATLAS
    HF --> LLAMA_SERVER
    HF --> LLAMA_RN
```

---

## Mobile Application Setup (`mobile/`)

### Requirements
- Node.js (v18 or higher)
- Android Device / Emulator with USB Debugging enabled (for native development builds) or pre-compiled `.apk`

### Local Development (Native Build)
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run native Android development build (compiles C++ bindings):
   ```bash
   npx expo run:android
   ```

### Standalone Build Compilation (EAS Cloud)
To compile a standalone Android `.apk` binary containing native C++ binaries:
```bash
npx eas-cli build -p android --profile preview
```

---

## Web Application Setup (`backend/` & `frontend/`)

### Requirements
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- `MONGO_URI` configured in `backend/.env` pointing to your MongoDB Atlas cluster

### Running the Web Stack

1. **Backend Server (Terminal 1):**
   ```bash
   cd backend
   .\venv\Scripts\activate   # On Windows
   # source venv/bin/activate # On Mac/Linux
   uvicorn main:app --reload --port 8000
   ```

2. **Frontend App (Terminal 2):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Data Synchronization & Offline Notes

1. **AI Model Inference:** Operates 100% locally on the device CPU once model weights are acquired.
2. **Cloud Database Sync:** When network connectivity is active, user profiles, preference logs, and conversation histories synchronize with MongoDB Atlas. When offline, the mobile app operates continuously using local storage.

---

## Project Status & Copyright

Copyright © Car Specialist AI. All Rights Reserved.
