import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class CinematicAIService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_scenes = {}
        self.mock_camera_settings = {}
        self.mock_lighting_rigs = {}
        self.mock_color_grades = {}
        
    def _generate_camera_settings(self, scene_id: str, shot_type: str = "wide") -> Dict:
        """Generate mock camera settings based on shot type"""
        settings_map = {
            "wide": {"focal_length": 24, "aperture": 5.6, "movement": "static"},
            "close": {"focal_length": 85, "aperture": 1.8, "movement": "static"},
            "medium": {"focal_length": 50, "aperture": 2.8, "movement": "static"},
            "dutch": {"focal_length": 35, "aperture": 2.8, "angle": "dutch", "movement": "tilt"},
        }
        settings = settings_map.get(shot_type, settings_map["wide"])
        settings["id"] = str(uuid.uuid4())
        settings["scene_id"] = scene_id
        settings["created_at"] = datetime.utcnow().isoformat()
        return settings
    
    def _generate_lighting_rig(self, scene_id: str, setup_type: str = "three_point") -> Dict:
        """Generate mock lighting rig"""
        rig_map = {
            "three_point": {"key_light_intensity": 1.0, "fill_light_intensity": 0.5, "back_light_intensity": 0.8},
            "natural": {"key_light_intensity": 0.7, "fill_light_intensity": 0.3, "back_light_intensity": 0.0},
            "dramatic": {"key_light_intensity": 1.5, "fill_light_intensity": 0.2, "back_light_intensity": 1.0},
            "rim": {"key_light_intensity": 0.5, "fill_light_intensity": 0.0, "back_light_intensity": 1.2},
        }
        rig = rig_map.get(setup_type, rig_map["three_point"])
        rig["id"] = str(uuid.uuid4())
        rig["scene_id"] = scene_id
        rig["setup_type"] = setup_type
        rig["created_at"] = datetime.utcnow().isoformat()
        return rig
    
    def _generate_color_grade(self, scene_id: str, lut_preset: str = "neutral") -> Dict:
        """Generate mock color grade"""
        grade_map = {
            "neutral": {"contrast": 1.0, "saturation": 1.0, "temperature": 0.0},
            "teal_orange": {"contrast": 1.2, "saturation": 1.1, "temperature": -10.0},
            "warm": {"contrast": 1.0, "saturation": 0.9, "temperature": 30.0},
            "cool": {"contrast": 1.1, "saturation": 0.8, "temperature": -30.0},
        }
        grade = grade_map.get(lut_preset, grade_map["neutral"])
        grade["id"] = str(uuid.uuid4())
        grade["scene_id"] = scene_id
        grade["lut_preset"] = lut_preset
        grade["created_at"] = datetime.utcnow().isoformat()
        return grade
    
    async def create_scene(
        self,
        user_id: str,
        scene_name: str,
        description: str,
        shot_type: str = "wide",
        lighting_setup: str = "three_point",
        color_grade_preset: str = "neutral"
    ) -> Dict:
        """Create a new cinematic scene with camera, lighting, and color settings"""
        scene_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Generate associated settings
        camera_settings = self._generate_camera_settings(scene_id, shot_type)
        lighting_rig = self._generate_lighting_rig(scene_id, lighting_setup)
        color_grade = self._generate_color_grade(scene_id, color_grade_preset)
        
        scene = {
            "id": scene_id,
            "user_id": user_id,
            "scene_name": scene_name,
            "description": description,
            "status": "draft",
            "camera_settings": camera_settings,
            "lighting_rig": lighting_rig,
            "color_grade": color_grade,
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_scenes[scene_id] = scene
            self.mock_camera_settings[camera_settings["id"]] = camera_settings
            self.mock_lighting_rigs[lighting_rig["id"]] = lighting_rig
            self.mock_color_grades[color_grade["id"]] = color_grade
            return scene
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_user_scenes(
        self,
        user_id: str,
        status: Optional[str] = None
    ) -> List[Dict]:
        """Get all scenes for a user"""
        if self.mode == "mock":
            scenes = list(self.mock_scenes.values())
            scenes = [s for s in scenes if s["user_id"] == user_id]
            if status:
                scenes = [s for s in scenes if s["status"] == status]
            return scenes
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def update_scene_status(self, scene_id: str, new_status: str) -> Optional[Dict]:
        """Update scene status (e.g., to rendering, completed)"""
        if self.mode == "mock":
            scene = self.mock_scenes.get(scene_id)
            if not scene:
                return None
            scene["status"] = new_status
            scene["updated_at"] = datetime.utcnow().isoformat()
            return scene
        else:
            raise NotImplementedError("Prod mode not implemented yet")
