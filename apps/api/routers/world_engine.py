import os
import sys
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query, status
from datetime import datetime
from typing import List, Dict, Optional

# Add apps/api to Python path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.world_engine_service import (
    create_world, get_world, get_worlds,
    create_character, get_characters,
    create_location,
    create_timeline_event,
    create_lore_entry,
    create_lore_entry as create_lore,
    check_character_consistency, check_timeline_consistency,
    generate_timeline_from_lore,
    get_world_relationship_graph,
    validate_story_continuity,
    get_character_consistency_report,
    validate_character_for_generation,
)
from models.world_engine import World, Character, Location, TimelineEvent, LoreEntry

router = APIRouter(prefix="/world-engine", tags=["World Engine"])


# ---------- World Endpoints ----------
@router.post("/worlds/", response_model=World)
async def create_world_endpoint(
    name: str = Body(...),
    description: str = Body(default=""),
    user_id: str = Body(...)
):
    return create_world(name=name, description=description, user_id=user_id)


@router.get("/worlds/")
async def list_worlds_endpoint(user_id: str = Query(...)):
    """List all worlds owned by a user"""
    return get_worlds(user_id=user_id)


@router.get("/worlds/{world_id}")
async def get_world_endpoint(world_id: int, user_id: str = Query(...)):
    world = get_world(world_id=world_id, user_id=user_id)
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found or access denied")
    return world


# ---------- Character Endpoints ----------
@router.post("/worlds/{world_id}/characters/")
async def create_character_endpoint(
    world_id: int,
    name: str = Body(...),
    description: str = Body(default=""),
    traits: Dict = Body(default={}),
    user_id: str = Body(...)
):
    return create_character(world_id=world_id, name=name, description=description, traits=traits, user_id=user_id)


@router.get("/worlds/{world_id}/characters/")
async def get_characters_endpoint(world_id: int, user_id: str = Query(...)):
    return get_characters(world_id=world_id, user_id=user_id)


# ---------- Location Endpoints ----------
@router.post("/worlds/{world_id}/locations/")
async def create_location_endpoint(
    world_id: int,
    name: str = Body(...),
    description: str = Body(default=""),
    parent_location_id: Optional[int] = Body(default=None),
    user_id: str = Body(...)
):
    return create_location(
        world_id=world_id, name=name, description=description,
        parent_location_id=parent_location_id, user_id=user_id
    )


@router.get("/worlds/{world_id}/locations/")
async def get_locations_endpoint(world_id: int, user_id: str = Query(...)):
    from services.world_engine_service import _mock_locations
    return [l for l in _mock_locations.values() if l.world_id == world_id and l.user_id == user_id]


# ---------- Timeline Event Endpoints ----------
@router.post("/worlds/{world_id}/timeline-events/")
async def create_timeline_event_endpoint(
    world_id: int,
    title: str = Body(...),
    description: str = Body(default=""),
    event_date: datetime = Body(default_factory=datetime.utcnow),
    related_character_ids: List[int] = Body(default=[]),
    related_location_ids: List[int] = Body(default=[]),
    user_id: str = Body(...)
):
    return create_timeline_event(
        world_id=world_id, title=title, description=description,
        event_date=event_date, related_character_ids=related_character_ids,
        related_location_ids=related_location_ids, user_id=user_id
    )


@router.get("/worlds/{world_id}/timeline-events/")
async def get_timeline_events_endpoint(world_id: int, user_id: str = Query(...)):
    from services.world_engine_service import _mock_timeline_events
    return [e for e in _mock_timeline_events.values() if e.world_id == world_id and e.user_id == user_id]


# ---------- Lore Entry Endpoints ----------
@router.post("/worlds/{world_id}/lore-entries/")
async def create_lore_entry_endpoint(
    world_id: int,
    title: str = Body(...),
    content: str = Body(...),
    category: str = Body(default="general"),
    tags: List[str] = Body(default=[]),
    user_id: str = Body(...)
):
    return create_lore_entry(
        world_id=world_id, title=title, content=content,
        category=category, tags=tags, user_id=user_id
    )


@router.get("/worlds/{world_id}/lore-entries/")
async def get_lore_entries_endpoint(world_id: int, user_id: str = Query(...)):
    from services.world_engine_service import _mock_lore_entries
    return [e for e in _mock_lore_entries.values() if e.world_id == world_id and e.user_id == user_id]


# ---------- Advanced World Operations ----------
@router.post("/worlds/{world_id}/generate-timeline/")
async def generate_timeline_endpoint(world_id: int, body: dict = Body(...)):
    user_id = body.get("user_id", "")
    return generate_timeline_from_lore(world_id=world_id, user_id=user_id)


@router.get("/worlds/{world_id}/relationship-graph/")
async def get_relationship_graph_endpoint(world_id: int, user_id: str = Query(...)):
    return get_world_relationship_graph(world_id=world_id, user_id=user_id)


@router.get("/worlds/{world_id}/validate-continuity/")
async def validate_continuity_endpoint(world_id: int, user_id: str = Query(...)):
    return validate_story_continuity(world_id=world_id, user_id=user_id)


# ---------- Consistency Check Endpoints ----------
@router.post("/characters/{character_id}/check-consistency/")
async def check_character_consistency_endpoint(
    character_id: int,
    new_traits: Dict = Body(...)
):
    return check_character_consistency(character_id=character_id, new_traits=new_traits)


@router.get("/characters/{character_id}/consistency-report/")
async def get_consistency_report_endpoint(character_id: int):
    result = get_character_consistency_report(character_id=character_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return result


@router.post("/characters/{character_id}/validate-generation/")
async def validate_generation_endpoint(
    character_id: int,
    generation_traits: Dict = Body(...)
):
    result = validate_character_for_generation(character_id=character_id, generation_traits=generation_traits)
    # Handle both tuple and dict return types
    if isinstance(result, tuple):
        is_valid, issues = result
        return {"is_valid": is_valid, "issues": issues}
    return result


@router.post("/timeline-events/check-consistency/")
async def check_timeline_consistency_endpoint(
    event_data: dict = Body(...)
):
    # Build a minimal TimelineEvent for consistency checking
    from services.world_engine_service import _mock_timeline_events
    event = TimelineEvent(
        id=event_data.get("id", 0),
        title=event_data.get("title", ""),
        description=event_data.get("description", ""),
        event_date=event_data.get("event_date", datetime.utcnow()),
        world_id=event_data.get("world_id", 0),
        related_character_ids=event_data.get("related_character_ids", []),
        related_location_ids=event_data.get("related_location_ids", []),
        user_id=event_data.get("user_id", ""),
    )
    return check_timeline_consistency(event=event)
