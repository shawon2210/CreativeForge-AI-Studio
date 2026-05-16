import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.creative_twin_service import CreativeTwinService

router = APIRouter(prefix="/creative-twin", tags=["Personal AI Creative Twin"])

# Initialize service with dual mode
service = CreativeTwinService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/twins/")
async def create_twin(
    user_id: str = Body(...),
    twin_name: str = Body(...),
    personality_profile: dict = Body({}),
    skill_level: str = Body("intermediate"),
    specialization: str = Body("")
):
    """Create a new creative twin"""
    try:
        return await service.create_twin(
            user_id, twin_name, personality_profile, skill_level, specialization
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create twin: {str(e)}")

@router.post("/learnings/")
async def record_learning(
    twin_id: str = Body(...),
    learning_type: str = Body(...),
    learning_data: dict = Body(...),
    confidence: float = Body(0.0)
):
    """Record a learning for the twin"""
    try:
        result = await service.record_learning(
            twin_id, learning_type, learning_data, confidence
        )
        if not result:
            raise HTTPException(status_code=404, detail="Twin not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record learning: {str(e)}")

@router.post("/suggestions/")
async def generate_suggestion(
    twin_id: str = Body(...),
    suggestion_type: str = Body(...),
    suggestion_text: str = Body(...),
    relevance_score: float = Body(0.0)
):
    """Generate a suggestion from the twin"""
    try:
        result = await service.generate_suggestion(
            twin_id, suggestion_type, suggestion_text, relevance_score
        )
        if not result:
            raise HTTPException(status_code=404, detail="Twin not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestion: {str(e)}")

@router.get("/twins/{twin_id}/")
async def get_twin_profile(twin_id: str):
    """Get full twin profile with learnings and suggestions"""
    try:
        result = await service.get_twin_profile(twin_id)
        if not result:
            raise HTTPException(status_code=404, detail="Twin not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get twin: {str(e)}")
