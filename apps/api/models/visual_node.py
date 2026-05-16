from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List, Any


class NodeTemplateBase(SQLModel):
    name: str = Field(index=True)
    node_type: str = Field(index=True)  # "prompt", "image_gen", "filter", "output"
    category: str = Field(default="general")  # "input", "processing", "output", "general"
    default_config: Dict = Field(default={}, sa_column=Column(JSON))
    input_types: List[str] = Field(default=[], sa_column=Column(JSON))
    output_types: List[str] = Field(default=[], sa_column=Column(JSON))
    user_id: str = Field(index=True)


class NodeTemplate(NodeTemplateBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WorkflowBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    workflow_data: Dict = Field(default={}, sa_column=Column(JSON))  # Stores nodes, edges, positions
    is_template: bool = Field(default=False)
    user_id: str = Field(index=True)


class Workflow(WorkflowBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NodeConnectionBase(SQLModel):
    workflow_id: int = Field(foreign_key="workflow.id")
    from_node_id: str  # Node ID in the workflow (not DB id)
    to_node_id: str
    from_handle: str = Field(default="output")
    to_handle: str = Field(default="input")
    connection_type: str = Field(default="data")  # "data", "control", "event"
    user_id: str = Field(index=True)


class NodeConnection(NodeConnectionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
