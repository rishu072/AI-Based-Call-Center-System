# 🎯 COMPLETE STEPS TO RUN YOUR AI SMART CALL CENTER

## 📌 SUMMARY

You have **TWO WAYS** to run your system:
1. **AUTOMATIC** - Double-click `RUN_EVERYTHING.bat` (Recommended)
2. **MANUAL** - Follow CMD steps below

---

## 🚀 METHOD 1: AUTOMATIC (EASIEST - RECOMMENDED)

### ✅ Just ONE Double-Click!

1. Navigate to your project folder:
   ```
   c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center
   ```

2. **Double-click this file:**
   ```
   RUN_EVERYTHING.bat
   ```

3. **Wait 30 seconds** - The script will:
   - ✅ Check Python installation
   - ✅ Install all required packages
   - ✅ Start backend server (new window)
   - ✅ Open frontend in your browser
   - ✅ Open API documentation

4. **DONE!** Your system is running!

---

## 📝 METHOD 2: MANUAL (STEP-BY-STEP CMD)

### STEP 1️⃣: Open Command Prompt

1. Press `Windows + R` on keyboard
2. Type: `cmd`
3. Press `Enter`

---

### STEP 2️⃣: Navigate to Backend Directory

Copy and paste this command:

```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\backend"
```

Press `Enter`

---

### STEP 3️⃣: Install Required Packages (First Time Only)

Copy and paste this command:

```cmd
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 python-dotenv==1.0.0 pydantic==2.5.0 python-multipart==0.0.6 gtts==2.5.0 aiofiles==23.2.1 SpeechRecognition==3.10.0 requests==2.31.0 sqlalchemy==2.0.23
```

Press `Enter`

**Wait 2-3 minutes** for installation to complete.

---

### STEP 4️⃣: Start the Backend Server

Type this command:

```cmd
python startup.py
```

Press `Enter`

**You should see:**
```
🚀 STARTING AI SMART CALL CENTER SYSTEM...
✅ Environment loaded
✅ Database initialized
✅ Tables created/verified
✅ Sample data inserted
✅ All routes loaded

🎯 STARTUP COMPLETE - SYSTEM READY!

📡 Server running at:
   → http://localhost:5000
   → API Docs: http://localhost:5000/docs
```

**✅ SUCCESS!** Backend is running!

**⚠️ IMPORTANT:** Keep this CMD window OPEN!

---

### STEP 5️⃣: Open the Frontend

**Option A: Direct File Opening (Easiest)**

1. Open File Explorer
2. Navigate to:
   ```
   c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\frontend
   ```
3. **Double-click:** `index.html`

**Option B: Using CMD**

1. Open a NEW CMD window (Windows + R → cmd)
2. Type:
   ```cmd
   cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\frontend"
   start index.html
   ```
3. Press `Enter`

---

## ✅ VERIFY SYSTEM IS WORKING

After starting, check these:

### ✔️ Backend Verification:

Open browser and visit:
```
http://localhost:5000/api/health
```

**Expected:** You should see:
```json
{
  "status": "healthy",
  "message": "AI Smart Call Center API is running"
}
```

### ✔️ API Documentation:

Open browser and visit:
```
http://localhost:5000/docs
```

**Expected:** Interactive API documentation page (Swagger UI)

### ✔️ Frontend Landing Page:

The `index.html` should show:
- ✅ Vadodara Nagar Samwad title
- ✅ Statistics (Total Complaints, Pending, Resolved, etc.)
- ✅ "Register Complaint" button
- ✅ Recent complaints list

### ✔️ Submit Test Complaint:

1. Click "Register Complaint"
2. Fill in test data
3. Submit
4. Should see success message with complaint ID

---

## 🌐 ALL AVAILABLE PAGES

Once running, you can access:

| Page | How to Access |
|------|---------------|
| **Landing Page** | frontend/index.html |
| **Register Complaint** | Click button on landing page |
| **Dashboard** | frontend/dashboard.html |
| **Admin Panel** | frontend/admin/admin-panel.html |
| **API Health** | http://localhost:5000/api/health |
| **API Docs** | http://localhost:5000/docs |
| **All Complaints** | http://localhost:5000/api/complaints |

---

## 🛑 HOW TO STOP THE SYSTEM

### Stop Backend Server:

1. Go to the CMD window running the backend
2. Press `Ctrl + C` on keyboard
3. Type `Y` if asked
4. Press `Enter`

### Close Frontend:

Just close your browser tabs

---

## 🔧 TROUBLESHOOTING

### ❌ Problem: "python is not recognized"

**Solution:**
1. Download Python from: https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart CMD
4. Try again

---

### ❌ Problem: "Port 5000 is already in use"

**Solution:**
1. Close any other programs
2. Or edit `backend/.env` to change port:
   ```
   PORT=8000
   ```
3. Restart backend

---

### ❌ Problem: "Statistics not loading on landing page"

**Solution:**
1. Verify backend is running (check CMD window)
2. Check http://localhost:5000/api/health works
3. Press `Ctrl + Shift + R` in browser (hard refresh)
4. Press F12 in browser, check Console tab for errors

---

### ❌ Problem: "Module not found" errors

