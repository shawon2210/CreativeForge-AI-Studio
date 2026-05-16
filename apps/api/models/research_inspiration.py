from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class ResearchTopic(SQLModel, table=True):
    __tablename__ = "research_topics"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    topic_name: str
    description: Optional[str] = None
    keywords: list = Field(default=[])
    status: str = "active"  # active, archived
    metadata: dict = Field(default={})
    papers: List["ResearchPaper"] = Relationship(back_populates="topic")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResearchPaper(SQLModel, table=True):
    __tablename__ = "research_papers"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: Optional[int] = Field(default=None, foreign_key="research_topics.id")
    title: str
    authors: list = Field(default=[])
    abstract: Optional[str] = None
    url: Optional[str] = None
    publication_date: Optional[datetime] = None
    citation_count: int = 0
    relevance_score: float = 0.0
    read: bool = False
    notes: Optional[str] = None
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    topic: Optional[ResearchTopic] = Relationship(back_populates="papers")

class InspirationSource(SQLModel, table=True):
    __tablename__ = "inspiration_sources"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    source_type: str  # image, video, article, quote
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    tags: list = Field(default=[])
    rating: int = 0  # 1-5
    used_in_project: Optional[str] = None
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # No foreign key relationship needed here
