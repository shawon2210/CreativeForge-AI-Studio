from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List


class EmotionProfileBase(SQLModel):
    user_id: str = Field(index=True)
    emotion_preferences: Dict = Field(default={}, sa_column=Column(JSON))  # {"happy": 0.8, "sad": 0.2}


class EmotionProfile(EmotionProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GenerationEmotionBase(SQLModel):
    generation_id: int = Field(foreign_key="generation.id")
    emotion: str = Field(index=True)  # "happy", "lonely", "nostalgic"
    intensity: float = Field(default=0.5, ge=0.0, le=1.0)
    visual_params: Dict = Field(default={}, sa_column=Column(JSON))  # Mapped visual parameters
    user_id: str = Field(index=True)


class GenerationEmotion(GenerationEmotionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
