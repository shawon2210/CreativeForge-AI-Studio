from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class CollaborativeSession(SQLModel, table=True):
    __tablename__ = "collaborative_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: str = Field(index=True)
    session_name: str
    status: str = "active"  # active, paused, archived
    metadata: dict = Field(default={})
    users: List["CollaborationUser"] = Relationship(back_populates="session")
    updates: List["SessionUpdate"] = Relationship(back_populates="session")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CollaborationUser(SQLModel, table=True):
    __tablename__ = "collaboration_users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: Optional[int] = Field(default=None, foreign_key="collaborative_sessions.id")
    user_id: str = Field(index=True)
    role: str = "editor"  # viewer, editor, admin
    cursor_position: dict = Field(default={})  # {"x": 100, "y": 200}
    active: bool = True
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Optional[CollaborativeSession] = Relationship(back_populates="users")

class SessionUpdate(SQLModel, table=True):
    __tablename__ = "session_updates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: Optional[int] = Field(default=None, foreign_key="collaborative_sessions.id")
    user_id: str = Field(index=True)
    update_type: str  # edit, delete, cursor_move, chat
    element_id: Optional[str] = None
    changes: dict = Field(default={})
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Optional[CollaborativeSession] = Relationship(back_populates="updates")
