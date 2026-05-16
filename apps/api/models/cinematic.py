from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Optional, Dict, List, Any


class CinematicPresetBase(SQLModel):
    name: str = Field(index=True)
    description: str = Field(default="")
    camera_settings: Dict = Field(default={}, sa_column=Column(JSON))
    lighting_rig: Dict = Field(default={}, sa_column=Column(JSON))
    color_grade: Dict = Field(default={}, sa_column=Column(JSON))
    is_system: bool = Field(default=False)  # System presets vs user-created
    user_id: str = Field(index=True)


class CinematicPreset(CinematicPresetBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CameraSettingBase(SQLModel):
    name: str = Field(index=True)
    lens_type: str = Field(default="prime")  # "prime", "zoom", "fisheye"
    focal_length: int = Field(default=50)  # mm
    aperture: float = Field(default=2.8)  # f-stop
    iso: int = Field(default=400)
    shutter_speed: str = Field(default="1/50")
    depth_of_field: str = Field(default="shallow")  # "shallow", "deep", "selective"
    user_id: str = Field(index=True)


class CameraSetting(CameraSettingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LightingRigBase(SQLModel):
    name: str = Field(index=True)
    rig_type: str = Field(default="three_point")  # "three_point", "rim", "high_key", "low_key"
    key_light: Dict = Field(default={}, sa_column=Column(JSON))
    fill_light: Dict = Field(default={}, sa_column=Column(JSON))
    back_light: Dict = Field(default={}, sa_column=Column(JSON))
    ambient_light: Dict = Field(default={}, sa_column=Column(JSON))
    user_id: str = Field(index=True)


class LightingRig(LightingRigBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ColorGradeBase(SQLModel):
    name: str = Field(index=True)
    grade_type: str = Field(default="teal_orange")  # "teal_orange", "sepia", "b&w", "vibrant"
    shadows: Dict = Field(default={}, sa_column=Column(JSON))
    midtones: Dict = Field(default={}, sa_column=Column(JSON))
    highlights: Dict = Field(default={}, sa_column=Column(JSON))
    saturation: float = Field(default=1.0)
    contrast: float = Field(default=1.0)
    user_id: str = Field(index=True)


class ColorGrade(ColorGradeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
