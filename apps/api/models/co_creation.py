from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List, Any


class CoCreationSessionBase(SQLModel):
    user_id: str = Field(index=True)
    session_type: str = Field(default="text")  # "text", "image", "video"
    context: Dict = Field(default={}, sa_column=Column(JSON))
    status: str = Field(default="active")  # "active", "paused", "completed"


class CoCreationSession(CoCreationSessionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = Field(default=None)


class LiveSuggestionBase(SQLModel):
    session_id: int = Field(foreign_key="cocreationsession.id")
    suggestion_type: str = Field(index=True)  # "prompt_completion", "preview", "alternative"
    content: str
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    position: int = Field(default=0)  # Cursor position when suggestion was generated
    user_id: str = Field(index=True)


class LiveSuggestion(LiveSuggestionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted: bool = Field(default=False)


class PredictiveStateBase(SQLModel):
    session_id: int = Field(foreign_key="cocreationsession.id")
    predicted_intent: Dict = Field(default={}, sa_column=Column(JSON))
    predicted_elements: List[str] = Field(default=[], sa_column=Column(JSON))
    confidence_scores: Dict = Field(default={}, sa_column=Column(JSON))
    user_id: str = Field(index=True)


class PredictiveState(PredictiveStateBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
