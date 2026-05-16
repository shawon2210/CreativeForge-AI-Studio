from fastapi import APIRouter, Body, HTTPException, status
from datetime import datetime
from typing import List, Dict, Optional

from ..services.world_engine_service import (
    create_world, get_world,
    create_character, get_characters,
    create_location,
    create_timeline_event,
    create_lore_entry,
    check_character_consistency, check_timeline_consistency
)
from ..models.world_engine import World, Character, Location, TimelineEvent, LoreEntry

router = APIRouter(prefix="/world-engine", tags=["World Engine"])

# ---------- World Endpoints ----------
@router.post("/worlds/", response_model=World)
async def create_world_endpoint(
    name: str = Body(...),
    description: str = Body(default=""),
    user_id: str = Body(...)
):
    return create_world(name=name, description=description, user_id=user_id)


@router.get("/worlds/{world_id}", response_model=Optional[World])
async def get_world_endpoint(world_id: int, user_id: str = Body(...)):
    world = get_world(world_id=world_id, user_id=user_id)
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found or access denied")
    return world


# ---------- Character Endpoints ----------
@router.post("/worlds/{world_id}/characters/", response_model=Optional[Character])
async def create_character_endpoint(
    world_id: int,
    name: str = Body(...),
    description: str = Body(default=""),
    traits: Dict = Body(default={}),
    user_id: str = Body(...)
):
    return create_character(world_id=world_id, name=name, description=description, traits=traits, user_id=user_id)


@router.get("/worlds/{world_id}/characters/", response_model=List[Character])
async def get_characters_endpoint(world_id: int, user_id: str = Body(...)):
    return get_characters(world_id=world_id, user_id=user_id)


# ---------- Location Endpoints ----------
@router.post("/worlds/{world_id}/locations/", response_model=Optional[Location])
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


# ---------- Timeline Event Endpoints ----------
@router.post("/worlds/{world_id}/timeline-events/", response_model=Optional[TimelineEvent])
async def create_timeline_event_endpoint(
    world_id: int,
    title: str = Body(...),
    description: str = Body(default=""),
    event_date: datetime = Body(...),
    related_character_ids: List[int] = Body(default=[]),
    related_location_ids: List[int] = Body(default=[]),
    user_id: str = Body(...)
):
    return create_timeline_event(
        world_id=world_id, title=title, description=description,
        event_date=event_date, related_character_ids=related_character_ids,
        related_location_ids=related_location_ids, user_id=user_id
    )


# ---------- Lore Entry Endpoints ----------
@router.post("/worlds/{world_id}/lore-entries/", response_model=Optional[LoreEntry])
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


@router.post("/worlds/{world_id}/generate-timeline/", response_model=List[TimelineEvent])
async def generate_timeline_endpoint(world_id: int, user_id: str = Body(...)):
    return generate_timeline_from_lore(world_id=world_id, user_id=user_id)


@router.get("/worlds/{world_id}/relationship-graph/", response_model=Dict)
async def get_relationship_graph_endpoint(world_id: int, user_id: str = Body(...)):
    return get_world_relationship_graph(world_id=world_id, user_id=user_id)


@router.get("/worlds/{world_id}/validate-continuity/", response_model=Dict)
async def validate_continuity_endpoint(world_id: int, user_id: str = Body(...)):
    return validate_story_continuity(world_id=world_id, user_id=user_id)


# ---------- Consistency Check Endpoints ----------
@router.post("/characters/{character_id}/check-consistency/", response_model=bool)
async def check_character_consistency_endpoint(
    character_id: int,
    new_traits: Dict = Body(...)
):
    return check_character_consistency(character_id=character_id, new_traits=new_traits)


@router.get("/characters/{character_id}/consistency-report/", response_model=Dict)
async def get_consistency_report_endpoint(character_id: int):
    return get_character_consistency_report(character_id=character_id)


@router.post("/characters/{character_id}/validate-generation/", response_model=Dict)
async def validate_generation_endpoint(
    character_id: int,
    generation_traits: Dict = Body(...)
):
    is_valid, issues = validate_character_for_generation(character_id=character_id, generation_traits=generation_traits)
    return {"is_valid": is_valid, "issues": issues}


@router.post("/timeline-events/check-consistency/", response_model=bool)
async def check_timeline_consistency_endpoint(event: TimelineEvent = Body(...)):
    return check_timeline_consistency(event=event)
