# 🚀 COMPLETE GUIDE: How to Run AI Smart Call Center in CMD

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Instructions](#step-by-step-instructions)
3. [Testing the System](#testing-the-system)
4. [Troubleshooting](#troubleshooting)
5. [Stopping the System](#stopping-the-system)

---

## Prerequisites

Before starting, ensure you have:
- ✅ Python 3.8 or higher installed
- ✅ Internet connection (for first-time setup)
- ✅ A web browser (Chrome, Firefox, Edge, etc.)

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Open Command Prompt (CMD)**

1. Press `Windows + R` on your keyboard
2. Type `cmd` and press Enter
3. A black command prompt window will open

---

### **STEP 2: Navigate to the Project Directory**

In the CMD window, type:

```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center"
```

Press **Enter**

**Expected Result:** You should see your command prompt showing this directory path.

---

### **STEP 3: Verify Python Installation**

Check if Python is installed:

```cmd
python --version
```

Press **Enter**

**Expected Result:** You should see something like `Python 3.x.x`

**If Python is not found:**
- Download Python from https://www.python.org/downloads/
- Install it with "Add to PATH" option checked
- Restart CMD and try again

---

### **STEP 4: Navigate to Backend Directory**

```cmd
cd backend
```

Press **Enter**

**Expected Result:** Your path should now end with `\backend`

---

### **STEP 5: Install Required Python Packages**

This step installs all necessary dependencies:

```cmd
pip install fastapi==0.109.0 uvicorn[standard]==0.27.0 python-dotenv==1.0.0 pydantic==2.5.0 python-multipart==0.0.6 gtts==2.5.0 aiofiles==23.2.1 SpeechRecognition==3.10.0 requests==2.31.0 sqlalchemy==2.0.23
```

Press **Enter**

**Expected Result:** You'll see download progress and installation messages.

**Time Required:** 1-3 minutes (depending on internet speed)

**Note:** If you see "Requirement already satisfied", that's fine - it means packages are already installed.

---

### **STEP 6: Start the Backend Server**

Now start the server:

```cmd
python startup.py
```

Press **Enter**

**Expected Result:** You should see:
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

💡 System Features:
   ✅ Database: SQLite (complaints.db)
   ✅ AI Service: Integrated
   ✅ Voice Support: Enabled
   ✅ Multi-language: Supported
```

**🎉 SUCCESS!** Your backend server is now running!

**⚠️ IMPORTANT:** 
- Keep this CMD window OPEN
- Do NOT close it while using the application
- This window will show all server activity and logs

---

### **STEP 7: Open a New Command Prompt for Frontend**

1. Press `Windows + R` again
2. Type `cmd` and press Enter
3. A **NEW** CMD window will open

In this new CMD window, navigate to frontend:

```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\frontend"
```

Press **Enter**

---

### **STEP 8: Open the Landing Page**

You have **TWO OPTIONS** to open the frontend:

#### **Option A: Direct File Opening (EASIEST)**

Simply double-click this file:
```
c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\frontend\index.html
```

It will open in your default browser.

#### **Option B: Using CMD (Alternative)**

In the frontend CMD window:

```cmd
start index.html
```

Press **Enter**

**Expected Result:** Your default web browser will open showing the "Vadodara Nagar Samwad" landing page.

---

## ✅ TESTING THE SYSTEM

### **Test 1: Verify Backend is Running**

Open browser and go to:
```
http://localhost:5000/api/health
```

**Expected Result:** You should see:
```json
{
  "status": "healthy",
  "message": "AI Smart Call Center API is running"
}
```

---

### **Test 2: Check API Documentation**

Open browser and go to:
```
http://localhost:5000/docs
```

**Expected Result:** You'll see interactive API documentation (Swagger UI) with all available endpoints.

---

### **Test 3: View All Complaints**

Open browser and go to:
```
http://localhost:5000/api/complaints
```

**Expected Result:** You'll see a JSON list of all complaints stored in the database.

---

### **Test 4: Check Landing Page Statistics**

On the landing page (`index.html`), you should see:
- ✅ Total Complaints counter
- ✅ Pending/Resolved/In Progress stats
- ✅ Recent Complaints list
- ✅ "Register Complaint" button working

---

### **Test 5: Submit a Test Complaint**

1. Click **"Register Complaint"** button on landing page
2. Fill in the complaint form:
   - Name: Test User
   - Phone: 1234567890
   - Category: Street Light
   - Description: Test complaint for verification
3. Click **Submit**
4. You should see a success message with a complaint ID

---

### **Test 6: View Dashboard**

Open in browser:
```
frontend/dashboard.html
```

**Expected Result:** You'll see the admin dashboard with:
- Charts showing complaint statistics
- List of all complaints
- Status breakdowns

---

## 🔧 TROUBLESHOOTING

### **Problem: "python is not recognized"**

**Solution:**
1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart CMD and try again

---

### **Problem: "Port 5000 is already in use"**

**Solution:**
1. Close any other programs using port 5000
2. Or change the port in `backend/.env` file:
   ```
   PORT=8000
   ```
3. Restart the server

---

### **Problem: "Module not found" errors**

**Solution:**
Run this command in backend directory:
```cmd
pip install -r requirements.txt
```

---

### **Problem: Landing page shows "Failed to load statistics"**

**Solution:**
1. Verify backend is running (check CMD window)
2. Check if `http://localhost:5000/api/health` works
3. Press `Ctrl + Shift + R` in browser to hard refresh
4. Check browser console (Press F12) for errors

---

### **Problem: Database errors**

**Solution:**
1. Delete `backend/complaints.db`
2. Restart the server with `python startup.py`
3. Database will be recreated automatically

---

### **Problem: CORS errors in browser**

**Solution:**
The backend is already configured to allow CORS. If you still see errors:
1. Make sure backend is running
2. Check the backend CMD window for error messages
3. Verify the API URL in `frontend/js/config.js` is correct

---

## 🛑 STOPPING THE SYSTEM

### **To Stop the Backend Server:**

1. Go to the CMD window running the backend
2. Press `Ctrl + C`
3. Type `Y` if asked to confirm
4. Press Enter

**Expected Result:** Server will shutdown gracefully.

---

### **To Close the Frontend:**

Simply close your web browser tabs.

---

## 📊 SYSTEM STATUS CHECKLIST

After starting, verify all these are working:

- [ ] **Backend CMD window shows "STARTUP COMPLETE"**
- [ ] **Browser shows landing page with correct title**
- [ ] **Statistics are displaying on landing page**
- [ ] **http://localhost:5000/docs is accessible**
- [ ] **Can submit a test complaint**
- [ ] **Dashboard shows complaint data**
- [ ] **No errors in backend CMD window**
- [ ] **No errors in browser console (F12)**

✅ **All checked? Congratulations! Your system is fully operational!**

---

## 🎯 QUICK REFERENCE COMMANDS

### **Start Backend:**
```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\backend"
python startup.py
```

### **Open Frontend:**
```cmd
cd "c:\Users\Rishu\Desktop\PU-Hackathon\AI-Smart-Call-Center (Modrate)\AI-Smart-Call-Center\frontend"
start index.html
```

### **View API Docs:**
Open browser: `http://localhost:5000/docs`

### **Check Health:**
Open browser: `http://localhost:5000/api/health`

### **Stop Server:**
Press `Ctrl + C` in backend CMD window

---

## 🌐 ALL AVAILABLE PAGES

Once system is running, access these:

| Page | URL/Path | Description |
|------|----------|-------------|
| **Landing Page** | `frontend/index.html` | Main homepage with statistics |
| **Register Complaint** | `frontend/complaint.html` | Submit new complaints |
| **Voice Call** | `frontend/call.html` | Voice-based complaint registration |
| **Admin Dashboard** | `frontend/dashboard.html` | View all complaints & analytics |
| **Admin Login** | `frontend/admin/admin-login.html` | Admin authentication |
| **Admin Panel** | `frontend/admin/admin-panel.html` | Manage complaints |
| **API Health** | `http://localhost:5000/api/health` | Backend health check |
| **API Docs** | `http://localhost:5000/docs` | Interactive API documentation |
| **All Complaints** | `http://localhost:5000/api/complaints` | JSON list of complaints |

---

## 🎓 ADDITIONAL NOTES

### **CMD Windows Required:**
- **1 window** for Backend (must stay open)
- Backend CMD shows all server logs and requests

### **Internet Required:**
- First-time package installation
- Google TTS service (for voice features)
- Google Fonts loading

### **Browser Compatibility:**
- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Internet Explorer (Not recommended)

### **Data Persistence:**
- All complaints saved in `backend/complaints.db`
- Database persists even after server restart
- To reset data, delete the .db file

---

## 🏆 SUCCESS INDICATORS

### **Backend Running Successfully:**
```
✅ No error messages in CMD
✅ Shows "STARTUP COMPLETE"
✅ http://localhost:5000/api/health returns healthy status
✅ CMD shows incoming requests when you use the app
```

### **Frontend Working Successfully:**
```
✅ Landing page loads with no errors
✅ Statistics display correctly
✅ Can navigate between pages
✅ Forms submit successfully
✅ Data updates in real-time
```

---

## 📞 FINAL CHECKLIST

Before presenting/demo:

1. ✅ Backend running without errors
2. ✅ Frontend opens in browser
3. ✅ Can submit a test complaint
4. ✅ Dashboard shows data
5. ✅ Voice features working (if testing)
6. ✅ All pages accessible
7. ✅ No console errors
8. ✅ Database has sample data

---

## 🎉 YOU'RE DONE!

Your **AI Smart Call Center (Vadodara Nagar Samwad)** is now running!

**System is ready for:**
- ✅ Demo/Presentation
- ✅ Testing
- ✅ Development
- ✅ Production use

---

**Created:** January 24, 2026  
**Project:** Vadodara Nagar Samwad - AI Smart Call Center  
**Status:** Production Ready  

---

*For more detailed documentation, check:*
- `START_HERE.md` - Quick start guide
- `QUICK_REFERENCE.md` - Quick lookup
- `SETUP_GUIDE.md` - Detailed setup guide
- `README.md` - Project overview
