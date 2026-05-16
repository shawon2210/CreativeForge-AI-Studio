import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.cinematic_ai_service import CinematicAIService

router = APIRouter(prefix="/cinematic-ai", tags=["Cinematic AI"])

# Initialize service with dual mode
service = CinematicAIService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/scenes/")
async def create_scene(
    user_id: str = Body(...),
    scene_name: str = Body(...),
    description: str = Body(...),
    shot_type: str = Body("wide"),
    lighting_setup: str = Body("three_point"),
    color_grade_preset: str = Body("neutral")
):
    """Create a new cinematic scene with camera, lighting, and color settings"""
    try:
        return await service.create_scene(
            user_id, scene_name, description, 
            shot_type, lighting_setup, color_grade_preset
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create scene: {str(e)}")

@router.get("/scenes/")
async def get_user_scenes(
    user_id: str = Query(...),
    status: str = Query(None)
):
    """Get all scenes for a user"""
    try:
        return await service.get_user_scenes(user_id, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scenes: {str(e)}")

@router.put("/scenes/{scene_id}/status/")
async def update_scene_status(
    scene_id: str,
    body: dict = Body(...)
):
    """Update scene status"""
    new_status = body.get("new_status", "")
    try:
        result = await service.update_scene_status(scene_id, new_status)
        if not result:
            raise HTTPException(status_code=404, detail="Scene not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update scene: {str(e)}")
