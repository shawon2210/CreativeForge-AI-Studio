from sqlmodel import SQLModel, Field, DateTime, Column, Relationship
from datetime import datetime
from typing import Optional, List

class CinematicScene(SQLModel, table=True):
    __tablename__ = "cinematic_scenes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    scene_name: str
    description: str
    camera_settings_id: Optional[int] = Field(default=None, foreign_key="camera_settings.id")
    lighting_rig_id: Optional[int] = Field(default=None, foreign_key="lighting_rigs.id")
    color_grade_id: Optional[int] = Field(default=None, foreign_key="color_grades.id")
    status: str = "draft"  # draft, rendering, completed, failed
    metadata: dict = Field(default={})
    camera_settings: Optional["CameraSettings"] = Relationship(back_populates="scene")
    lighting_rig: Optional["LightingRig"] = Relationship(back_populates="scene")
    color_grade: Optional["ColorGrade"] = Relationship(back_populates="scene")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CameraSettings(SQLModel, table=True):
    __tablename__ = "camera_settings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scene_id: Optional[int] = Field(default=None, foreign_key="cinematic_scenes.id")
    shot_type: str = "wide"  # wide, close, medium, etc.
    angle: str = "eye_level"  # low, high, eye_level, dutch
    movement: str = "static"  # static, pan, tilt, dolly, tracking
    focal_length: int = 50  # in mm
    aperture: float = 2.8
    shutter_speed: str = "1/50"
    iso: int = 400
    scene: Optional[CinematicScene] = Relationship(back_populates="camera_settings")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LightingRig(SQLModel, table=True):
    __tablename__ = "lighting_rigs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scene_id: Optional[int] = Field(default=None, foreign_key="cinematic_scenes.id")
    setup_type: str = "three_point"  # three_point, natural, dramatic, rim
    key_light_intensity: float = 1.0
    fill_light_intensity: float = 0.5
    back_light_intensity: float = 0.8
    ambient_light_color: str = "#FFFFFF"
    scene: Optional[CinematicScene] = Relationship(back_populates="lighting_rig")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ColorGrade(SQLModel, table=True):
    __tablename__ = "color_grades"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    scene_id: Optional[int] = Field(default=None, foreign_key="cinematic_scenes.id")
    lut_preset: str = "neutral"  # neutral, teal_orange, warm, cool, custom
    contrast: float = 1.0
    saturation: float = 1.0
    temperature: float = 0.0  # -100 (cool) to 100 (warm)
    tint: float = 0.0
    shadows: float = 0.0
    highlights: float = 0.0
    scene: Optional[CinematicScene] = Relationship(back_populates="color_grade")
    created_at: datetime = Field(default_factory=datetime.utcnow)
