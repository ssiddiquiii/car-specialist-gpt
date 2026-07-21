# 📱 Car Specialist GPT - Standalone Android Mobile App (Expo + On-Device LLM)

**Document Version:** 3.0 (Final Architecture & Tech Spec)  
**Target Platform:** Android First (`.apk` / `.aab`) — *(iOS deferred to Phase 2)*  
**Primary Tech Stack:** Expo (SDK 51+) + React Native + `react-native-llama` (C++ Engine) + EAS Cloud Build  
**Zero PC Dependencies:** **NO Android Studio or NDK required on local developer machine.**

---

## Executive Summary

This report establishes the final, production-ready architecture for building the **Car Specialist GPT Standalone Android Mobile Application**. 

By leveraging **Expo (SDK 51+)** combined with **EAS Cloud Build** and native C++ `llama.cpp` bindings (`react-native-llama`), we achieve:
1. **100% Offline AI Execution:** On-device GGUF LLM inference (Gemma-2B / Llama-3.2-1B) running on Android ARM64 CPU/GPU.
2. **Zero PC Overhead:** All C++ NDK compilation and APK generation are offloaded to Expo Cloud Servers. No Android Studio required.
3. **On-Demand Model Download:** Lightweight initial APK download (~30MB) with an in-app setup wizard to download the ~1.6GB GGUF model over WiFi.
4. **High Code Reusability:** Reuses Zustand stores, prompts, and business logic from the existing React web application.

---

## 1. Complete Package & Tooling Stack

| Layer | Package / Tool | Purpose & Justification |
| :--- | :--- | :--- |
| **Framework Core** | `expo` (SDK 51+) | Core React Native framework with zero local SDK requirements. |
| **AI LLM Engine** | `react-native-llama` (`llama.rn`) | C++ `llama.cpp` wrapper providing native ARM64 NEON GPU/CPU inference. |
| **Cloud Build Tool** | `eas-cli` | Builds standalone `.apk` & `.aab` files on Expo Cloud Servers. |
| **On-Demand Downloader** | `expo-file-system` | Downloads the ~1.6GB GGUF model with progress events (MB/s, %, time remaining) & resume support. |
| **Local Database** | `expo-sqlite` | Offline-first local database for chat history, settings, and model metadata. |
| **State Management** | `zustand` | Reused directly from existing React web application. |
| **Network Monitor** | `expo-network` | Detects WiFi/Cellular connectivity to trigger background MongoDB cloud sync. |
| **UI & Styling** | `react-native` + Custom Styles | Matches the sleek dark/light theme of the current web app. |
| **Markdown Renderer** | `react-native-markdown-display` | Renders dual AI responses, bold text, bullet points, and code blocks smoothly. |

---

## 2. Android Hardware & Model Selection (Android Scope)

Android phones vary significantly in RAM. Our app dynamically selects or suggests the appropriate model based on device specs:

| Device Category | RAM | Recommended Model GGUF | File Size | Tokens/Sec | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High-End Android** | 8GB - 12GB+ | Gemma-2B-IT (Q4_K_M) | ~1.6 GB | **20 - 30 t/s** | 🔥 Super Fast |
| **Mid-Range Android** | 6GB | Gemma-2B-IT (Q4_K_M) | ~1.6 GB | **10 - 18 t/s** | ✅ Very Smooth |
| **Budget Android** | 4GB | Llama-3.2-1B-Instruct (Q4_K_M) | ~0.9 GB | **6 - 12 t/s** | ⚡ Good Performance |
| **Under 4GB RAM** | < 4GB | Not Recommended | - | - | OOM Alert shown |

---

## 3. End-to-End System Architecture (Android App Flow)

