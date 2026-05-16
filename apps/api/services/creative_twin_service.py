import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class CreativeTwinService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_twins = {}
        self.mock_learnings = {}
        self.mock_suggestions = {}
        
    async def create_twin(
        self,
        user_id: str,
        twin_name: str,
        personality_profile: Optional[Dict] = None,
        skill_level: str = "intermediate",
        specialization: str = ""
    ) -> Dict:
        """Create a new creative twin"""
        twin_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        twin = {
            "id": twin_id,
            "user_id": user_id,
            "twin_name": twin_name,
            "personality_profile": personality_profile or {},
            "skill_level": skill_level,
            "specialization": specialization,
            "metadata": {},
            "learnings": [],
            "suggestions": [],
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_twins[twin_id] = twin
            return twin
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def record_learning(
        self,
        twin_id: str,
        learning_type: str,
        learning_data: Dict,
        confidence: float = 0.0
    ) -> Optional[Dict]:
        """Record a learning for the twin"""
        if self.mode == "mock":
            twin = self.mock_twins.get(twin_id)
            if not twin:
                return None
            
            learning_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            learning = {
                "id": learning_id,
                "twin_id": twin_id,
                "learning_type": learning_type,
                "learning_data": learning_data,
                "confidence": confidence,
                "applied": False,
                "created_at": now
            }
            
            self.mock_learnings[learning_id] = learning
            twin["learnings"].append(learning)
            return learning
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def generate_suggestion(
        self,
        twin_id: str,
        suggestion_type: str,
        suggestion_text: str,
        relevance_score: float = 0.0
    ) -> Optional[Dict]:
        """Generate a suggestion from the twin"""
        if self.mode == "mock":
            twin = self.mock_twins.get(twin_id)
            if not twin:
                return None
            
            suggestion_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            suggestion = {
                "id": suggestion_id,
                "twin_id": twin_id,
                "suggestion_type": suggestion_type,
                "suggestion_text": suggestion_text,
                "relevance_score": relevance_score,
                "accepted": False,
                "metadata": {},
                "created_at": now
            }
            
            self.mock_suggestions[suggestion_id] = suggestion
            twin["suggestions"].append(suggestion)
            return suggestion
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_twin_profile(
        self,
        twin_id: str
    ) -> Optional[Dict]:
        """Get full twin profile with learnings and suggestions"""
        if self.mode == "mock":
            twin = self.mock_twins.get(twin_id)
            return twin
        else:
            raise NotImplementedError("Prod mode not implemented yet")
