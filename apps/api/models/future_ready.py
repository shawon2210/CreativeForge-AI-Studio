from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class FutureFeature(SQLModel, table=True):
    __tablename__ = "future_features"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    feature_name: str
    description: Optional[str] = None
    category: str = "tech"  # tech, platform, integration
    priority: str = "medium"  # low, medium, high, critical
    status: str = "planned"  # planned, in_progress, completed
    target_date: Optional[datetime] = None
    metadata: dict = Field(default={})
    roadmap_items: List["FeatureRoadmap"] = Relationship(back_populates="feature")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FeatureRoadmap(SQLModel, table=True):
    __tablename__ = "feature_roadmap"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    feature_id: Optional[int] = Field(default=None, foreign_key="future_features.id")
    milestone_name: str
    milestone_description: Optional[str] = None
    target_quarter: str  # Q1-2026, Q2-2026, etc.
    status: str = "pending"  # pending, in_progress, completed
    dependencies: list = Field(default=[])
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    feature: Optional[FutureFeature] = Relationship(back_populates="roadmap_items")

class ExpansionPlan(SQLModel, table=True):
    __tablename__ = "expansion_plans"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_name: str
    target_market: str  # geographic or segment
    strategy: str  # expansion approach
    budget_allocated: float = 0.0
    expected_roi: float = 0.0
    timeline_months: int = 12
    status: str = "draft"  # draft, approved, in_progress, completed
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
