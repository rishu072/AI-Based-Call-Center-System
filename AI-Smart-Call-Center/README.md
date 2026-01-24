# AI Smart Call Center - Vadodara Nagar Samwad

An AI-powered government services call center system built for the VMC (Vadodara Municipal Corporation) to handle citizen complaints efficiently.

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.8+** installed
- **pip** package manager
- **Modern web browser** (Chrome, Firefox, Edge)

### Installation & Running (Windows)

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Initialize Database & Start Backend
```bash
cd backend
python startup.py
```

Expected output:
```
============================================================
Starting AI Smart Call Center Backend
============================================================
============================================================
Initializing Database...
============================================================
✓ Database service initialized
✓ Complaints table created/verified
✓ Ward-Zone mapping table created/verified
✓ Sample data loaded

============================================================
Initializing Services...
============================================================
✓ AI Service initialized
✓ Text-to-Speech Service initialized
✓ Complaint Service initialized

============================================================
🚀 AI SMART CALL CENTER - STARTUP COMPLETE
============================================================

📋 Service Information:
   • API Server: http://localhost:5000
   • API Docs: http://localhost:5000/docs
   • Database: complaints.db (SQLite)
```

#### Step 3: Access the Application
- **Landing Page**: Open `frontend/index.html` in your browser
- **Register Complaint**: Click "Register Complaint" or "Start AI Call"
- **Dashboard**: View all complaints and statistics

### Testing API Connection

Once backend is running, you can test:
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/docs
- **Get All Complaints**: http://localhost:5000/api/complaints

## 🎯 Problem Statement

At present, 10 operators are handling calls at the VMC call center, which creates several challenges:
- Staff limitations
- Behavioral issues
- Heavy call flow that cannot be effectively handled by 10 operators

## ✅ Solution

An AI-based call receiving system that:
- Attends calls in **Gujarati, Hindi, and English**
- Asks relevant questions and interprets responses
- Registers complaints in the existing VMC software
- Automatically identifies **Address, Ward, and Zone**

## 🚀 Features

### Core Features
- **Voice-enabled Complaint Registration** - Speak naturally to register complaints
- **Multi-language Support** - English, Hindi (हिंदी), and Gujarati (ગુજરાતી)
- **Real-time Speech Recognition** - Using Web Speech API
- **Text-to-Speech Responses** - Google TTS (gTTS) for voice feedback
- **Automated Complaint Categorization** - AI-based intent detection
- **Status Tracking** - Track complaint status with unique IDs

### VMC-Specific Features
- **IVR-Style Questions** - Asks relevant follow-up questions based on complaint type
- **Sub-Category Detection** - Detailed issue identification (e.g., for street light: light off, pole damaged, current leakage)
- **Auto Address Detection** - Automatically identifies Ward and Zone from area name
- **Vadodara Area Mapping** - 30+ known areas mapped to wards and zones
- **Priority Engine** - Automatic priority assignment based on issue severity
- **VMC Complaint ID Format** - Format: `VMC-{TYPE}-W{WARD}-{DATE}-{SEQ}`

### Complaint Categories

1. **💡 Street Light**
   - Light off / Not working
   - Pole damaged / Tilted
   - Current leakage / Electric shock hazard
   - Flickering light
   - Dim / Low brightness
   - Wire hanging / Exposed wire

2. **💧 Water Supply**
   - No water supply
   - Low water pressure
   - Dirty / Contaminated water
   - Pipe leakage
   - Main line burst
   - Irregular supply timing
   - Water meter issues

3. **🛣️ Road Damage**
   - Pothole
   - Road surface broken
   - Water logging
   - Footpath damaged
   - Divider damaged
   - Speed breaker issue

4. **🗑️ Garbage**
   - Garbage not collected
   - Overflowing bin
   - Illegal dumping
   - No dustbin in area
   - Dead animal
   - Construction waste

5. **🚿 Drainage**
   - Drain blocked
   - Drain overflowing
   - No drainage system
   - Bad smell
   - Manhole open/missing

## 🛠 Tech Stack

### Artificial Intelligence & Voice Processing
- **Web Speech API** - Browser-based voice recording
- **LLMs** - Complaint classification & severity analysis
- **Google Text-to-Speech (gTTS)** - Voice response generation in 3 languages

### Web & Application Development
- **FastAPI (Python)** - Backend API development
- **HTML/CSS/JavaScript** - Frontend web application
- **Web Speech API** - Browser-based voice recording

### Database & Data Handling
- **SQLite** - Complaint and location data storage
- **JSON-based Ward & Zone Mapping** - Auto-location logic

## 📁 Project Structure

