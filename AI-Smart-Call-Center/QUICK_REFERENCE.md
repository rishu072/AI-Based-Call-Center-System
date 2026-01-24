# 🚀 QUICK REFERENCE CARD - AI Smart Call Center

## ⚡ 30-SECOND QUICK START

```
1. Open Command Prompt
2. cd backend
3. python startup.py
4. Wait for "🚀 AI SMART CALL CENTER - STARTUP COMPLETE" message
5. Open frontend/index.html in browser
✅ DONE!
```

---

## 📍 Important URLs

| Purpose | URL |
|---------|-----|
| **Landing Page** | `frontend/index.html` |
| **API Health** | `http://localhost:5000/api/health` |
| **API Docs** | `http://localhost:5000/docs` |
| **Get Complaints** | `http://localhost:5000/api/complaints` |
| **Complaint Form** | `frontend/complaint.html` |
| **Voice Call** | `frontend/call.html` |
| **Dashboard** | `frontend/dashboard.html` |

---

## 💾 Database Info

| Item | Details |
|------|---------|
| **Type** | SQLite3 |
| **Location** | `backend/complaints.db` |
| **Auto-Create** | Yes (on startup) |
| **Tables** | 2 (complaints, ward_zone_mapping) |
| **Status** | Ready for use |

---

## 🔌 Port Information

| Service | Port | Status |
|---------|------|--------|
| **Backend API** | 5000 | ✅ Active |
| **Database** | N/A (SQLite) | ✅ Local |
| **Frontend** | N/A (Static) | ✅ Browser |

---

## 📊 API Endpoints Quick Reference

### Complaints Management
```
POST   /api/complaints              Create new complaint
GET    /api/complaints              Get all complaints
GET    /api/complaints/{id}         Get specific complaint
PUT    /api/complaints/{id}         Update complaint
GET    /api/complaints/{id}/status  Get status
DELETE /api/complaints/{id}         Delete complaint
GET    /api/complaints/stats/summary Get statistics
```

### System
```
GET    /api/health                  Check server status
GET    /api/info                    Get app info
```

---

## 🛠️ Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **Port 5000 in use** | Change port in startup.py |
| **Python not found** | Install Python from python.org |
| **Module not found** | Run: `pip install -r requirements.txt` |
| **Database locked** | Delete complaints.db and restart |
| **No data showing** | Check: `http://localhost:5000/api/health` |
| **Frontend not loading** | Open developer console (F12) to check errors |

---

## 📝 File Structure Quick Map

```
📦 AI-Smart-Call-Center
├── 🔙 backend/
│   ├── startup.py          ← RUN THIS
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── complaints.db       ← Auto-created
├── 🌐 frontend/
│   ├── index.html          ← OPEN THIS
│   ├── complaint.html
│   ├── call.html
│   ├── js/config.js
│   ├── js/landing.js
│   └── css/
└── 📚 Documentation
    ├── README.md
    ├── SETUP_GUIDE.md
    └── DATABASE_INTEGRATION_SUMMARY.md
```

---

## 🎯 Typical Workflow

```
1. START BACKEND
   └─ python startup.py
      └─ Creates complaints.db
      └─ Initializes tables
      └─ Server runs on :5000

2. OPEN FRONTEND
   └─ Open frontend/index.html
      └─ Loads config.js
      └─ Connects to API
      └─ Fetches real data

3. USE SYSTEM
   └─ View landing page stats
   └─ Register complaints
   └─ Check dashboard
   └─ View reports

4. DATA FLOW
   User → Frontend → API → Database → Frontend
```

---

## 🔐 Default Configuration

| Setting | Value |
|---------|-------|
| **Server Host** | 0.0.0.0 (all interfaces) |
| **Server Port** | 5000 |
| **Database** | SQLite (complaints.db) |
| **Database Path** | backend/complaints.db |
| **CORS** | Enabled for all origins |
| **Debug Mode** | True |
| **Language** | English (default) |

---

## ✅ Verification Checklist

After startup, verify:
- [ ] Backend shows "STARTUP COMPLETE"
- [ ] `http://localhost:5000/api/health` returns success
- [ ] `frontend/index.html` loads without errors
- [ ] Statistics display on landing page
- [ ] `complaints.db` file exists
- [ ] Can view API docs at `http://localhost:5000/docs`
- [ ] Browser console has no red errors (F12)

---

## 🆘 Emergency Fixes

```bash
# Complete reset:
1. Close all windows
2. Delete backend/complaints.db
3. Run: python startup.py
4. Refresh browser (Ctrl+F5)
```

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| **Setup Guide** | SETUP_GUIDE.md |
| **Integration Info** | DATABASE_INTEGRATION_SUMMARY.md |
| **Main Docs** | README.md |
| **API Docs** | http://localhost:5000/docs |
| **Console Logs** | Backend terminal output |
| **Browser Logs** | Press F12 in browser |

---

## 🎓 Learning Path

1. ✅ **Installation** - Read SETUP_GUIDE.md
2. ✅ **Backend** - Run startup.py
3. ✅ **Frontend** - Open index.html
4. ✅ **Testing** - Use API endpoints
5. ✅ **Features** - Explore complaint registration

---

## 🚀 Performance Tips

- Use modern browser (Chrome recommended)
- Close unnecessary applications
- Check internet for downloading gTTS
- Monitor backend console for errors
- Use developer tools to debug frontend

---

## 📊 Data Statistics Calculated

- Total Complaints
- Resolved Complaints  
- Pending/In-Progress Complaints
- Average Resolution Time
- By Complaint Type
- By Status
- By Zone

---

## 🎨 Frontend Features Working

- ✅ Responsive design
- ✅ Live animations
- ✅ Interactive charts
- ✅ Real-time stats
- ✅ Complaint forms
- ✅ Voice interface (call.html)
- ✅ Dashboard (dashboard.html)

---

**Last Updated:** January 24, 2026  
**Status:** ✅ PRODUCTION READY  
**Version:** 1.0.0
