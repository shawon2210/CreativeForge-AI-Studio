from sqlmodel import SQLModel, Field, DateTime, Column
from datetime import datetime
from typing import Optional

class RenderJob(SQLModel, table=True):
    __tablename__ = "render_jobs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    generation_id: int = Field(foreign_key="generations.id")
    status: str = Field(default="pending")  # pending, processing, done, failed
    render_settings: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RenderPreview(SQLModel, table=True):
    __tablename__ = "render_previews"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="render_jobs.id")
    preview_url: str
    thumbnail_url: Optional[str] = None
    width: int = 1920
    height: int = 1080
    format: str = "png"
    created_at: datetime = Field(default_factory=datetime.utcnow)
