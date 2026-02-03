"""
AI Smart Call Center - Data Models
Defines data structures for complaints and related entities
Using Pydantic for data validation
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ComplaintType(str, Enum):
    """Enum for complaint types"""
    STREET_LIGHT = "Street Light"
    WATER_SUPPLY = "Water Supply"
    ROAD_DAMAGE = "Road Damage"
    GARBAGE = "Garbage"
    DRAINAGE = "Drainage"
    SANITATION = "Sanitation"
    OTHER = "Other"


class ComplaintStatus(str, Enum):
    """Enum for complaint status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REJECTED = "rejected"


class Zone(str, Enum):
    """Enum for zones"""
    NORTH = "North"
    SOUTH = "South"
    EAST = "East"
    WEST = "West"
    CENTRAL = "Central"


class Ward(str, Enum):
    """Enum for wards"""
    WARD_1 = "Ward 1"
    WARD_2 = "Ward 2"
    WARD_3 = "Ward 3"
    WARD_4 = "Ward 4"
    WARD_5 = "Ward 5"
    WARD_6 = "Ward 6"
    WARD_7 = "Ward 7"
    WARD_8 = "Ward 8"


class Priority(str, Enum):
    """Enum for priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ComplaintRequest(BaseModel):
    """Request model for creating a complaint"""
    complaint_type: str = Field(..., description="Type of complaint (Street Light, Water Supply, etc.)")
    house_no: str = Field(default="", description="House or building number")
    area: str = Field(default="", description="Area or locality")
    ward: str = Field(default="", description="Ward number")
    zone: str = Field(default="", description="Zone (North, South, East, West, Central)")
    description: str = Field(default="", description="Detailed complaint description")
    phone_number: str = Field(default="", description="Contact phone number")
    
    class Config:
        json_schema_extra = {
            "example": {
                "complaint_type": "Street Light",
                "house_no": "123",
                "area": "Main Road",
                "ward": "Ward 1",
                "zone": "North",
                "description": "Street light not working for 3 days",
                "phone_number": "9876543210"
            }
        }


class Complaint(BaseModel):
    """Complete complaint model"""
    complaint_id: str = Field(..., description="Unique complaint ID")
    complaint_type: str
    house_no: str = ""
    area: str = ""
    ward: str = ""
    zone: str = ""
    description: str = ""
    phone_number: str = ""
    status: ComplaintStatus = ComplaintStatus.PENDING
    priority: str = "normal"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "complaint_id": "COMP-20260121-ABC12345",
                "complaint_type": "Street Light",
                "house_no": "123",
                "area": "Main Road",
                "ward": "Ward 1",
                "zone": "North",
                "description": "Street light not working",
                "phone_number": "9876543210",
                "status": "pending",
                "priority": "normal"
            }
        }


class ComplaintUpdate(BaseModel):
    """Model for updating complaint status"""
    status: ComplaintStatus
    notes: Optional[str] = None


class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    message: str
    data: Optional[dict] = None


class LocationData(BaseModel):
    """Model for location data"""
    ward: str
    zone: str
    area: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AIProcessRequest(BaseModel):
    """Request model for AI processing"""
    text: str = Field(..., description="User input text")
    context: Optional[dict] = Field(default={}, description="Conversation context")
    language: str = Field(default="en", description="Language code")


class TTSRequest(BaseModel):
    """Request model for Text-to-Speech"""
    text: str = Field(..., description="Text to convert to speech")
    language: str = Field(default="en", description="Language code (en, hi, gu)")
