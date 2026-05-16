from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class VoiceSession(SQLModel, table=True):
    __tablename__ = "voice_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    session_name: str
    status: str = "active"  # active, completed, archived
    metadata: dict = Field(default={})
    commands: List["VoiceCommand"] = Relationship(back_populates="session")
    transcripts: List["VoiceTranscript"] = Relationship(back_populates="session")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class VoiceCommand(SQLModel, table=True):
    __tablename__ = "voice_commands"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: Optional[int] = Field(default=None, foreign_key="voice_sessions.id")
    user_id: str = Field(index=True)
    command_text: str
    command_type: str  # create, edit, delete, navigate, generate
    confidence_score: float = 1.0
    executed: bool = False
    result: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Optional[VoiceSession] = Relationship(back_populates="commands")

class VoiceTranscript(SQLModel, table=True):
    __tablename__ = "voice_transcripts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: Optional[int] = Field(default=None, foreign_key="voice_sessions.id")
    audio_url: Optional[str] = None
    transcript_text: str
    language: str = "en-US"
    duration_seconds: float = 0.0
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Optional[VoiceSession] = Relationship(back_populates="transcripts")
