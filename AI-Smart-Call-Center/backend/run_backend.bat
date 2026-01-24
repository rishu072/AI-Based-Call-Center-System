@echo off
REM ============================================================
REM AI Smart Call Center - Backend Server Startup Script
REM For Windows
REM ============================================================

echo.
echo ============================================================
echo   AI SMART CALL CENTER - BACKEND STARTUP
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Change to backend directory
cd /d "%~dp0"
echo [OK] Working directory: %CD%
echo.

REM Check if requirements are installed
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

echo.
echo ============================================================
echo Starting FastAPI Server...
echo ============================================================
echo.
echo Server will start on: http://localhost:5000
echo API Documentation: http://localhost:5000/docs
echo.

REM Start the server
python startup.py

if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start
    pause
    exit /b 1
)

pause