```
+-------------------------------------------------------------------------+
|                    STANDALONE ANDROID APP (.APK)                        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                   React Native UI (Expo App)                      |  |
|  |  - Chat Screen           - Model Setup & Download Screen          |  |
|  |  - Dual Response Cards   - RAM & Storage Compatibility Check      |  |
|  +-------------------------------------------------------------------+  |
|                                    | (Native JSI Bridge)                |
|  +-------------------------------------------------------------------+  |
|  |               Expo Native Core & C++ Engine Bindings              |  |
|  |  - expo-file-system Downloader (Pause/Resume + SHA256 Check)     |  |
|  |  - react-native-llama (C++ llama.cpp on ARM64 CPU/GPU)            |  |
|  |  - expo-sqlite (Local Chat History & Preferences)                 |  |
|  +-------------------------------------------------------------------+  |
|                                    |                                    |
|             +----------------------+----------------------+             |
|             | (In-Memory Direct C++ Binding)              | (Disk I/O)  |
|             v                                             v             |
|  +-----------------------+                    +----------------------+  |
|  |  On-Device LLM Engine |                    | App Internal Directory|  |
|  |  (100% Offline AI)    |                    |  - models/gemma.gguf |  |
|  |  - 0% Internet Needed |                    |  - local_chat.db     |  |
|  +-----------------------+                    +----------------------+  |
+-------------------------------------------------------------------------+
                                    | (When Online)
                                    v
                         +---------------------+
                         | MongoDB Atlas Cloud |
                         | (RLHF Dataset Sync) |
                         +---------------------+
```

---

## 4. User Journey: First Run to Offline Chatting

```
1. INSTALLATION
   User installs lightweight Car Specialist GPT APK (~30MB) from link or QR Code.

2. FIRST LAUNCH (Model Setup Wizard)
   App opens -> Checks internal storage for model file.
   - If NOT found: Shows Setup Screen with System Hardware Info (Detected RAM & Free Disk Space).
   - Prompts user: "Download Gemma-2B Model (1.6GB over WiFi)".

3. IN-APP RESILIENT DOWNLOAD
   - Downloads file chunk-by-chunk using `expo-file-system`.
   - Displays real-time progress bar, speed (MB/s), time remaining, and Pause/Resume button.
   - Performs SHA256 integrity check upon completion.

4. 100% OFFLINE INFERENCE READY
   - `react-native-llama` loads model GGUF into app memory.
   - User can turn off WiFi / Mobile Data / Airplane Mode.
   - Chatting and Dual Response generation works 100% on-device!

5. CLOUD RLHF SYNC (Background)
   - When user connects back to WiFi, `expo-network` triggers a background worker.
   - Syncs user A vs B preferences to MongoDB Atlas Cloud for future fine-tuning.
```

---

## 5. Implementation Steps & Milestones

```
STEP 1: Expo Project Initialization (Folder: mobile/)
├── Run `npx create-expo-app mobile`
├── Configure `app.json` with Expo Plugins
└── Install expo-file-system, expo-sqlite, expo-network, react-native-llama, zustand

STEP 2: Core LLM Engine & Downloader Service
├── Build Model Downloader module with progress callbacks & checksum validation
└── Create `LlamaService.js` to manage llama.cpp lifecycle (init, stream, release memory)

STEP 3: UI Development & Component Porting
├── Build Model Setup / Download Wizard screen
├── Port Chat UI, Chat Messages, and Dual Response comparison cards
└── Integrate Zustand mobile store with local `expo-sqlite` database

STEP 4: EAS Build Configuration & APK Generation
├── Configure `eas.json` for Android APK generation
├── Run `eas build --platform android --profile preview`
└── Download & Test APK on physical Android smartphones
```

---

## 6. Final Verdict & Approval Checklist

- **Target OS:** Android (API Level 29+ / Android 10+).
- **Development Tool:** VS Code + Expo CLI + EAS Cloud Build.
- **Local Tooling Required:** **NONE** (No Android Studio, No NDK, No Java SDK needed on developer laptop).
- **User Download Size:** ~30MB APK initial + ~1.6GB GGUF model inside app setup screen.
- **Offline Capability:** **100% On-Device Offline AI.**

> **Status:** Architecture Approved & Ready for Step 1 Project Initialization.
