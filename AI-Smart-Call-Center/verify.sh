#!/bin/bash
# Verification Script - AI Smart Call Center
# Run this to verify all components are ready

echo "=================================="
echo "AI SMART CALL CENTER - VERIFICATION"
echo "=================================="
echo ""

# Check Python
echo "[1] Checking Python..."
if command -v python3 &> /dev/null; then
    python3 --version
    echo "✅ Python 3 found"
elif command -v python &> /dev/null; then
    python --version
    echo "✅ Python found"
else
    echo "❌ Python NOT found - Please install Python 3.8+"
    exit 1
fi

echo ""

# Check backend files
echo "[2] Checking Backend Files..."
cd backend 2>/dev/null
if [ -f "main.py" ]; then
    echo "✅ main.py found"
else
    echo "❌ main.py NOT found"
fi

if [ -f "startup.py" ]; then
    echo "✅ startup.py found"
else
    echo "❌ startup.py NOT found"
fi

if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt found"
else
    echo "❌ requirements.txt NOT found"
fi

if [ -f ".env" ]; then
    echo "✅ .env found"
else
    echo "❌ .env NOT found"
fi

cd ..

echo ""

# Check frontend files
echo "[3] Checking Frontend Files..."
if [ -f "frontend/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html NOT found"
fi

if [ -f "frontend/js/config.js" ]; then
    echo "✅ config.js found"
else
    echo "❌ config.js NOT found"
fi

if [ -f "frontend/js/landing.js" ]; then
    echo "✅ landing.js found"
else
    echo "❌ landing.js NOT found"
fi

echo ""

# Check documentation
echo "[4] Checking Documentation..."
if [ -f "README.md" ]; then
    echo "✅ README.md found"
else
    echo "❌ README.md NOT found"
fi

if [ -f "SETUP_GUIDE.md" ]; then
    echo "✅ SETUP_GUIDE.md found"
else
    echo "❌ SETUP_GUIDE.md NOT found"
fi

if [ -f "QUICK_REFERENCE.md" ]; then
    echo "✅ QUICK_REFERENCE.md found"
else
    echo "❌ QUICK_REFERENCE.md NOT found"
fi

echo ""
echo "=================================="
echo "VERIFICATION COMPLETE"
echo "=================================="
echo ""
echo "To start the system:"
echo "  1. cd backend"
echo "  2. python startup.py"
echo "  3. Open frontend/index.html in browser"
echo ""
