import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.timeline_versioning_service import TimelineVersioningService

router = APIRouter(prefix="/timeline", tags=["Timeline & Versioning"])

# Initialize service with dual mode
service = TimelineVersioningService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/events/")
async def create_timeline_event(
    user_id: str = Body(...),
    project_id: str = Body(...),
    event_type: str = Body(...),
    event_name: str = Body(...),
    description: str = Body(None)
):
    """Create a new timeline event"""
    try:
        return await service.create_timeline_event(
            user_id, project_id, event_type, event_name, description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")

@router.post("/versions/")
async def create_version(
    timeline_event_id: str = Body(...),
    version_number: str = Body(...),
    version_type: str = Body("minor"),
    changes: dict = Body({})
):
    """Create a new version record"""
    try:
        result = await service.create_version(
            timeline_event_id, version_number, version_type, changes
        )
        if not result:
            raise HTTPException(status_code=404, detail="Timeline event not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create version: {str(e)}")

@router.get("/events/")
async def get_project_timeline(
    project_id: str = Query(...),
    event_type: str = Query(None)
):
    """Get all timeline events for a project"""
    try:
        return await service.get_project_timeline(project_id, event_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get timeline: {str(e)}")

@router.get("/events/{event_id}/versions/")
async def get_version_history(event_id: str):
    """Get version history for a timeline event"""
    try:
        return await service.get_version_history(event_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get versions: {str(e)}")
