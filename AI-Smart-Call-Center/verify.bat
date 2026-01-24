@echo off
REM Verification Script - AI Smart Call Center
REM For Windows

echo.
echo ==================================
echo AI SMART CALL CENTER - VERIFICATION
echo ==================================
echo.

REM Check Python
echo [1] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo XX Python NOT found - Please install Python 3.8+
    echo.
    echo Download from: https://www.python.org
    pause
    exit /b 1
) else (
    python --version
    echo [OK] Python found
)

echo.

REM Check backend files
echo [2] Checking Backend Files...
cd backend 2>nul

if exist "main.py" (
    echo [OK] main.py found
) else (
    echo XX main.py NOT found
)

if exist "startup.py" (
    echo [OK] startup.py found
) else (
    echo XX startup.py NOT found
)

if exist "requirements.txt" (
    echo [OK] requirements.txt found
) else (
    echo XX requirements.txt NOT found
)

if exist ".env" (
    echo [OK] .env found
) else (
    echo XX .env NOT found
)

cd ..

echo.

REM Check frontend files
echo [3] Checking Frontend Files...
if exist "frontend\index.html" (
    echo [OK] index.html found
) else (
    echo XX index.html NOT found
)

if exist "frontend\js\config.js" (
    echo [OK] config.js found
) else (
    echo XX config.js NOT found
)

if exist "frontend\js\landing.js" (
    echo [OK] landing.js found
) else (
    echo XX landing.js NOT found
)

echo.

REM Check documentation
echo [4] Checking Documentation...
if exist "README.md" (
    echo [OK] README.md found
) else (
    echo XX README.md NOT found
)

if exist "SETUP_GUIDE.md" (
    echo [OK] SETUP_GUIDE.md found
) else (
    echo XX SETUP_GUIDE.md NOT found
)

if exist "QUICK_REFERENCE.md" (
    echo [OK] QUICK_REFERENCE.md found
) else (
    echo XX QUICK_REFERENCE.md NOT found
)

echo.
echo ==================================
echo VERIFICATION COMPLETE
echo ==================================
echo.
echo To start the system:
echo   1. Open Command Prompt
echo   2. cd backend
echo   3. python startup.py
echo   4. Open frontend\index.html in browser
echo.
pause
