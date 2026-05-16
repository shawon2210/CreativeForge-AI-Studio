from sqlmodel import SQLModel, Field, Column
from pgvector.sqlalchemy import Vector
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional, Dict, Any, List

class CreativeMemory(SQLModel, table=True):
    __tablename__ = "creative_memory"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    content_type: str = Field(max_length=20)  # prompt/generation/style_note
    content_text: str
    embedding: List[float] = Field(sa_column=Column(Vector(384)))  # 384-dim for all-MiniLM-L6-v2
    metadata: Dict[str, Any] = Field(default={}, sa_column=Column("metadata", "JSON"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
