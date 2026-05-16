from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class Asset(SQLModel, table=True):
    __tablename__ = "assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    filename: str
    file_url: str
    file_type: str  # image, video, audio, 3d_model
    file_size: int  # in bytes
    metadata: dict = Field(default={})
    tags: List["AssetTag"] = Relationship(back_populates="asset", cascade_delete=True)
    collections: List["CollectionAsset"] = Relationship(back_populates="asset")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AssetTag(SQLModel, table=True):
    __tablename__ = "asset_tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_id: int = Field(foreign_key="assets.id")
    tag: str = Field(index=True)
    asset: Optional[Asset] = Relationship(back_populates="tags")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssetCollection(SQLModel, table=True):
    __tablename__ = "asset_collections"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str
    description: Optional[str] = None
    assets: List["CollectionAsset"] = Relationship(back_populates="collection")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CollectionAsset(SQLModel, table=True):
    __tablename__ = "collection_assets"
    
    collection_id: int = Field(foreign_key="asset_collections.id", primary_key=True)
    asset_id: int = Field(foreign_key="assets.id", primary_key=True)
    collection: Optional[AssetCollection] = Relationship(back_populates="assets")
    asset: Optional[Asset] = Relationship(back_populates="collections")
    added_at: datetime = Field(default_factory=datetime.utcnow)
