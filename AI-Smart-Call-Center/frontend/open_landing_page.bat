@echo off
REM ============================================================
REM AI Smart Call Center - Frontend Opener
REM Opens the landing page in default browser
REM ============================================================

echo.
echo ============================================================
echo   AI SMART CALL CENTER - OPENING LANDING PAGE
echo ============================================================
echo.

REM Get the directory of this script
cd /d "%~dp0"

REM Build the full path to index.html
set LANDING_PAGE=%CD%\index.html

echo Opening: %LANDING_PAGE%
echo.

REM Check if file exists
if not exist "%LANDING_PAGE%" (
    echo ERROR: index.html not found at %LANDING_PAGE%
    pause
    exit /b 1
)

REM Open the file in default browser
start "" "%LANDING_PAGE%"

echo.
echo [OK] Landing page opened in default browser
echo.
echo Make sure the backend server is running:
echo   - Run run_backend.bat from the backend folder
echo   - Server should be running on http://localhost:5000
echo.
echo Press any key to close this window...
pause >nul
