"""
World Engine models - compatible with both mock mode (no DB) and production (sqlmodel).
Uses pure Pydantic as base; sqlmodel is optional and only needed for production DB mode.
"""
import os
from datetime import datetime
from typing import Optional, List, Dict

# Try sqlmodel first, fall back to pydantic
try:
    from sqlmodel import SQLModel, Field, Column, JSON
    HAS_SQLMODEL = True
except ImportError:
    HAS_SQLMODEL = False

if not HAS_SQLMODEL:
    # Fallback: use pure pydantic
    try:
        from pydantic import BaseModel, Field
        from typing import Any

        # Create a minimal Column/JSON shim
        def Column(*args, **kwargs):
            return None

        def JSON(*args, **kwargs):
            return None

        SQLModel = BaseModel
    except ImportError:
        raise ImportError("Neither sqlmodel nor pydantic is installed")


class WorldBase(SQLModel if HAS_SQLMODEL else BaseModel):
    if HAS_SQLMODEL:
        name: str = Field(index=True)
        description: str = Field(default="")
        user_id: str = Field(index=True)
    else:
        name: str = ""
        description: str = ""
        user_id: str = ""


class World(WorldBase):
    if HAS_SQLMODEL:
        id: Optional[int] = Field(default=None, primary_key=True)
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
    else:
        id: Optional[int] = None
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)


class CharacterBase(SQLModel if HAS_SQLMODEL else BaseModel):
    if HAS_SQLMODEL:
        name: str = Field(index=True)
        description: str = Field(default="")
        traits: Dict = Field(default={}, sa_column=Column(JSON))
        world_id: int = Field(foreign_key="world.id")
        user_id: str = Field(index=True)
    else:
        name: str = ""
        description: str = ""
        traits: Dict = {}
        world_id: int = 0
        user_id: str = ""


class Character(CharacterBase):
    if HAS_SQLMODEL:
        id: Optional[int] = Field(default=None, primary_key=True)
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
    else:
        id: Optional[int] = None
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)


class LocationBase(SQLModel if HAS_SQLMODEL else BaseModel):
    if HAS_SQLMODEL:
        name: str = Field(index=True)
        description: str = Field(default="")
        world_id: int = Field(foreign_key="world.id")
        parent_location_id: Optional[int] = Field(default=None, foreign_key="location.id")
        user_id: str = Field(index=True)
    else:
        name: str = ""
        description: str = ""
        world_id: int = 0
        parent_location_id: Optional[int] = None
        user_id: str = ""


class Location(LocationBase):
    if HAS_SQLMODEL:
        id: Optional[int] = Field(default=None, primary_key=True)
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
    else:
        id: Optional[int] = None
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)


class TimelineEventBase(SQLModel if HAS_SQLMODEL else BaseModel):
    if HAS_SQLMODEL:
        title: str = Field(index=True)
        description: str = Field(default="")
        event_date: datetime = Field(default_factory=datetime.utcnow)
        world_id: int = Field(foreign_key="world.id")
        related_character_ids: List[int] = Field(default=[], sa_column=Column(JSON))
        related_location_ids: List[int] = Field(default=[], sa_column=Column(JSON))
        user_id: str = Field(index=True)
    else:
        title: str = ""
        description: str = ""
        event_date: datetime = Field(default_factory=datetime.utcnow)
        world_id: int = 0
        related_character_ids: List[int] = []
        related_location_ids: List[int] = []
        user_id: str = ""


class TimelineEvent(TimelineEventBase):
    if HAS_SQLMODEL:
        id: Optional[int] = Field(default=None, primary_key=True)
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
    else:
        id: Optional[int] = None
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)


class LoreEntryBase(SQLModel if HAS_SQLMODEL else BaseModel):
    if HAS_SQLMODEL:
        title: str = Field(index=True)
        content: str = Field(default="")
        category: str = Field(default="general")
        tags: List[str] = Field(default=[], sa_column=Column(JSON))
        world_id: int = Field(foreign_key="world.id")
        user_id: str = Field(index=True)
    else:
        title: str = ""
        content: str = ""
        category: str = "general"
        tags: List[str] = []
        world_id: int = 0
        user_id: str = ""


class LoreEntry(LoreEntryBase):
    if HAS_SQLMODEL:
        id: Optional[int] = Field(default=None, primary_key=True)
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
    else:
        id: Optional[int] = None
        created_at: datetime = Field(default_factory=datetime.utcnow)
        updated_at: datetime = Field(default_factory=datetime.utcnow)
