@echo off
title Car Specialist AI - Launcher
echo ===================================================
echo        Starting Car Specialist AI (Local Stack)
echo ===================================================
echo.

echo [1/3] Starting FastAPI Backend on port 8000...
start "Car Specialist Backend" cmd /k "cd backend && call .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/3] Starting React + Vite Frontend on port 5173...
start "Car Specialist Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Opening browser at http://localhost:5173...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo All services are running!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
