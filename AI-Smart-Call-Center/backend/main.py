"""
AI Smart Call Center Backend
Main application entry point using FastAPI
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

from routes.complaint import router as complaint_router
from services.ai_service import AIService
from services.tts_service import TTSService
from services.ivr_controller import get_ivr_controller, process_ivr_input

# Create FastAPI app
app = FastAPI(
    title="AI Smart Call Center",
    description="AI-Powered Government Services Call Center System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
tts_service = TTSService()

# Include routers
app.include_router(complaint_router, prefix="/api/complaints", tags=["Complaints"])


# ===== Request/Response Models =====
class AIProcessRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = {}

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


# ===== API Endpoints =====
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Smart Call Center",
        "version": "1.0.0"
    }


@app.get("/api/info")
async def app_info():
    """Application information endpoint"""
    return {
        "name": "AI Smart Call Center",
        "version": "1.0.0",
        "description": "AI-Powered Government Services Call Center System",
        "tech_stack": {
            "backend": "FastAPI (Python)",
            "ai": "OpenAI Whisper, LLMs",
            "tts": "Google Text-to-Speech (gTTS)",
            "database": "SQLite",
            "frontend": "HTML/CSS/JavaScript with Web Speech API"
        },
        "features": [
            "Voice-enabled complaint registration",
            "Multi-language support (English, Hindi, Gujarati)",
            "Real-time speech recognition",
            "Text-to-Speech responses",
            "Automated complaint categorization",
            "Status tracking"
        ]
    }


@app.post("/api/ai/process")
async def process_ai_input(request: AIProcessRequest):
    """Process user input using AI service"""
    try:
        language = request.context.get('language', 'en') if request.context else 'en'
        result = ai_service.process_input(request.text, request.context)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/detect-type")
async def detect_complaint_type(request: AIProcessRequest):
    """Detect complaint type and sub-category from text (multilingual)"""
    try:
        language = request.context.get('language', 'en') if request.context else 'en'
        
        # Use enhanced detection with sub-category
        detection_result = ai_service.detect_with_sub_category(request.text, language)
        
        # Get IVR follow-up question if type detected
        ivr_question = None
        if detection_result.get('complaint_type'):
            ivr_question = ai_service.get_ivr_question(detection_result['complaint_type'], language)
        
        return {
            "success": True,
            "complaint_type": detection_result.get('complaint_type'),
            "sub_category": detection_result.get('sub_category'),
            "confidence": detection_result.get('confidence'),
            "ivr_question": ivr_question
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/response")
async def generate_response(request: Request):
    """Generate AI response in specified language"""
    try:
        data = await request.json()
        intent = data.get("intent", "")
        context = data.get("data", {})
        language = data.get("language", "en")
        
        response = ai_service.generate_response(intent, context, language)
        return {
            "success": True,
            "response": response,
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== IVR Controller Endpoints =====

# Store active IVR sessions in memory (for demo - in production use Redis/DB)
ivr_sessions: Dict[str, Dict] = {}

class IVRRequest(BaseModel):
    user_input: str
    session_id: Optional[str] = None


@app.post("/api/ivr/session")
async def create_ivr_session():
    """Create a new IVR session"""
    try:
        controller = get_ivr_controller()
        session = controller.create_session()
        session_id = session["session_id"]
        ivr_sessions[session_id] = session
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "IVR session created",
            "greeting": {
                "en": "Namaste. Welcome to Municipal Complaint Helpline. Please describe your complaint.",
                "hi": "Namaste. Nagar Nigam Shikayat Helpline mein aapka swagat hai. Kripya apni shikayat batayein."
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ivr/process")
async def process_ivr_request(request: IVRRequest):
    """
    Process IVR input and return the next response
    
    This endpoint follows IVR call-center style:
    - Asks ONLY the next most relevant question
    - Never asks unnecessary or repeated questions
    - Outputs valid JSON with state and next action
    """
    try:
        session_id = request.session_id
        
        # Get or create session
        if session_id and session_id in ivr_sessions:
            session = ivr_sessions[session_id]
        else:
            controller = get_ivr_controller()
            session = controller.create_session()
            session_id = session["session_id"]
            ivr_sessions[session_id] = session
        
        # Process the input
        result = process_ivr_input(request.user_input, session)
        
        # Update session in storage
        ivr_sessions[session_id] = session
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ivr/session/{session_id}")
async def get_ivr_session(session_id: str):
    """Get current IVR session state"""
    if session_id not in ivr_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = ivr_sessions[session_id]
    return {
        "success": True,
        "session_id": session_id,
        "state": session.get("state"),
        "language": session.get("language"),
        "collected_data": session.get("collected_data"),
        "conversation_history": session.get("conversation_history", [])
    }


@app.delete("/api/ivr/session/{session_id}")
async def end_ivr_session(session_id: str):
    """End and cleanup IVR session"""
    if session_id in ivr_sessions:
        del ivr_sessions[session_id]
    
    return {
        "success": True,
        "message": "Session ended"
    }


# ===== VMC-Specific Endpoints =====

@app.get("/api/vmc/categories")
async def get_complaint_categories():
    """Get all complaint categories with sub-categories"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        categories = []
        for cat_name, cat_data in vmc_service.complaint_categories.items():
            sub_cats = []
            for sub_id, translations in cat_data['sub_categories'].items():
                sub_cats.append({
                    'id': sub_id,
                    'text_en': translations.get('en', sub_id),
                    'text_hi': translations.get('hi', translations.get('en', sub_id)),
                    'text_gu': translations.get('gu', translations.get('en', sub_id))
                })
            
            categories.append({
                'name': cat_name,
                'id': cat_data['id'],
                'icon': cat_data['icon'],
                'name_gu': cat_data['name_gu'],
                'name_hi': cat_data['name_hi'],
                'sub_categories': sub_cats
            })
        
        return {"success": True, "categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vmc/sub-categories/{complaint_type}")
