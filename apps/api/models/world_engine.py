from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, List, Dict


class WorldBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    user_id: str = Field(index=True)


class World(WorldBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CharacterBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    traits: Dict = Field(default={}, sa_column=Column(JSON))
    world_id: int = Field(foreign_key="world.id")
    user_id: str = Field(index=True)


class Character(CharacterBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class LocationBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    world_id: int = Field(foreign_key="world.id")
    parent_location_id: Optional[int] = Field(default=None, foreign_key="location.id")
    user_id: str = Field(index=True)


class Location(LocationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TimelineEventBase(SQLModel):
    title: str = Field(index=True)
    description: str = Field(default="")
    event_date: datetime
    world_id: int = Field(foreign_key="world.id")
    related_character_ids: List[int] = Field(default=[], sa_column=Column(JSON))
    related_location_ids: List[int] = Field(default=[], sa_column=Column(JSON))
    user_id: str = Field(index=True)


class TimelineEvent(TimelineEventBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class LoreEntryBase(SQLModel):
    title: str = Field(index=True)
    content: str
    category: str = Field(default="general")
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    world_id: int = Field(foreign_key="world.id")
    user_id: str = Field(index=True)


class LoreEntry(LoreEntryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
