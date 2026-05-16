from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class TimelineEvent(SQLModel, table=True):
    __tablename__ = "timeline_events"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    project_id: str = Field(index=True)
    event_type: str  # creation, edit, delete, restore, branch
    event_name: str
    description: Optional[str] = None
    metadata: dict = Field(default={})
    version_records: List["VersionRecord"] = Relationship(back_populates="timeline_event")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VersionRecord(SQLModel, table=True):
    __tablename__ = "version_records"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    timeline_event_id: Optional[int] = Field(default=None, foreign_key="timeline_events.id")
    version_number: str  # e.g., "1.0.0", "2.1.3"
    version_type: str = "minor"  # major, minor, patch
    changes: dict = Field(default={})  # What changed in this version
    snapshot_url: Optional[str] = None  # URL to version snapshot
    is_current: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    timeline_event: Optional[TimelineEvent] = Relationship(back_populates="version_records")

class ChangeLog(SQLModel, table=True):
    __tablename__ = "change_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    version_record_id: Optional[int] = Field(default=None, foreign_key="version_records.id")
    change_type: str  # added, modified, deleted
    file_path: str
    diff_summary: Optional[str] = None
    author_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    version_record: Optional[VersionRecord] = Relationship()
