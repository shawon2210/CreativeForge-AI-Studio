import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class FutureReadyService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_features = {}
        self.mock_roadmaps = {}
        self.mock_plans = {}
        
    async def create_feature(
        self,
        feature_name: str,
        description: Optional[str] = None,
        category: str = "tech",
        priority: str = "medium",
        target_date: Optional[datetime] = None
    ) -> Dict:
        """Create a new future feature"""
        feature_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        feature = {
            "id": feature_id,
            "feature_name": feature_name,
            "description": description,
            "category": category,
            "priority": priority,
            "status": "planned",
            "target_date": target_date.isoformat() if target_date else None,
            "metadata": {},
            "roadmap_items": [],
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_features[feature_id] = feature
            return feature
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def add_roadmap_item(
        self,
        feature_id: str,
        milestone_name: str,
        target_quarter: str,
        milestone_description: Optional[str] = None,
        dependencies: Optional[List[str]] = None
    ) -> Optional[Dict]:
        """Add a roadmap milestone to a feature"""
        if self.mode == "mock":
            feature = self.mock_features.get(feature_id)
            if not feature:
                return None
            
            roadmap_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            roadmap = {
                "id": roadmap_id,
                "feature_id": feature_id,
                "milestone_name": milestone_name,
                "milestone_description": milestone_description,
                "target_quarter": target_quarter,
                "status": "pending",
                "dependencies": dependencies or [],
                "metadata": {},
                "created_at": now
            }
            
            self.mock_roadmaps[roadmap_id] = roadmap
            feature["roadmap_items"].append(roadmap)
            return roadmap
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_expansion_plan(
        self,
        plan_name: str,
        target_market: str,
        strategy: str,
        budget_allocated: float = 0.0,
        expected_roi: float = 0.0,
        timeline_months: int = 12
    ) -> Dict:
        """Create a new expansion plan"""
        plan_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        plan = {
            "id": plan_id,
            "plan_name": plan_name,
            "target_market": target_market,
            "strategy": strategy,
            "budget_allocated": budget_allocated,
            "expected_roi": expected_roi,
            "timeline_months": timeline_months,
            "status": "draft",
            "metadata": {},
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_plans[plan_id] = plan
            return plan
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_feature_with_roadmap(
        self,
        feature_id: str
    ) -> Optional[Dict]:
        """Get future feature with all roadmap items"""
        if self.mode == "mock":
            feature = self.mock_features.get(feature_id)
            return feature
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_all_features(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict]:
        """Get all future features, optionally filtered"""
        if self.mode == "mock":
            features = list(self.mock_features.values())
            if category:
                features = [f for f in features if f["category"] == category]
            if status:
                features = [f for f in features if f["status"] == status]
            return features
        else:
            raise NotImplementedError("Prod mode not implemented yet")
