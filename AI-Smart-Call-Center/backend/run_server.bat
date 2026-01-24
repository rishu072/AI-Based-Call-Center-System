@echo off
echo ========================================
echo AI Smart Call Center - Startup Script
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting FastAPI Server...
echo ========================================
echo.
echo API will be available at: http://localhost:5000
echo Documentation: http://localhost:5000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
