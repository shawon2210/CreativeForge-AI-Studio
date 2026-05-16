from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class KnowledgeEntity(SQLModel, table=True):
    __tablename__ = "knowledge_entities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    entity_name: str
    entity_type: str  # concept, tool, technique, style, etc.
    description: Optional[str] = None
    properties: dict = Field(default={})  # Flexible properties
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # Relationships
    source_relations: List["KnowledgeRelation"] = Relationship(
        back_populates="source_entity",
        sa_relationship_kwargs={"foreign_keys": "KnowledgeRelation.source_entity_id"}
    )
    target_relations: List["KnowledgeRelation"] = Relationship(
        back_populates="target_entity",
        sa_relationship_kwargs={"foreign_keys": "KnowledgeRelation.target_entity_id"}
    )

class KnowledgeRelation(SQLModel, table=True):
    __tablename__ = "knowledge_relations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source_entity_id: int = Field(foreign_key="knowledge_entities.id")
    target_entity_id: int = Field(foreign_key="knowledge_entities.id")
    relation_type: str  # depends_on, related_to, similar_to, etc.
    weight: float = 1.0  # Strength of relationship (0.0 to 1.0)
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    source_entity: Optional[KnowledgeEntity] = Relationship(
        back_populates="source_relations",
        sa_relationship_kwargs={"foreign_keys": "[KnowledgeRelation.source_entity_id]"}
    )
    target_entity: Optional[KnowledgeEntity] = Relationship(
        back_populates="target_relations",
        sa_relationship_kwargs={"foreign_keys": "[KnowledgeRelation.target_entity_id]"}
    )

class KnowledgeGraph(SQLModel, table=True):
    __tablename__ = "knowledge_graphs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    graph_name: str
    description: Optional[str] = None
    entities: List[KnowledgeEntity] = Relationship(back_populates="graph")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