async def get_sub_categories(complaint_type: str, language: str = "en"):
    """Get sub-categories for a specific complaint type"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        sub_cats = vmc_service.get_sub_categories(complaint_type, language)
        return {"success": True, "sub_categories": sub_cats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vmc/detect-location")
async def detect_location(request: Request):
    """Auto-detect ward and zone from area name"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        data = await request.json()
        area = data.get("area", "")
        text = data.get("text", area)
        
        # Try to auto-detect from area name
        location_info = vmc_service.get_zone_for_area(area)
        
        # If not found, try to extract ward/zone from text
        if not location_info:
            ward = vmc_service.detect_ward_from_text(text)
            zone = vmc_service.detect_zone_from_text(text)
            
            if ward or zone:
                location_info = {
                    'area': area,
                    'ward': ward or '',
                    'zone': zone or '',
                    'auto_detected': False
                }
        
        return {
            "success": True,
            "location": location_info,
            "auto_detected": location_info.get('auto_detected', False) if location_info else False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vmc/wards")
async def get_wards():
    """Get all VMC wards with zone mappings"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        return {"success": True, "wards": vmc_service.wards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vmc/zones")
async def get_zones():
    """Get all VMC zones"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        return {"success": True, "zones": vmc_service.zones}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vmc/areas")
async def get_known_areas():
    """Get all known Vadodara areas with ward/zone mappings"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        areas = []
        for area_name, info in vmc_service.vadodara_areas.items():
            areas.append({
                'name': area_name.title(),
                'ward': info['ward'],
                'zone': info['zone']
            })
        
        return {"success": True, "areas": areas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vmc/generate-id")
async def generate_complaint_id(request: Request):
    """Generate VMC-style complaint ID"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        data = await request.json()
        complaint_type = data.get("complaint_type", "Other")
        ward = data.get("ward", "")
        
        complaint_id = vmc_service.generate_complaint_id(complaint_type, ward)
        
        return {"success": True, "complaint_id": complaint_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vmc/priority")
async def get_complaint_priority(request: Request):
    """Determine complaint priority based on type and sub-category"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        data = await request.json()
        complaint_type = data.get("complaint_type", "")
        sub_category = data.get("sub_category", None)
        
        priority = vmc_service.get_priority(complaint_type, sub_category)
        
        return {"success": True, "priority": priority}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vmc/ivr-question")
async def get_ivr_question(request: Request):
    """Get IVR-style question for complaint type"""
    try:
        from services.vmc_service import get_vmc_service
        vmc_service = get_vmc_service()
        
        data = await request.json()
        complaint_type = data.get("complaint_type", "")
        question_type = data.get("question_type", "initial")
        language = data.get("language", "en")
        
        question = vmc_service.get_ivr_question(complaint_type, question_type, language)
        
        return {"success": True, "question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tts/generate")
async def generate_speech(request: TTSRequest):
    """Generate Text-to-Speech audio"""
    try:
        audio_path = tts_service.generate_audio(request.text, request.language)
        return {
            "success": True,
            "audio_url": f"/api/tts/audio/{os.path.basename(audio_path)}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tts/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio file"""
    audio_path = os.path.join("audio_cache", filename)
    if os.path.exists(audio_path):
        return FileResponse(audio_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found")


# ===== Error Handlers =====
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"success": False, "error": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )


if __name__ == "__main__":
    print("=" * 50)
    print("AI Smart Call Center - FastAPI Backend Server")
    print("=" * 50)
    print("Starting server on http://localhost:5000")
    print("API Docs: http://localhost:5000/docs")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=5000)
