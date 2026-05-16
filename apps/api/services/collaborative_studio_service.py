import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class CollaborativeStudioService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_sessions = {}
        self.mock_users = {}
        self.mock_updates = {}
        
    async def create_session(
        self,
        project_id: str,
        session_name: str
    ) -> Dict:
        """Create a new collaborative session"""
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        session = {
            "id": session_id,
            "project_id": project_id,
            "session_name": session_name,
            "status": "active",
            "metadata": {},
            "users": [],
            "updates": [],
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_sessions[session_id] = session
            return session
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def join_session(
        self,
        session_id: str,
        user_id: str,
        role: str = "editor"
    ) -> Optional[Dict]:
        """Add a user to a collaborative session"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            if not session:
                return None
            
            user_id_obj = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            user = {
                "id": user_id_obj,
                "session_id": session_id,
                "user_id": user_id,
                "role": role,
                "cursor_position": {},
                "active": True,
                "last_seen": now
            }
            
            self.mock_users[user_id_obj] = user
            session["users"].append(user)
            return user
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def record_update(
        self,
        session_id: str,
        user_id: str,
        update_type: str,
        element_id: Optional[str] = None,
        changes: Optional[Dict] = None
    ) -> Optional[Dict]:
        """Record a session update (edit, cursor move, chat, etc.)"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            if not session:
                return None
            
            update_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            update = {
                "id": update_id,
                "session_id": session_id,
                "user_id": user_id,
                "update_type": update_type,
                "element_id": element_id,
                "changes": changes or {},
                "metadata": {},
                "created_at": now
            }
            
            self.mock_updates[update_id] = update
            session["updates"].append(update)
            return update
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_session_state(
        self,
        session_id: str
    ) -> Optional[Dict]:
        """Get full session state with users and updates"""
        if self.mode == "mock":
            session = self.mock_sessions.get(session_id)
            return session
        else:
            raise NotImplementedError("Prod mode not implemented yet")