**Solution:**
```cmd
cd backend
pip install -r requirements.txt
```

---

### ❌ Problem: Database errors

**Solution:**
1. Stop the backend (Ctrl + C)
2. Delete file: `backend/complaints.db`
3. Start backend again: `python startup.py`
4. Database will be recreated automatically

---

## 📂 PROJECT STRUCTURE

```
AI-Smart-Call-Center/
│
├── RUN_EVERYTHING.bat          ← DOUBLE-CLICK THIS (Automatic start)
├── HOW_TO_RUN_IN_CMD.md        ← Detailed guide (this file in detail)
├── QUICK_START_CARD.txt        ← Quick reference
│
├── backend/
│   ├── startup.py              ← Start server with this
│   ├── main.py                 ← FastAPI application
│   ├── requirements.txt        ← Python dependencies
│   ├── .env                    ← Configuration
│   ├── complaints.db           ← Database (auto-created)
│   └── ...
│
├── frontend/
│   ├── index.html              ← Landing page - OPEN THIS
│   ├── complaint.html          ← Complaint form
│   ├── dashboard.html          ← Admin dashboard
│   ├── admin/
│   │   ├── admin-login.html
│   │   └── admin-panel.html
│   ├── js/
│   │   ├── config.js           ← API configuration
│   │   └── ...
│   └── css/
│       └── ...
│
└── Documentation files...
```

---

## 🎯 QUICK REFERENCE COMMANDS

### Start Everything (Automatic):
```
Double-click: RUN_EVERYTHING.bat
```

### Start Backend (Manual):
```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\backend"
python startup.py
```

### Open Frontend:
```
Double-click: frontend\index.html
```

### Check Health:
```
Browser: http://localhost:5000/api/health
```

### View API Docs:
```
Browser: http://localhost:5000/docs
```

### Stop Backend:
```
Press Ctrl + C in backend CMD window
```

---

## 📊 SYSTEM REQUIREMENTS

- **Python:** 3.8 or higher
- **OS:** Windows (current), Mac, or Linux
- **Browser:** Chrome, Firefox, Edge, or Safari
- **Internet:** Required for first-time package installation
- **Disk Space:** ~200 MB for packages

---

## 🏆 SUCCESS CHECKLIST

After starting, verify all these:

- [ ] Backend CMD shows "STARTUP COMPLETE"
- [ ] No red errors in backend CMD
- [ ] Browser opens landing page
- [ ] Page title shows "Vadodara Nagar Samwad"
- [ ] Statistics display on page
- [ ] http://localhost:5000/docs opens
- [ ] Can submit a test complaint
- [ ] Dashboard shows data
- [ ] No errors in browser console (F12)

**✅ All checked? Perfect! System is fully operational!**

---

## 💡 PRO TIPS

1. **Always start backend FIRST** before opening frontend
2. **Keep backend CMD window OPEN** while using the app
3. **Use Chrome or Firefox** for best experience
4. **Check backend CMD** for server logs and activity
5. **Press F12 in browser** to see console for debugging
6. **Bookmark http://localhost:5000/docs** for API reference
7. **First time?** Use `RUN_EVERYTHING.bat` for easiest start

---

## 🎓 WHAT EACH STEP DOES

| Step | What It Does | Why It's Needed |
|------|--------------|-----------------|
| **Navigate to backend** | Changes directory to where server files are | CMD needs to be in correct folder |
| **Install packages** | Downloads required Python libraries | Backend needs these to function |
| **Run startup.py** | Starts FastAPI server | Provides API for frontend |
| **Open index.html** | Opens landing page in browser | User interface to interact with system |

---

## 🌟 SYSTEM CAPABILITIES

Once running, your system can:

✅ Register complaints via web form  
✅ Register complaints via voice call  
✅ Support multiple languages (English, Hindi, Gujarati)  
✅ Track complaint status (Pending, In Progress, Resolved)  
✅ Show real-time statistics  
✅ Admin dashboard for viewing all complaints  
✅ Generate complaint IDs automatically  
✅ Store data persistently in database  
✅ Provide REST API for integration  
✅ Export data for analysis  

---

## 📞 FINAL NOTES

- **First Run:** Takes 3-5 minutes (package installation)
- **Subsequent Runs:** Takes 30 seconds
- **Data Persists:** All complaints saved in database
- **No Internet Needed:** After packages installed (except for TTS)
- **Production Ready:** Yes, fully functional

---

## 🎉 YOU'RE ALL SET!

**Your AI Smart Call Center (Vadodara Nagar Samwad) is ready!**

### Choose Your Method:

**1. AUTOMATIC (Recommended):**
   - Double-click `RUN_EVERYTHING.bat`
   - Wait 30 seconds
   - Done!

**2. MANUAL:**
   - Follow steps 1-5 above
   - Takes 2-3 minutes

**3. NEED HELP?**
   - Read `HOW_TO_RUN_IN_CMD.md` for detailed guide
   - Check `QUICK_START_CARD.txt` for quick reference
   - Review `START_HERE.md` for overview

---

**Created:** January 24, 2026  
**Project:** Vadodara Nagar Samwad - AI Smart Call Center  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  

---

**Questions? All documentation files are in the project root folder.**

**Happy Coding! 🚀**