```
AI-Smart-Call-Center/
├── backend/
```│   ├── main.py              # FastAPI application entry
│   ├── models.py            # Pydantic data models
│   ├── requirements.txt     # Python dependencies
│   ├── routes/
│   │   └── complaint.py     # Complaint API endpoints
│   ├── services/
│   │   ├── ai_service.py    # AI/ML processing (multilingual)
│   │   ├── complaint_service.py  # Complaint management
│   │   ├── database_service.py   # SQLite operations
│   │   ├── tts_service.py   # Text-to-Speech
│   │   └── vmc_service.py   # VMC-specific logic
│   └── utils/
│       └── id_generator.py  # Unique ID generation
├── frontend/
│   ├── index.html           # Home page
│   ├── call.html            # Voice call interface
│   ├── complaint.html       # Complaint type selection
│   ├── sub-category.html    # Sub-category selection (IVR)
│   ├── address.html         # Address input form
│   ├── review.html          # Review before submit
│   ├── success.html         # Success confirmation
│   ├── dashboard.html       # Admin dashboard
│   ├── css/
│   │   └── style.css        # Styles
│   └── js/
│       ├── config.js        # Configuration
│       ├── state.js         # State management
│       ├── api.js           # API communication (with VMC endpoints)
│       ├── speech.js        # Speech recognition
│       ├── flow.js          # Conversation flow
│       └── ui.js            # UI utilities
└── docs/
    └── (documentation files)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Modern web browser with microphone access (Chrome/Edge recommended)
- Node.js (optional, for serving frontend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:5000`
   
   API Documentation: `http://localhost:5000/docs`

### Frontend Setup

1. Open `frontend/index.html` in a web browser, or

2. Serve using Python:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   
   Then open `http://localhost:8080`

## 📡 API Endpoints

### Health & Info
- `GET /api/health` - Health check
- `GET /api/info` - Application info

### Complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/{id}` - Get complaint by ID
- `PUT /api/complaints/{id}` - Update complaint status
- `DELETE /api/complaints/{id}` - Delete complaint

### AI Processing
- `POST /api/ai/process` - Process user input
- `POST /api/ai/detect-type` - Detect complaint type & sub-category
- `POST /api/ai/response` - Generate AI response (multilingual)

### VMC Specific
- `GET /api/vmc/categories` - Get all complaint categories with sub-categories
- `GET /api/vmc/sub-categories/{type}` - Get sub-categories for a type
- `POST /api/vmc/detect-location` - Auto-detect ward/zone from area
- `GET /api/vmc/wards` - Get all VMC wards
- `GET /api/vmc/zones` - Get all VMC zones
- `GET /api/vmc/areas` - Get known Vadodara areas
- `POST /api/vmc/generate-id` - Generate VMC-style complaint ID
- `POST /api/vmc/priority` - Get complaint priority
- `POST /api/vmc/ivr-question` - Get IVR question

### Text-to-Speech
- `POST /api/tts/generate` - Generate audio from text
- `GET /api/tts/audio/{filename}` - Get audio file

## 🌐 Supported Languages

| Language | Code | Voice Recognition | Text-to-Speech |
|----------|------|-------------------|----------------|
| English | en-US | ✓ | ✓ |
| Hindi | hi-IN | ✓ | ✓ |
| Gujarati | gu-IN | ✓ | ✓ |

## 📱 User Flow

```
1. Home → Select Language or Start AI Call
      ↓
2. Voice/Manual Input → Describe complaint
      ↓
3. Complaint Type → Auto-detected or Select manually
      ↓
4. Sub-Category → Select specific issue (IVR-style)
      ↓
5. Address → Enter location (Auto-detect ward/zone)
      ↓
6. Review → Verify all information
      ↓
7. Success → Get VMC Complaint ID
```

## 🏢 VMC Zone & Ward Structure

### Zones (5)
- **North** (ઉત્તર / उत्तर)
- **South** (દક્ષિણ / दक्षिण)
- **East** (પૂર્વ / पूर्व)
- **West** (પશ્ચિમ / पश्चिम)
- **Central** (મધ્ય / मध्य)

### Wards (19)
Each ward is mapped to a zone for automatic identification.

## 🎤 Example Conversation Flow

**English:**
```
AI: Hello! Welcome to Vadodara Nagar Samwad. How can I help you today?
User: There is a street light not working near my house.
AI: I understand you have a street light issue. What is the problem - light off, pole damaged, or current leakage?
User: The light is off for 3 days.
AI: Please provide the location - area name and landmark.
User: Alkapuri, near Inox cinema.
AI: I've identified your location as Alkapuri in Ward 1, Central Zone. Is this correct?
User: Yes
AI: Your complaint has been registered. Complaint ID: VMC-SL-W01-20260121-042
```

**Gujarati:**
```
AI: નમસ્તે! વડોદરા નગર સંવાદમાં આપનું સ્વાગત છે. આજે હું તમારી કેવી રીતે મદદ કરી શકું?
User: મારા ઘર પાસે સ્ટ્રીટ લાઇટ બંધ છે.
AI: મને સમજાયું કે તમને સ્ટ્રીટ લાઇટની સમસ્યા છે. સમસ્યા શું છે - લાઇટ બંધ છે, થાંભલો ખરાબ છે, કે વીજળી ગળે છે?
...
```

## 👥 Team

Built for PU Hackathon 2026

## 📄 License

This project is for educational and demonstration purposes.

---

*All technologies used are open-source or widely adopted industry tools, making the solution scalable, cost-effective, and ready for real-world municipal deployment.*
