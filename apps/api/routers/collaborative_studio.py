import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.collaborative_studio_service import CollaborativeStudioService

router = APIRouter(prefix="/collaborative-studio", tags=["Real-Time Collaborative AI Studio"])

# Initialize service with dual mode
service = CollaborativeStudioService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/sessions/")
async def create_session(
    project_id: str = Body(...),
    session_name: str = Body(...)
):
    """Create a new collaborative session"""
    try:
        return await service.create_session(project_id, session_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.post("/sessions/join/")
async def join_session(
    session_id: str = Body(...),
    user_id: str = Body(...),
    role: str = Body("editor")
):
    """Add a user to a collaborative session"""
    try:
        result = await service.join_session(session_id, user_id, role)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join session: {str(e)}")

@router.post("/updates/")
async def record_update(
    session_id: str = Body(...),
    user_id: str = Body(...),
    update_type: str = Body(...),
    element_id: str = Body(None),
    changes: dict = Body({})
):
    """Record a session update (edit, cursor move, chat, etc.)"""
    try:
        result = await service.record_update(
            session_id, user_id, update_type, element_id, changes
        )
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record update: {str(e)}")

@router.get("/sessions/{session_id}/")
async def get_session_state(session_id: str):
    """Get full session state with users and updates"""
    try:
        result = await service.get_session_state(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")
