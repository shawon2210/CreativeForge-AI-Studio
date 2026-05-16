from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class MarketplaceItem(SQLModel, table=True):
    __tablename__ = "marketplace_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: str = Field(index=True)
    item_name: str
    description: str
    item_type: str  # model, plugin, template, dataset, etc.
    price: float = 0.0  # 0.0 means free
    download_url: Optional[str] = None
    preview_url: Optional[str] = None
    status: str = "active"  # active, archived, removed
    metadata: dict = Field(default={})
    reviews: List["MarketplaceReview"] = Relationship(back_populates="item")
    transactions: List["MarketplaceTransaction"] = Relationship(back_populates="item")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MarketplaceTransaction(SQLModel, table=True):
    __tablename__ = "marketplace_transactions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="marketplace_items.id")
    buyer_id: str = Field(index=True)
    seller_id: str = Field(index=True)
    amount: float
    transaction_type: str = "purchase"  # purchase, subscription, tip
    status: str = "completed"  # pending, completed, refunded
    metadata: dict = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    item: Optional[MarketplaceItem] = Relationship(back_populates="transactions")

class MarketplaceReview(SQLModel, table=True):
    __tablename__ = "marketplace_reviews"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="marketplace_items.id")
    reviewer_id: str = Field(index=True)
    rating: int  # 1-5
    review_text: Optional[str] = None
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    item: Optional[MarketplaceItem] = Relationship(back_populate="reviews")
