import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class TimelineVersioningService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_events = {}
        self.mock_versions = {}
        self.mock_changes = {}
        
    async def create_timeline_event(
        self,
        user_id: str,
        project_id: str,
        event_type: str,
        event_name: str,
        description: Optional[str] = None
    ) -> Dict:
        """Create a new timeline event"""
        event_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        event = {
            "id": event_id,
            "user_id": user_id,
            "project_id": project_id,
            "event_type": event_type,
            "event_name": event_name,
            "description": description,
            "metadata": {},
            "created_at": now,
            "version_records": []
        }
        
        if self.mode == "mock":
            self.mock_events[event_id] = event
            return event
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_version(
        self,
        timeline_event_id: str,
        version_number: str,
        version_type: str = "minor",
        changes: Optional[Dict] = None
    ) -> Optional[Dict]:
        """Create a new version record"""
        if self.mode == "mock":
            event = self.mock_events.get(timeline_event_id)
            if not event:
                return None
            
            version_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            # Mark all other versions as not current
            for ver in event.get("version_records", []):
                ver["is_current"] = False
            
            version = {
                "id": version_id,
                "timeline_event_id": timeline_event_id,
                "version_number": version_number,
                "version_type": version_type,
                "changes": changes or {},
                "is_current": True,
                "created_at": now
            }
            
            self.mock_versions[version_id] = version
            event["version_records"].append(version)
            return version
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_project_timeline(
        self,
        project_id: str,
        event_type: Optional[str] = None
    ) -> List[Dict]:
        """Get all timeline events for a project"""
        if self.mode == "mock":
            events = list(self.mock_events.values())
            events = [e for e in events if e["project_id"] == project_id]
            if event_type:
                events = [e for e in events if e["event_type"] == event_type]
            return events
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_version_history(
        self,
        timeline_event_id: str
    ) -> List[Dict]:
        """Get version history for a timeline event"""
        if self.mode == "mock":
            event = self.mock_events.get(timeline_event_id)
            if not event:
                return []
            return event.get("version_records", [])
        else:
            raise NotImplementedError("Prod mode not implemented yet")
