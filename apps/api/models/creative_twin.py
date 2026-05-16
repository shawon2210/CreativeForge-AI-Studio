from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class CreativeTwin(SQLModel, table=True):
    __tablename__ = "creative_twins"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    twin_name: str
    personality_profile: dict = Field(default={})  # Learning style, preferences, etc.
    skill_level: str = "intermediate"  # beginner, intermediate, advanced
    specialization: str = ""  # e.g., "cinematic", "illustration"
    metadata: dict = Field(default={})
    learnings: List["TwinLearning"] = Relationship(back_populates="twin")
    suggestions: List["TwinSuggestion"] = Relationship(back_populates="twin")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TwinLearning(SQLModel, table=True):
    __tablename__ = "twin_learnings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    twin_id: Optional[int] = Field(default=None, foreign_key="creative_twins.id")
    learning_type: str  # style_preference, workflow_pattern, tool_usage
    learning_data: dict = Field(default={})
    confidence: float = 0.0
    applied: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    twin: Optional[CreativeTwin] = Relationship(back_populates="learnings")

class TwinSuggestion(SQLModel, table=True):
    __tablename__ = "twin_suggestions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    twin_id: Optional[int] = Field(default=None, foreign_key="creative_twins.id")
    suggestion_type: str  # tool_recommendation, style_suggestion, workflow_optimization
    suggestion_text: str
    relevance_score: float = 0.0
    accepted: bool = False
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    twin: Optional[CreativeTwin] = Relationship(back_populates="suggestions")
