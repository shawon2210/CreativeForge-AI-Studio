import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.generative_ui_service import GenerativeUIService

router = APIRouter(prefix="/generative-ui", tags=["Generative UI"])

# Initialize service with dual mode
service = GenerativeUIService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/uis/")
async def create_ui(
    user_id: str = Body(...),
    ui_name: str = Body(...),
    prompt_used: str = Body(...),
    ui_type: str = Body("dashboard"),
    description: str = Body(None)
):
    """Create a new generative UI from a prompt"""
    try:
        return await service.create_ui(user_id, ui_name, prompt_used, ui_type, description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create UI: {str(e)}")

@router.get("/uis/")
async def get_user_uis(
    user_id: str = Query(...),
    status: str = Query(None)
):
    """Get all generative UIs for a user"""
    try:
        return await service.get_user_uis(user_id, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get UIs: {str(e)}")

@router.get("/uis/{ui_id}/components/")
async def get_ui_components(ui_id: str):
    """Get all components for a UI"""
    try:
        return await service.get_ui_components(ui_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get components: {str(e)}")

@router.put("/uis/{ui_id}/status/")
async def update_ui_status(
    ui_id: str,
    body: dict = Body(...)
):
    """Update UI status (mock mode - returns success)"""
    try:
        # In mock mode, just return success
        return {"status": "updated", "ui_id": ui_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update UI: {str(e)}")
