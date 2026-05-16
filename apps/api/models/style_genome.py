from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List


class StyleDNABase(SQLModel):
    user_id: str = Field(index=True)
    style_fingerprint: Dict = Field(default={}, sa_column=Column(JSON))
    # Example fingerprint: {"color_palette": ["#ff0000", "#00ff00"], "brush_behavior": "smooth", "composition_rhythm": "balanced"}


class StyleDNA(StyleDNABase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class StyleMutationBase(SQLModel):
    user_id: str = Field(index=True)
    original_dna: Dict = Field(default={}, sa_column=Column(JSON))
    mutated_dna: Dict = Field(default={}, sa_column=Column(JSON))
    mutation_type: str = Field(default="random")  # "random", "blend", "evolve"
    generation_id: Optional[int] = Field(default=None, foreign_key="generation.id")


class StyleMutation(StyleMutationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StyleEvolutionBase(SQLModel):
    user_id: str = Field(index=True)
    generation_id: int = Field(foreign_key="generation.id")
    style_dna: Dict = Field(default={}, sa_column=Column(JSON))
    evolution_score: float = Field(default=0.0, ge=0.0, le=1.0)
    feedback: str = Field(default="")  # User feedback: "like", "dislike", "neutral"


class StyleEvolution(StyleEvolutionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
