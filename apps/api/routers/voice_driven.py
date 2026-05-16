import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.voice_driven_service import VoiceDrivenService

router = APIRouter(prefix="/voice-driven", tags=["Voice-Driven Creation"])

# Initialize service with dual mode
service = VoiceDrivenService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/sessions/")
async def create_session(
    user_id: str = Body(...),
    session_name: str = Body(...)
):
    """Create a new voice session"""
    try:
        return await service.create_session(user_id, session_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.post("/commands/")
async def process_command(
    session_id: str = Body(...),
    user_id: str = Body(...),
    command_text: str = Body(...),
    confidence_score: float = Body(1.0)
):
    """Process a voice command"""
    try:
        result = await service.process_command(
            session_id, user_id, command_text, confidence_score
        )
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process command: {str(e)}")

@router.post("/transcripts/")
async def create_transcript(
    session_id: str = Body(...),
    transcript_text: str = Body(...),
    audio_url: str = Body(None),
    language: str = Body("en-US"),
    duration_seconds: float = Body(0.0)
):
    """Create a voice transcript"""
    try:
        result = await service.create_transcript(
            session_id, transcript_text, audio_url, language, duration_seconds
        )
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create transcript: {str(e)}")

@router.get("/sessions/{session_id}/")
async def get_session_history(session_id: str):
    """Get full session history with commands and transcripts"""
    try:
        result = await service.get_session_history(session_id)
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")
