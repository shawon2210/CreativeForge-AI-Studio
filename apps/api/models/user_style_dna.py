from sqlmodel import SQLModel, Field, Column
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional, List, Dict

class UserStyleDNA(SQLModel, table=True):
    __tablename__ = "user_style_dna"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, unique=True)
    preferred_color_palettes: List[str] = Field(default=[], sa_column=Column("preferred_color_palettes", "JSON"))
    composition_tendencies: Dict = Field(default={}, sa_column=Column("composition_tendencies", "JSON"))
    favorite_prompts: List[str] = Field(default=[], sa_column=Column("favorite_prompts", "JSON"))
    lighting_preferences: Optional[str] = Field(default=None, max_length=50)
    style_evolution_history: List[Dict] = Field(default=[], sa_column=Column("style_evolution_history", "JSON"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
