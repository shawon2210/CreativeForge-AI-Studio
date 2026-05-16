from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class MultiModalInput(SQLModel, table=True):
    __tablename__ = "multi_modal_inputs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    fusion_job_id: int = Field(foreign_key="fusion_jobs.id")
    modality_type: str  # text, image, video, audio
    input_data: str  # URL or text content
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    fusion_job: Optional["FusionJob"] = Relationship(back_populates="inputs")

class FusionJob(SQLModel, table=True):
    __tablename__ = "fusion_jobs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    prompt: str  # Main prompt guiding the fusion
    status: str = "pending"  # pending, processing, completed, failed
    fusion_type: str = "default"  # default, creative, technical, etc.
    inputs: List[MultiModalInput] = Relationship(back_populates="fusion_job")
    outputs: List["FusionOutput"] = Relationship(back_populates="fusion_job")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FusionOutput(SQLModel, table=True):
    __tablename__ = "fusion_outputs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    fusion_job_id: int = Field(foreign_key="fusion_jobs.id")
    output_type: str  # image, video, audio, text, multimodal
    output_url: str
    metadata: dict = Field(default={})
    fusion_job: Optional[FusionJob] = Relationship(back_populates="outputs")
    created_at: datetime = Field(default_factory=datetime.utcnow)
