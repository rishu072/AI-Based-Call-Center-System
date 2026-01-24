"""
AI Smart Call Center - Complaint Routes
API endpoints for complaint management using FastAPI
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel
from services.complaint_service import get_complaint_service
from services.database_service import get_db_service
from models import ComplaintRequest, ComplaintStatus

# Create router
router = APIRouter()

# Get service instances
complaint_service = get_complaint_service()
db_service = get_db_service()


# ===== Request/Response Models =====
class ComplaintCreateRequest(BaseModel):
    complaint_type: str
    house_no: str = ""
    area: str = ""
    ward: str = ""
    zone: str = ""
    description: str = ""
    phone_number: str = ""


class StatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


# ===== API Endpoints =====
@router.post("")
async def create_complaint(request: ComplaintCreateRequest):
    """Create a new complaint"""
    try:
        # Create complaint request object
        complaint_request = ComplaintRequest(
            complaint_type=request.complaint_type,
            house_no=request.house_no,
            area=request.area,
            ward=request.ward,
            zone=request.zone,
            description=request.description,
            phone_number=request.phone_number
        )
        
        # Create complaint
        complaint = complaint_service.create_complaint(complaint_request)
        
        # Save to database
        db_service.save_complaint(complaint)
        
        return {
            "success": True,
            "message": "Complaint created successfully",
            "complaint_id": complaint.complaint_id,
            "data": {
                "complaint_id": complaint.complaint_id,
                "status": complaint.status.value,
                "created_at": complaint.created_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_all_complaints():
    """Get all complaints"""
    try:
        # Try database first, fallback to in-memory
        complaints = db_service.get_all_complaints()
        if not complaints:
            complaints = complaint_service.get_all_complaints()
        
        return {
            "success": True,
            "count": len(complaints),
            "data": [
                {
                    "complaint_id": c.complaint_id,
                    "complaint_type": c.complaint_type,
                    "area": c.area,
                    "ward": c.ward,
                    "zone": c.zone,
                    "status": c.status.value if hasattr(c.status, 'value') else c.status,
                    "created_at": c.created_at.isoformat() if hasattr(c.created_at, 'isoformat') else str(c.created_at),
                    "phone_number": c.phone_number
                }
                for c in complaints
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    """Get a specific complaint by ID"""
    try:
        # Try database first
        complaint = db_service.get_complaint(complaint_id)
        if not complaint:
            complaint = complaint_service.get_complaint(complaint_id)
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        return {
            "success": True,
            "data": {
                "complaint_id": complaint.complaint_id,
                "complaint_type": complaint.complaint_type,
                "house_no": complaint.house_no,
                "area": complaint.area,
                "ward": complaint.ward,
                "zone": complaint.zone,
                "description": complaint.description,
                "phone_number": complaint.phone_number,
                "status": complaint.status.value if hasattr(complaint.status, 'value') else complaint.status,
                "priority": complaint.priority,
                "created_at": complaint.created_at.isoformat() if hasattr(complaint.created_at, 'isoformat') else str(complaint.created_at),
                "updated_at": complaint.updated_at.isoformat() if hasattr(complaint.updated_at, 'isoformat') else str(complaint.updated_at),
                "assigned_to": complaint.assigned_to,
                "resolution_notes": complaint.resolution_notes
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{complaint_id}")
async def update_complaint(complaint_id: str, request: StatusUpdateRequest):
    """Update complaint status"""
    try:
        # Convert string to enum
        try:
            status = ComplaintStatus(request.status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {request.status}")
        
        complaint = complaint_service.update_complaint_status(
            complaint_id, 
            status, 
            request.notes
        )
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update in database
        db_service.update_complaint_status(complaint_id, status.value, request.notes)
        
        return {
            "success": True,
            "message": "Complaint updated successfully",
            "data": {
                "complaint_id": complaint.complaint_id,
                "status": complaint.status.value,
                "updated_at": complaint.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{complaint_id}")
async def delete_complaint(complaint_id: str):
    """Delete a complaint"""
    try:
        success = complaint_service.delete_complaint(complaint_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Delete from database
        db_service.delete_complaint(complaint_id)
        
        return {
            "success": True,
            "message": "Complaint deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/query")
async def search_complaints(q: str = Query(..., description="Search query")):
    """Search complaints"""
    try:
        complaints = complaint_service.search_complaints(q)
        
        return {
            "success": True,
            "count": len(complaints),
            "data": [
                {
                    "complaint_id": c.complaint_id,
                    "complaint_type": c.complaint_type,
                    "area": c.area,
                    "status": c.status.value if hasattr(c.status, 'value') else c.status
                }
                for c in complaints
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/summary")
async def get_statistics():
    """Get complaint statistics"""
    try:
        stats = complaint_service.get_statistics()
        
        return {
            "success": True,
            "data": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
