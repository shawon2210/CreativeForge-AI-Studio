import os
from typing import Dict, Optional, List
from datetime import datetime
from sqlmodel import Session, select

from ..models.emotion_ai import EmotionProfile, GenerationEmotion

# Dual mode
MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_emotion_profiles: Dict[str, EmotionProfile] = {}  # user_id -> profile
_mock_generation_emotions: List[GenerationEmotion] = []
_mock_eid = 1


# ---------- Emotion Detection ----------
def detect_emotion_from_prompt(prompt: str) -> Dict[str, float]:
    """Mock emotion detection from prompt (keyword matching)"""
    prompt_lower = prompt.lower()
    emotions = {
        "happy": ["happy", "joy", "bright", "sunny", "cheerful"],
        "sad": ["sad", "lonely", "grief", "tear", "melancholy"],
        "angry": ["angry", "furious", "rage", "fight", "war"],
        "nostalgic": ["nostalgia", "memory", "past", "old", "vintage"],
        "fear": ["fear", "scary", "terror", "horror", "dark"],
        "calm": ["calm", "peace", "quiet", "serene", "tranquil"]
    }
    scores = {e: 0.0 for e in emotions.keys()}
    for emotion, keywords in emotions.items():
        for kw in keywords:
            if kw in prompt_lower:
                scores[emotion] += 0.3
    # Normalize to 0-1
    total = sum(scores.values())
    if total > 0:
        scores = {k: min(v/total, 1.0) for k, v in scores.items()}
    return scores


# ---------- Visual Parameter Mapping ----------
def map_emotion_to_visual_params(emotion: str, intensity: float) -> Dict:
    """Map emotion + intensity to visual generation parameters"""
    mappings = {
        "happy": {
            "color_grading": "warm", "lighting": "bright", "saturation": 1.2,
            "atmosphere": "cheerful", "contrast": 0.8
        },
        "sad": {
            "color_grading": "cool", "lighting": "dim", "saturation": 0.7,
            "atmosphere": "melancholy", "contrast": 1.2
        },
        "angry": {
            "color_grading": "red-orange", "lighting": "harsh", "saturation": 1.5,
            "atmosphere": "agressive", "contrast": 1.5
        },
        "nostalgic": {
            "color_grading": "sepia", "lighting": "soft", "saturation": 0.8,
            "atmosphere": "warm_memory", "contrast": 0.9
        },
        "fear": {
            "color_grading": "dark", "lighting": "low", "saturation": 0.5,
            "atmosphere": "tense", "contrast": 1.4
        },
        "calm": {
            "color_grading": "neutral", "lighting": "soft", "saturation": 0.9,
            "atmosphere": "peaceful", "contrast": 0.7
        }
    }
    base = mappings.get(emotion, mappings["calm"])
    # Scale visual params by intensity
    scaled = {k: v * intensity for k, v in base.items() if isinstance(v, (int, float))}
    scaled["atmosphere"] = base["atmosphere"]
    scaled["color_grading"] = base["color_grading"]
    return scaled


# ---------- User Emotion Profile ----------
def get_user_emotion_profile(user_id: str) -> Optional[EmotionProfile]:
    if MODE == "mock":
        return _mock_emotion_profiles.get(user_id)
    from app.database import engine
    with Session(engine) as session:
        return session.exec(select(EmotionProfile).where(EmotionProfile.user_id == user_id)).first()


def update_emotion_profile(user_id: str, emotion: str, score: float) -> EmotionProfile:
    if MODE == "mock":
        profile = _mock_emotion_profiles.get(user_id)
        if not profile:
            profile = EmotionProfile(user_id=user_id, emotion_preferences={emotion: score})
            _mock_emotion_profiles[user_id] = profile
        else:
            prefs = profile.emotion_preferences.copy()
            prefs[emotion] = score
            profile.emotion_preferences = prefs
            profile.updated_at = datetime.utcnow()
        return profile
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        profile = session.exec(select(EmotionProfile).where(EmotionProfile.user_id == user_id)).first()
        if not profile:
            profile = EmotionProfile(user_id=user_id, emotion_preferences={emotion: score})
            session.add(profile)
        else:
            prefs = profile.emotion_preferences.copy()
            prefs[emotion] = score
            profile.emotion_preferences = prefs
            profile.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(profile)
        return profile


# ---------- Generation Emotion ----------
def add_generation_emotion(generation_id: int, emotion: str, intensity: float, user_id: str) -> GenerationEmotion:
    visual_params = map_emotion_to_visual_params(emotion, intensity)
    if MODE == "mock":
        global _mock_eid
        ge = GenerationEmotion(
            id=_mock_eid, generation_id=generation_id, emotion=emotion,
            intensity=intensity, visual_params=visual_params, user_id=user_id
        )
        _mock_generation_emotions.append(ge)
        _mock_eid += 1
        return ge
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        ge = GenerationEmotion(
            generation_id=generation_id, emotion=emotion,
            intensity=intensity, visual_params=visual_params, user_id=user_id
        )
        session.add(ge)
        session.commit()
        session.refresh(ge)
        return ge
