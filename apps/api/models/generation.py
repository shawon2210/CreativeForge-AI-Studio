from sqlmodel import SQLModel, Field, Column
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional, Dict, Any

class Generation(SQLModel, table=True):
    __tablename__ = "generations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    project_id: Optional[UUID] = Field(default=None, foreign_key="projects.id")
    user_id: UUID = Field(foreign_key="users.id", index=True)
    type: str = Field(max_length=20)  # text/image/remix/workflow
    prompt: str
    model: str = Field(max_length=50)
    status: str = Field(default="queued", max_length=20)
    cfg_scale: Optional[float] = None
    steps: Optional[int] = None
    result_url: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default={}, sa_column=Column("metadata", "JSON"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
