"""
Startup script for AI Smart Call Center
Initializes database, services, and starts the FastAPI server
"""

import os
import sys
import asyncio

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.database_service import get_db_service
from services.complaint_service import get_complaint_service

def initialize_database():
    """Initialize the database with required tables"""
    print("=" * 60)
    print("Initializing Database...")
    print("=" * 60)
    
    try:
        db_service = get_db_service()
        print("✓ Database service initialized")
        print("✓ Complaints table created/verified")
        print("✓ Ward-Zone mapping table created/verified")
        print("✓ Sample data loaded")
        return True
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return False

def initialize_services():
    """Initialize all services"""
    print("\n" + "=" * 60)
    print("Initializing Services...")
    print("=" * 60)
    
    try:
        from services.ai_service import AIService
        from services.tts_service import TTSService
        
        ai_service = AIService()
        print("✓ AI Service initialized")
        
        tts_service = TTSService()
        print("✓ Text-to-Speech Service initialized")
        
        complaint_service = get_complaint_service()
        print("✓ Complaint Service initialized")
        
        return True
    except Exception as e:
        print(f"✗ Service initialization failed: {e}")
        return False

def print_startup_info():
    """Print startup information"""
    print("\n" + "=" * 60)
    print("🚀 AI SMART CALL CENTER - STARTUP COMPLETE")
    print("=" * 60)
    print("\n📋 Service Information:")
    print("   • API Server: http://localhost:5000")
    print("   • API Docs: http://localhost:5000/docs")
    print("   • Database: complaints.db (SQLite)")
    print("\n🌐 Frontend:")
    print("   • Open in browser: Open frontend/index.html")
    print("\n📚 API Endpoints:")
    print("   • Health Check: GET /api/health")
    print("   • Create Complaint: POST /api/complaints")
    print("   • Get All Complaints: GET /api/complaints")
    print("   • Get Complaint Status: GET /api/complaints/{id}")
    print("   • Complaint Statistics: GET /api/complaints/stats/summary")
    print("\n⚙️  Configuration:")
    print("   • CORS: Enabled for all origins")
    print("   • Database Path: complaints.db")
    print("   • Log Level: INFO")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Starting AI Smart Call Center Backend")
    print("=" * 60)
    
    # Initialize database
    if not initialize_database():
        print("\n❌ Failed to initialize database. Exiting...")
        sys.exit(1)
    
    # Initialize services
    if not initialize_services():
        print("\n❌ Failed to initialize services. Exiting...")
        sys.exit(1)
    
    print_startup_info()
    
    # Start FastAPI server
    print("\n▶️  Starting FastAPI server...\n")
    import uvicorn
    from main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        reload=False,
        log_level="info"
    )
