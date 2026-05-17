import os
import sys
from pathlib import Path
from fastapi import APIRouter, Body
from typing import Dict, Optional

# Add apps/api to Python path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.emotion_service import (
    detect_emotion_from_prompt,
    map_emotion_to_visual_params,
    get_user_emotion_profile,
    update_emotion_profile,
    add_generation_emotion
)
from models.emotion_ai import EmotionProfile, GenerationEmotion

router = APIRouter(prefix="/emotion", tags=["Emotional AI"])

@router.post("/analyze/")
async def analyze_emotion_endpoint(body: dict = Body(...)):
    prompt = body.get("prompt", "")
    return detect_emotion_from_prompt(prompt=prompt)

@router.post("/map-visuals/", response_model=Dict)
async def map_visuals_endpoint(emotion: str = Body(...), intensity: float = Body(...)):
    return map_emotion_to_visual_params(emotion=emotion, intensity=intensity)

@router.get("/profile/{user_id}", response_model=Optional[EmotionProfile])
async def get_profile_endpoint(user_id: str):
    return get_user_emotion_profile(user_id=user_id)

@router.post("/profile/update/", response_model=EmotionProfile)
async def update_profile_endpoint(
    user_id: str = Body(...),
    emotion: str = Body(...),
    score: float = Body(...)
):
    return update_emotion_profile(user_id=user_id, emotion=emotion, score=score)

@router.post("/generation/", response_model=GenerationEmotion)
async def add_generation_emotion_endpoint(
    generation_id: int = Body(...),
    emotion: str = Body(...),
    intensity: float = Body(...),
    user_id: str = Body(...)
):
    return add_generation_emotion(
        generation_id=generation_id, emotion=emotion,
        intensity=intensity, user_id=user_id
    )
