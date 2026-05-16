from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class GeneratedUI(SQLModel, table=True):
    __tablename__ = "generated_uis"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    ui_name: str
    description: Optional[str] = None
    prompt_used: str  # The prompt used to generate the UI
    ui_type: str = "dashboard"  # dashboard, form, gallery, etc.
    status: str = "draft"  # draft, generating, completed, failed
    metadata: dict = Field(default={})
    components: List["UIComponent"] = Relationship(back_populates="generated_ui")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UIComponent(SQLModel, table=True):
    __tablename__ = "ui_components"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    generated_ui_id: Optional[int] = Field(default=None, foreign_key="generated_uis.id")
    component_type: str  # button, input, chart, table, etc.
    component_name: str
    properties: dict = Field(default={})  # Flexble component properties
    position: dict = Field(default={})  # x, y, width, height
    styles: dict = Field(default={})  # CSS styles
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    generated_ui: Optional[GeneratedUI] = Relationship(back_populates="components")

class UILayout(SQLModel, table=True):
    __tablename__ = "ui_layouts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    generated_ui_id: Optional[int] = Field(default=None, foreign_key="generated_uis.id")
    layout_type: str = "grid"  # grid, flex, absolute
    layout_config: dict = Field(default={})  # Layout configuration
    responsive_breakpoints: dict = Field(default={})  # Responsive breakpoints
    created_at: datetime = Field(default_factory=datetime.utcnow)
