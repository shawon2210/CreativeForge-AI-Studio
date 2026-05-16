import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class GenerativeUIService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_uis = {}
        self.mock_components = {}
        self.mock_layouts = {}
        
    def _generate_components(self, ui_id: str, ui_type: str) -> List[Dict]:
        """Generate mock UI components based on UI type"""
        components = []
        base_id = str(uuid.uuid4())
        
        if ui_type == "dashboard":
            component_types = ["chart", "table", "stat", "card"]
        elif ui_type == "form":
            component_types = ["input", "select", "button", "checkbox"]
        elif ui_type == "gallery":
            component_types = ["image", "video", "card", "modal"]
        else:
            component_types = ["text", "button", "divider"]
        
        for i, comp_type in enumerate(component_types):
            comp_id = str(uuid.uuid4())
            component = {
                "id": comp_id,
                "generated_ui_id": ui_id,
                "component_type": comp_type,
                "component_name": f"{comp_type}_{i+1}",
                "properties": {"label": f"Generated {comp_type}"},
                "position": {"x": i * 100, "y": 0, "width": 80, "height": 60},
                "styles": {"padding": "10px", "margin": "5px"},
                "created_at": datetime.utcnow().isoformat()
            }
            components.append(component)
            if self.mode == "mock":
                self.mock_components[comp_id] = component
        
        return components
    
    async def create_ui(
        self,
        user_id: str,
        ui_name: str,
        prompt_used: str,
        ui_type: str = "dashboard",
        description: Optional[str] = None
    ) -> Dict:
        """Create a new generative UI from a prompt"""
        ui_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Generate components based on UI type
        components = self._generate_components(ui_id, ui_type)
        
        ui = {
            "id": ui_id,
            "user_id": user_id,
            "ui_name": ui_name,
            "description": description,
            "prompt_used": prompt_used,
            "ui_type": ui_type,
            "status": "completed",  # Mock completes immediately
            "metadata": {"generated_from": "mock"},
            "components": components,
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_uis[ui_id] = ui
            return ui
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_user_uis(
        self,
        user_id: str,
        status: Optional[str] = None
    ) -> List[Dict]:
        """Get all generative UIs for a user"""
        if self.mode == "mock":
            uis = list(self.mock_uis.values())
            uis = [u for u in uis if u["user_id"] == user_id]
            if status:
                uis = [u for u in uis if u["status"] == status]
            return uis
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_ui_components(
        self,
        ui_id: str
    ) -> List[Dict]:
        """Get all components for a UI"""
        if self.mode == "mock":
            ui = self.mock_uis.get(ui_id)
            if not ui:
                return []
            return ui.get("components", [])
        else:
            raise NotImplementedError("Prod mode not implemented yet")
