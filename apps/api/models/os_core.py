from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List, Any


class OSModuleBase(SQLModel):
    name: str = Field(index=True)
    module_type: str = Field(index=True)  # "studio", "chat", "research", "asset_manager", "workflow", "story", "team", "voice"
    description: str = Field(default="")
    config: Dict = Field(default={}, sa_column=Column(JSON))
    is_enabled: bool = Field(default=True)
    user_id: str = Field(index=True)


class OSModule(OSModuleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SharedMemoryBase(SQLModel):
    user_id: str = Field(index=True)
    memory_type: str = Field(index=True)  # "studio", "chat", "research", "global"
    content: str
    metadata: Dict = Field(default={}, sa_column=Column(JSON))
    embedding: List[float] = Field(default=[], sa_column=Column(JSON))  # For similarity search
    source_module: str = Field(default="")  # Which module created this memory


class SharedMemory(SharedMemoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SharedEmbeddingBase(SQLModel):
    user_id: str = Field(index=True)
    source_type: str = Field(index=True)  # "image", "text", "audio", "workflow"
    source_id: int = Field(default=0)
    embedding: List[float] = Field(sa_column=Column(JSON))
    model_name: str = Field(default="all-MiniLM-L6-v2")


class SharedEmbedding(SharedEmbeddingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SharedProjectBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    project_data: Dict = Field(default={}, sa_column=Column(JSON))
    modules_used: List[str] = Field(default=[], sa_column=Column(JSON))
    user_id: str = Field(index=True)


class SharedProject(SharedProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
