from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class PromptTemplate(SQLModel, table=True):
    __tablename__ = "prompt_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str
    description: Optional[str] = None
    template: str  # The prompt template with placeholders
    category: str = "general"  # e.g., image, video, 3d, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    generated_products: List["GeneratedProduct"] = Relationship(back_populates="template")

class GeneratedProduct(SQLModel, table=True):
    __tablename__ = "generated_products"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    template_id: Optional[int] = Field(default=None, foreign_key="prompt_templates.id")
    prompt_used: str  # The actual prompt used (with placeholders filled)
    product_type: str  # image, video, 3d_model, etc.
    product_url: str
    metadata: dict = Field(default={})
    status: str = "completed"  # pending, processing, completed, failed
    template: Optional[PromptTemplate] = Relationship(back_populates="generated_products")
    iterations: List["ProductIteration"] = Relationship(back_populates="product")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductIteration(SQLModel, table=True):
    __tablename__ = "product_iterations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="generated_products.id")
    iteration_number: int = 1
    prompt_used: str
    product_url: str
    changes: dict = Field(default={})  # What was changed in this iteration
    product: Optional[GeneratedProduct] = Relationship(back_populates="iterations")
    created_at: datetime = Field(default_factory=datetime.utcnow)
