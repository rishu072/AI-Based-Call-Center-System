# 🚀 AI Smart Call Center - Complete Setup & Running Guide

## Quick Start (3 Easy Steps)

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server
```bash
cd backend
python startup.py
```

Wait for this message:
```
🚀 AI SMART CALL CENTER - STARTUP COMPLETE
```

### Step 3: Open Landing Page
Open `frontend/index.html` in your web browser

---

## 📋 Detailed Setup Instructions

### Prerequisites
- **Python 3.8+** - [Download from python.org](https://www.python.org/downloads/)
- **pip** (comes with Python)
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

### Windows Users - Quick Setup

#### Using Batch Files (Easiest)

1. **Start Backend:**
   - Go to `backend` folder
   - Double-click `run_backend.bat`
   - Wait for "STARTUP COMPLETE" message

2. **Open Landing Page:**
   - Go to `frontend` folder
   - Double-click `open_landing_page.bat`
   - Page opens automatically in browser

#### Manual Setup (If batch files don't work)

```bash
# 1. Open Command Prompt (cmd)
# 2. Navigate to backend folder:
cd path\to\backend

# 3. Install dependencies:
pip install -r requirements.txt

# 4. Start server:
python startup.py
```

### Linux/Mac Users

```bash
# 1. Navigate to backend:
cd backend

# 2. Create virtual environment (optional but recommended):
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# Or on Windows: venv\Scripts\activate

# 3. Install dependencies:
pip install -r requirements.txt

# 4. Start backend:
python startup.py

# 5. In another terminal, open frontend:
# Open frontend/index.html in your browser
```

---

## 🔧 System Architecture

### Backend (FastAPI)
- **Port:** 5000
- **URL:** http://localhost:5000
- **Database:** SQLite (complaints.db)
- **Language:** Python 3.8+

### Frontend
- **Type:** HTML/CSS/JavaScript
- **No build required** - Open directly in browser
- **File:** frontend/index.html

### Database
- **Type:** SQLite
- **Location:** backend/complaints.db
- **Tables:** complaints, ward_zone_mapping
- **Auto-initialized** on startup

---

## 📡 API Endpoints

### Health & Info
```
GET  /api/health                    Check if server is running
GET  /api/info                      Get server information
```

### Complaints
```
POST /api/complaints                Create new complaint
GET  /api/complaints                Get all complaints
GET  /api/complaints/{complaint_id} Get specific complaint
GET  /api/complaints/{id}/status    Get complaint status
```

### Statistics
```
GET  /api/complaints/stats/summary  Get complaint statistics
```

### Testing APIs
After starting backend, you can test:
- **In Browser:**
  - Health: http://localhost:5000/api/health
  - API Docs: http://localhost:5000/docs

- **Using curl (Command Prompt/Terminal):**
  ```bash
  # Health check
  curl http://localhost:5000/api/health
  
  # Get all complaints
  curl http://localhost:5000/api/complaints
  ```

---

## 🗄️ Database Connection

### Automatic Initialization
The database is **automatically created** when you start the server:
1. Tables are created
2. Ward-Zone mappings are populated
3. Sample data is loaded

### Database Location
```
backend/complaints.db
```

### Database Tables

#### Complaints Table
```sql
CREATE TABLE complaints (
    complaint_id TEXT PRIMARY KEY,
    complaint_type TEXT,
    house_no TEXT,
    area TEXT,
    ward TEXT,
    zone TEXT,
    description TEXT,
    phone_number TEXT,
    status TEXT,        -- pending, in_progress, resolved, closed, rejected
    priority TEXT,      -- low, normal, high, urgent
    created_at TEXT,
    updated_at TEXT,
    assigned_to TEXT,
    resolution_notes TEXT
)
```

#### Ward-Zone Mapping Table
```sql
CREATE TABLE ward_zone_mapping (
    id INTEGER PRIMARY KEY,
    ward TEXT,
    zone TEXT,
    areas TEXT,         -- Comma-separated area names
    latitude REAL,
    longitude REAL
)
```

---

## 🎯 Features Configuration

### Complaint Types
- Street Light
- Water Supply
- Road Damage
- Garbage
- Drainage
- Other

### Languages Supported
- English (en-US)
- Hindi (hi-IN)
- Gujarati (gu-IN)

### Zones
- North
- South
- East
- West
- Central

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Python not found"**
- Solution: Install Python from https://www.python.org
- Make sure to check "Add Python to PATH" during installation

**Error: "ModuleNotFoundError: No module named 'fastapi'"**
- Solution: Run `pip install -r requirements.txt`

**Error: "Port 5000 already in use"**
- Solution: 
  - Change port in startup.py: `uvicorn.run(app, host="0.0.0.0", port=8000)`
  - Or close other application using port 5000

### Frontend Not Loading Data

**Complaints not showing on landing page:**
1. Check that backend is running (terminal shows "Uvicorn running on http://0.0.0.0:5000")
2. Open browser console (F12) and check for errors
3. Verify http://localhost:5000/api/health returns response

**API Docs not accessible:**
- Visit http://localhost:5000/docs
- If page doesn't load, backend is not running

### Database Issues

**Database locked error:**
- Close all instances of the application
- Delete complaints.db file
- Restart server (it will recreate database)

**No data showing:**
1. Check if complaints.db exists in backend folder
2. Try submitting a new complaint through UI
3. Check database was initialized: Look for "complaints.db" file

---

## 📊 Testing the System

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "healthy", "service": "AI Smart Call Center", "version": "1.0.0"}
```

### 2. Test Complaint Creation
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        complaint_type: 'Street Light',
        area: 'Main Road',
        ward: 'Ward 1',
        zone: 'North',
        description: 'Street light not working',
        phone_number: '9876543210'
    })
})
.then(r => r.json())
.then(d => console.log(d))
```

