from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List, Any


class AgentBase(SQLModel):
    name: str = Field(index=True)
    agent_type: str = Field(index=True)  # "director", "writer", "visual", "lighting", "consistency", "prompt_engineer"
    capabilities: List[str] = Field(default=[], sa_column=Column(JSON))
    status: str = Field(default="idle")  # "idle", "busy", "offline"
    user_id: str = Field(index=True)


class Agent(AgentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentMessageBase(SQLModel):
    from_agent_id: int = Field(foreign_key="agent.id")
    to_agent_id: int = Field(foreign_key="agent.id")
    message_type: str = Field(default="info")  # "info", "request", "response", "error"
    payload: Dict = Field(default={}, sa_column=Column(JSON))
    user_id: str = Field(index=True)


class AgentMessage(AgentMessageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentTaskBase(SQLModel):
    agent_id: int = Field(foreign_key="agent.id")
    task_type: str = Field(index=True)  # "analyze", "generate", "validate", "enhance"
    input_data: Dict = Field(default={}, sa_column=Column(JSON))
    output_data: Dict = Field(default={}, sa_column=Column(JSON))
    status: str = Field(default="pending")  # "pending", "processing", "completed", "failed"
    user_id: str = Field(index=True)


class AgentTask(AgentTaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
