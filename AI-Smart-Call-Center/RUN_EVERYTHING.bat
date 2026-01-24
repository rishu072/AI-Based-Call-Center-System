@echo off
title AI Smart Call Center - Complete Startup
color 0A

echo.
echo ===============================================
echo    AI SMART CALL CENTER - AUTO STARTUP
echo    Vadodara Nagar Samwad
echo ===============================================
echo.

:: Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set FRONTEND_DIR=%SCRIPT_DIR%frontend

echo [STEP 1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
echo [OK] Python is installed
echo.

echo [STEP 2/5] Checking backend directory...
if not exist "%BACKEND_DIR%" (
    echo [ERROR] Backend directory not found!
    echo Expected: %BACKEND_DIR%
    pause
    exit /b 1
)
echo [OK] Backend directory found
echo.

echo [STEP 3/5] Installing required packages...
echo This may take a few minutes on first run...
echo.
cd /d "%BACKEND_DIR%"
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 python-dotenv==1.0.0 pydantic==2.5.0 python-multipart==0.0.6 gtts==2.5.0 aiofiles==23.2.1 SpeechRecognition==3.10.0 requests==2.31.0 sqlalchemy==2.0.23 --quiet
if errorlevel 1 (
    echo.
    echo [WARNING] Some packages may have had installation issues.
    echo The system will try to start anyway...
    echo.
)
echo [OK] Packages installed/verified
echo.

echo [STEP 4/5] Starting Backend Server...
echo.
echo ===============================================
echo    Backend will start in a new window
echo    DO NOT CLOSE THE BACKEND WINDOW!
echo ===============================================
echo.
timeout /t 2 >nul
start "AI Smart Call Center - Backend Server" cmd /k "cd /d "%BACKEND_DIR%" && python startup.py"

:: Wait for backend to initialize
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 >nul

echo [STEP 5/5] Opening Frontend in Browser...
echo.

:: Open the landing page in default browser
start "" "%FRONTEND_DIR%\index.html"

echo.
echo ===============================================
echo    STARTUP COMPLETE!
echo ===============================================
echo.
echo Your AI Smart Call Center is now running!
echo.
echo Backend Server: http://localhost:5000
echo API Documentation: http://localhost:5000/docs
echo Frontend: Opening in your browser...
echo.
echo IMPORTANT:
echo - Keep the BACKEND window open
echo - Access the system through your browser
echo - Check documentation in HOW_TO_RUN_IN_CMD.md
echo.
echo ===============================================
echo.
echo Press any key to open additional resources...
pause >nul

:: Open API docs
start "" "http://localhost:5000/docs"

echo.
echo API Documentation opened in browser.
echo.
echo To stop the system:
echo 1. Close this window
echo 2. Go to the BACKEND window
echo 3. Press Ctrl+C to stop the server
echo.
echo ===============================================
echo    System Ready for Use!
echo ===============================================
echo.
pause
