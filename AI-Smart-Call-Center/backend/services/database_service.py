"""
AI Smart Call Center - Database Service
SQLite database for complaint and location data storage
"""

import sqlite3
import os
from datetime import datetime
from typing import List, Optional
from contextlib import contextmanager

from models import Complaint, ComplaintStatus


class DatabaseService:
    """Service class for SQLite database operations"""
    
    def __init__(self, db_path: str = "complaints.db"):
        self.db_path = db_path
        self._initialize_database()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def _initialize_database(self):
        """Initialize database with required tables"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Create complaints table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS complaints (
                    complaint_id TEXT PRIMARY KEY,
                    complaint_type TEXT NOT NULL,
                    house_no TEXT,
                    area TEXT,
                    ward TEXT,
                    zone TEXT,
                    description TEXT,
                    phone_number TEXT,
                    status TEXT DEFAULT 'pending',
                    priority TEXT DEFAULT 'normal',
                    created_at TEXT,
                    updated_at TEXT,
                    assigned_to TEXT,
                    resolution_notes TEXT
                )
            ''')
            
            # Create ward_zone_mapping table for auto-location logic
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ward_zone_mapping (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ward TEXT NOT NULL,
                    zone TEXT NOT NULL,
                    areas TEXT,
                    latitude REAL,
                    longitude REAL
                )
            ''')
            
            # Insert default ward-zone mappings if empty
            cursor.execute('SELECT COUNT(*) FROM ward_zone_mapping')
            if cursor.fetchone()[0] == 0:
                default_mappings = [
                    ('Ward 1', 'North', 'Sector 1, Sector 2, Main Road Area', 23.0225, 72.5714),
                    ('Ward 2', 'North', 'Industrial Estate, Civil Lines', 23.0300, 72.5800),
                    ('Ward 3', 'South', 'Old City, Market Area', 23.0100, 72.5600),
                    ('Ward 4', 'South', 'Railway Station Area, Bus Stand', 23.0050, 72.5650),
                    ('Ward 5', 'East', 'New Development Area, Tech Park', 23.0200, 72.5900),
                    ('Ward 6', 'East', 'Residential Colony, School Area', 23.0250, 72.5950),
                    ('Ward 7', 'West', 'Hospital Area, Government Offices', 23.0175, 72.5500),
                    ('Ward 8', 'Central', 'City Center, Commercial Hub', 23.0225, 72.5714)
                ]
                
                cursor.executemany(
                    'INSERT INTO ward_zone_mapping (ward, zone, areas, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
                    default_mappings
                )
            
            conn.commit()
    
    def save_complaint(self, complaint: Complaint) -> bool:
        """Save a complaint to database"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO complaints 
                    (complaint_id, complaint_type, house_no, area, ward, zone, 
                     description, phone_number, status, priority, created_at, 
                     updated_at, assigned_to, resolution_notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    complaint.complaint_id,
                    complaint.complaint_type,
                    complaint.house_no,
                    complaint.area,
                    complaint.ward,
                    complaint.zone,
                    complaint.description,
                    complaint.phone_number,
                    complaint.status.value if hasattr(complaint.status, 'value') else complaint.status,
                    complaint.priority,
                    complaint.created_at.isoformat() if hasattr(complaint.created_at, 'isoformat') else str(complaint.created_at),
                    complaint.updated_at.isoformat() if hasattr(complaint.updated_at, 'isoformat') else str(complaint.updated_at),
                    complaint.assigned_to,
                    complaint.resolution_notes
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error saving complaint: {e}")
            return False
    
    def get_complaint(self, complaint_id: str) -> Optional[Complaint]:
        """Get a complaint by ID"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM complaints WHERE complaint_id = ?', (complaint_id,))
                row = cursor.fetchone()
                
                if row:
                    return self._row_to_complaint(row)
                return None
        except Exception as e:
            print(f"Error getting complaint: {e}")
            return None
    
    def get_all_complaints(self) -> List[Complaint]:
        """Get all complaints"""
        complaints = []
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM complaints ORDER BY created_at DESC')
                rows = cursor.fetchall()
                
                for row in rows:
                    complaint = self._row_to_complaint(row)
                    if complaint:
                        complaints.append(complaint)
        except Exception as e:
            print(f"Error getting complaints: {e}")
        
        return complaints
    
    def update_complaint_status(self, complaint_id: str, status: str, notes: str = None) -> bool:
        """Update complaint status"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE complaints 
                    SET status = ?, updated_at = ?, resolution_notes = COALESCE(?, resolution_notes)
                    WHERE complaint_id = ?
                ''', (status, datetime.now().isoformat(), notes, complaint_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating complaint: {e}")
            return False
    
    def delete_complaint(self, complaint_id: str) -> bool:
        """Delete a complaint"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM complaints WHERE complaint_id = ?', (complaint_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting complaint: {e}")
            return False
    
    def get_ward_zone_mapping(self, ward: str = None) -> List[dict]:
        """Get ward-zone mappings"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                if ward:
                    cursor.execute('SELECT * FROM ward_zone_mapping WHERE ward = ?', (ward,))
                else:
                    cursor.execute('SELECT * FROM ward_zone_mapping')
                
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error getting ward-zone mapping: {e}")
            return []
    
    def get_statistics(self) -> dict:
        """Get complaint statistics from database"""
        stats = {
            'total': 0,
            'by_status': {},
            'by_type': {},
            'by_zone': {}
        }
        
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Total count
                cursor.execute('SELECT COUNT(*) FROM complaints')
                stats['total'] = cursor.fetchone()[0]
                
                # Count by status
                cursor.execute('SELECT status, COUNT(*) FROM complaints GROUP BY status')
                for row in cursor.fetchall():
                    stats['by_status'][row[0]] = row[1]
                
                # Count by type
                cursor.execute('SELECT complaint_type, COUNT(*) FROM complaints GROUP BY complaint_type')
                for row in cursor.fetchall():
                    stats['by_type'][row[0]] = row[1]
                
                # Count by zone
                cursor.execute('SELECT zone, COUNT(*) FROM complaints GROUP BY zone')
                for row in cursor.fetchall():
                    stats['by_zone'][row[0]] = row[1]
                    
        except Exception as e:
            print(f"Error getting statistics: {e}")
        
        return stats
    
    def _row_to_complaint(self, row) -> Optional[Complaint]:
        """Convert database row to Complaint object"""
        try:
            return Complaint(
                complaint_id=row['complaint_id'],
                complaint_type=row['complaint_type'],
                house_no=row['house_no'] or '',
                area=row['area'] or '',
                ward=row['ward'] or '',
                zone=row['zone'] or '',
                description=row['description'] or '',
                phone_number=row['phone_number'] or '',
                status=ComplaintStatus(row['status']) if row['status'] else ComplaintStatus.PENDING,
                priority=row['priority'] or 'normal',
                created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else datetime.now(),
                updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else datetime.now(),
                assigned_to=row['assigned_to'],
                resolution_notes=row['resolution_notes']
            )
        except Exception as e:
            print(f"Error converting row to complaint: {e}")
            return None


# Singleton instance
db_service = DatabaseService()


def get_db_service() -> DatabaseService:
    """Get the database service instance"""
    return db_service