### 3. Test Landing Page
1. Open http://localhost:5000 in browser (or frontend/index.html locally)
2. Check if statistics are loading
3. Click "Start AI Call" or "Register Complaint" buttons
4. Verify no console errors (F12 to open console)

---

## 📝 File Structure Reference

```
AI-Smart-Call-Center/
├── backend/
│   ├── main.py                      ← Main FastAPI app
│   ├── startup.py                   ← Start server (run this!)
│   ├── models.py                    ← Data models
│   ├── requirements.txt             ← Python dependencies
│   ├── .env                         ← Configuration
│   ├── complaints.db                ← Database (auto-created)
│   ├── routes/
│   │   └── complaint.py             ← API endpoints
│   └── services/
│       ├── database_service.py      ← Database operations
│       ├── complaint_service.py     ← Complaint logic
│       ├── ai_service.py            ← AI processing
│       ├── tts_service.py           ← Text-to-Speech
│       └── ivr_controller.py        ← IVR logic
├── frontend/
│   ├── index.html                   ← Landing page (open this!)
│   ├── complaint.html               ← Complaint form
│   ├── call.html                    ← Voice call interface
│   ├── dashboard.html               ← Admin dashboard
│   ├── css/
│   │   ├── style.css
│   │   └── landing.css
│   └── js/
│       ├── config.js                ← API configuration
│       ├── landing.js               ← Landing page logic
│       ├── api.js                   ← API functions
│       └── ...
└── README.md                        ← Main documentation
```

---

## 🎉 Success Checklist

- [ ] Python 3.8+ installed
- [ ] Dependencies installed (pip install -r requirements.txt)
- [ ] Backend started (python startup.py shows "STARTUP COMPLETE")
- [ ] Landing page opens (frontend/index.html)
- [ ] Statistics display on landing page
- [ ] Can submit a complaint
- [ ] Complaint appears in database
- [ ] Can view complaint status

---

## 📞 Need Help?

1. **Check error messages** - Read backend console output carefully
2. **Check browser console** - Press F12 in browser
3. **Verify ports:**
   - Backend: http://localhost:5000/api/health
   - Database: Check for complaints.db file
4. **Restart everything:**
   - Close all windows
   - Delete complaints.db
   - Run startup again

---

## 🚀 Next Steps

1. ✅ **Backend Running** - You've completed the setup!
2. 📝 Register test complaints through the landing page
3. 📊 View analytics on the dashboard
4. 🎤 Try voice-based complaint registration
5. 📱 Test on different devices

Enjoy using AI Smart Call Center! 🎉
