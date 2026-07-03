# Car Specialist GPT 🚗

A local, offline-capable AI chat application specialized in cars. This project consists of a Python FastAPI backend (which interfaces with a local LLM via `llama-server.exe`) and a React/Vite frontend.

## 🌟 Features
- **100% Offline AI:** The backend runs a local LLM model (Llama) directly on your machine. No internet connection is required for generating responses!
- **Dual Response System:** Get two different AI completions for your prompt and choose the best one.
- **Persistent Chat History:** All your chats and preferences are saved locally in MongoDB.
- **Authentication:** Secure user registration and login system.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed on your system:
1. **Node.js** (v18 or higher) for the frontend.
2. **Python** (v3.10 or higher) for the backend.
3. **MongoDB** running locally on default port `27017`.

---

## 🚀 How to Start the Project Manually

You will need to open **two** separate terminal windows: one for the backend and one for the frontend.

### 1. Start the Backend (Terminal 1)
The backend manages the database, authentication, and the local AI model.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   - **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
*The backend will now be running at `http://localhost:8000`. Keep this terminal open.*

### 2. Start the Frontend (Terminal 2)
The frontend is the React user interface.

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. (Optional) If this is your first time or you added packages, install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
*The frontend will now be running (usually at `http://localhost:5173`). Open this link in your browser.*

---

## 🔌 How to Verify it's Running Offline

To prove that the AI and the application run completely offline:
1. **Start the project** using the steps above while connected to the internet.
2. **Turn off your Wi-Fi** or disconnect your ethernet cable.
3. **Open the app** in your browser (`http://localhost:5173`).
4. **Log in** (or register a new account). Your data is being saved to your local MongoDB.
5. **Send a prompt** (e.g., "What are the best SUVs in 2024?").
6. You will see the AI typing out the response in real-time! 

Since the backend communicates with `llama-server.exe` running locally on your hardware, no external API calls (like OpenAI) are made. It is completely private and offline.
