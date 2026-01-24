"""
AI Smart Call Center - Complaint Service
Handles complaint management operations
"""

from datetime import datetime
from typing import Dict, List, Optional
from utils.id_generator import generate_complaint_id
from models import Complaint, ComplaintStatus, ComplaintRequest


class ComplaintService:
    """Service class for complaint management"""
    
    def __init__(self):
        # In-memory storage (replace with database in production)
        self.complaints: Dict[str, Complaint] = {}
    
    def create_complaint(self, data: ComplaintRequest) -> Complaint:
        """
        Create a new complaint
        
        Args:
            data: ComplaintRequest with complaint details
            
        Returns:
            Created Complaint object
        """
        complaint_id = generate_complaint_id()
        
        complaint = Complaint(
            complaint_id=complaint_id,
            complaint_type=data.complaint_type,
            house_no=data.house_no,
            area=data.area,
            ward=data.ward,
            zone=data.zone,
            description=data.description,
            phone_number=data.phone_number,
            status=ComplaintStatus.PENDING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Store complaint
        self.complaints[complaint_id] = complaint
        
        return complaint
    
    def get_complaint(self, complaint_id: str) -> Optional[Complaint]:
        """
        Get complaint by ID
        
        Args:
            complaint_id: Unique complaint identifier
            
        Returns:
            Complaint object or None if not found
        """
        return self.complaints.get(complaint_id)
    
    def get_all_complaints(self) -> List[Complaint]:
        """
        Get all complaints
        
        Returns:
            List of all complaints
        """
        return list(self.complaints.values())
    
    def get_complaints_by_status(self, status: ComplaintStatus) -> List[Complaint]:
        """
        Get complaints filtered by status
        
        Args:
            status: Complaint status to filter by
            
        Returns:
            List of matching complaints
        """
        return [c for c in self.complaints.values() if c.status == status]
    
    def get_complaints_by_type(self, complaint_type: str) -> List[Complaint]:
        """
        Get complaints filtered by type
        
        Args:
            complaint_type: Type of complaint
            
        Returns:
            List of matching complaints
        """
        return [c for c in self.complaints.values() if c.complaint_type == complaint_type]
    
    def update_complaint_status(
        self, 
        complaint_id: str, 
        status: ComplaintStatus,
        notes: Optional[str] = None
    ) -> Optional[Complaint]:
        """
        Update complaint status
        
        Args:
            complaint_id: Unique complaint identifier
            status: New status
            notes: Optional resolution notes
            
        Returns:
            Updated Complaint object or None if not found
        """
        complaint = self.complaints.get(complaint_id)
        if complaint:
            complaint.status = status
            complaint.updated_at = datetime.now()
            if notes:
                complaint.resolution_notes = notes
            return complaint
        return None
    
    def assign_complaint(self, complaint_id: str, assignee: str) -> Optional[Complaint]:
        """
        Assign complaint to a worker
        
        Args:
            complaint_id: Unique complaint identifier
            assignee: Name/ID of assignee
            
        Returns:
            Updated Complaint object or None if not found
        """
        complaint = self.complaints.get(complaint_id)
        if complaint:
            complaint.assigned_to = assignee
            complaint.status = ComplaintStatus.IN_PROGRESS
            complaint.updated_at = datetime.now()
            return complaint
        return None
    
    def search_complaints(self, query: str) -> List[Complaint]:
        """
        Search complaints by any field
        
        Args:
            query: Search query
            
        Returns:
            List of matching complaints
        """
        query_lower = query.lower()
        results = []
        
        for complaint in self.complaints.values():
            # Search in multiple fields
            searchable = [
                complaint.complaint_id.lower(),
                complaint.complaint_type.lower(),
                complaint.area.lower(),
                complaint.description.lower(),
                complaint.phone_number
            ]
            
            if any(query_lower in field for field in searchable):
                results.append(complaint)
        
        return results
    
    def get_statistics(self) -> dict:
        """
        Get complaint statistics
        
        Returns:
            Dictionary with statistics
        """
        total = len(self.complaints)
        
        stats = {
            'total': total,
            'by_status': {},
            'by_type': {}
        }
        
        # Count by status
        for status in ComplaintStatus:
            count = len([c for c in self.complaints.values() if c.status == status])
            stats['by_status'][status.value] = count
        
        # Count by type
        types = set(c.complaint_type for c in self.complaints.values())
        for complaint_type in types:
            count = len([c for c in self.complaints.values() if c.complaint_type == complaint_type])
            stats['by_type'][complaint_type] = count
        
        return stats
    
    def delete_complaint(self, complaint_id: str) -> bool:
        """
        Delete a complaint
        
        Args:
            complaint_id: Unique complaint identifier
            
        Returns:
            True if deleted, False if not found
        """
        if complaint_id in self.complaints:
            del self.complaints[complaint_id]
            return True
        return False


# Singleton instance
complaint_service = ComplaintService()


def get_complaint_service() -> ComplaintService:
    """Get the complaint service instance"""
    return complaint_service
