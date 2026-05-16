import os
from typing import Optional, List, Dict
from datetime import datetime
from sqlmodel import Session, select

from ..models.world_engine import World, Character, Location, TimelineEvent, LoreEntry

# Dual mode support (matches project convention)
MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# In-memory storage for mock mode
_mock_worlds: Dict[int, World] = {}
_mock_characters: Dict[int, Character] = {}
_mock_locations: Dict[int, Location] = {}
_mock_timeline_events: Dict[int, TimelineEvent] = {}
_mock_lore_entries: Dict[int, LoreEntry] = {}
_auto_increment = {"world": 1, "character": 1, "location": 1, "timeline": 1, "lore": 1}


def _get_next_id(entity: str) -> int:
    id_val = _auto_increment[entity]
    _auto_increment[entity] += 1
    return id_val


# ---------- World Operations ----------
def create_world(name: str, description: str, user_id: str) -> World:
    if MODE == "mock":
        world = World(id=_get_next_id("world"), name=name, description=description, user_id=user_id)
        _mock_worlds[world.id] = world
        return world
    # Prod mode (PostgreSQL)
    from app.database import engine
    with Session(engine) as session:
        world = World(name=name, description=description, user_id=user_id)
        session.add(world)
        session.commit()
        session.refresh(world)
        return world


def get_world(world_id: int, user_id: str) -> Optional[World]:
    if MODE == "mock":
        world = _mock_worlds.get(world_id)
        return world if world and world.user_id == user_id else None
    from app.database import engine
    with Session(engine) as session:
        return session.exec(select(World).where(World.id == world_id, World.user_id == user_id)).first()


# ---------- Character Operations ----------
def create_character(world_id: int, name: str, description: str, traits: Dict, user_id: str) -> Optional[Character]:
    # Validate world exists and belongs to user
    if not get_world(world_id, user_id):
        return None
    if MODE == "mock":
        char = Character(
            id=_get_next_id("character"),
            name=name,
            description=description,
            traits=traits,
            world_id=world_id,
            user_id=user_id
        )
        _mock_characters[char.id] = char
        return char
    from app.database import engine
    with Session(engine) as session:
        char = Character(name=name, description=description, traits=traits, world_id=world_id, user_id=user_id)
        session.add(char)
        session.commit()
        session.refresh(char)
        return char


def get_characters(world_id: int, user_id: str) -> List[Character]:
    if MODE == "mock":
        return [c for c in _mock_characters.values() if c.world_id == world_id and c.user_id == user_id]
    from app.database import engine
    with Session(engine) as session:
        return session.exec(select(Character).where(Character.world_id == world_id, Character.user_id == user_id)).all()


# ---------- Location Operations ----------
def create_location(world_id: int, name: str, description: str, parent_location_id: Optional[int], user_id: str) -> Optional[Location]:
    if not get_world(world_id, user_id):
        return None
    if MODE == "mock":
        loc = Location(
            id=_get_next_id("location"),
            name=name,
            description=description,
            world_id=world_id,
            parent_location_id=parent_location_id,
            user_id=user_id
        )
        _mock_locations[loc.id] = loc
        return loc
    from app.database import engine
    with Session(engine) as session:
        loc = Location(name=name, description=description, world_id=world_id, parent_location_id=parent_location_id, user_id=user_id)
        session.add(loc)
        session.commit()
        session.refresh(loc)
        return loc


# ---------- Timeline Operations ----------
def create_timeline_event(
    world_id: int,
    title: str,
    description: str,
    event_date: datetime,
    related_character_ids: List[int],
    related_location_ids: List[int],
    user_id: str
) -> Optional[TimelineEvent]:
    if not get_world(world_id, user_id):
        return None
    if MODE == "mock":
        event = TimelineEvent(
            id=_get_next_id("timeline"),
            title=title,
            description=description,
            event_date=event_date,
            world_id=world_id,
            related_character_ids=related_character_ids,
            related_location_ids=related_location_ids,
            user_id=user_id
        )
        _mock_timeline_events[event.id] = event
        return event
    from app.database import engine
    with Session(engine) as session:
        event = TimelineEvent(
            title=title, description=description, event_date=event_date, world_id=world_id,
            related_character_ids=related_character_ids, related_location_ids=related_location_ids, user_id=user_id
        )
        session.add(event)
        session.commit()
        session.refresh(event)
        return event


# ---------- Story Continuity Validation ----------
def validate_story_continuity(world_id: int, user_id: str) -> Dict:
    """Detect lore inconsistencies across the entire world"""
    report = {"world_id": world_id, "issues": [], "warnings": [], "consistency_score": 100}
    if MODE == "mock":
        # Check timeline consistency
        events = [e for e in _mock_timeline_events.values() if e.world_id == world_id and e.user_id == user_id]
        seen_titles = set()
        for event in events:
            if event.title in seen_titles:
                report["issues"].append(f"Duplicate timeline event title: {event.title}")
                report["consistency_score"] -= 10
            seen_titles.add(event.title)
            # Check if related characters exist
            for char_id in event.related_character_ids:
                if char_id not in [c.id for c in _mock_characters.values() if c.world_id == world_id]:
                    report["warnings"].append(f"Event {event.title} references non-existent character ID {char_id}")
                    report["consistency_score"] -= 5
            # Check if related locations exist
            for loc_id in event.related_location_ids:
                if loc_id not in [l.id for l in _mock_locations.values() if l.world_id == world_id]:
                    report["warnings"].append(f"Event {event.title} references non-existent location ID {loc_id}")
                    report["consistency_score"] -= 5
        # Check character trait consistency (mock: no conflicts)
        characters = [c for c in _mock_characters.values() if c.world_id == world_id and c.user_id == user_id]
        for char in characters:
            if len(char.traits) == 0:
                report["warnings"].append(f"Character {char.name} has no defined traits")
                report["consistency_score"] -= 3
        report["consistency_score"] = max(0, report["consistency_score"])
        return report
    return report
def get_world_relationship_graph(world_id: int, user_id: str) -> Dict:
    """Generate relationship graph (nodes + edges) for the world"""
    if MODE == "mock":
        nodes = []
        edges = []
        # Add characters as nodes
        characters = [c for c in _mock_characters.values() if c.world_id == world_id and c.user_id == user_id]
        for char in characters:
            nodes.append({"id": f"char_{char.id}", "type": "character", "label": char.name})
        # Add locations as nodes
        locations = [l for l in _mock_locations.values() if l.world_id == world_id and l.user_id == user_id]
        for loc in locations:
            nodes.append({"id": f"loc_{loc.id}", "type": "location", "label": loc.name})
        # Add timeline events as nodes
        events = [e for e in _mock_timeline_events.values() if e.world_id == world_id and e.user_id == user_id]
        for event in events:
            nodes.append({"id": f"event_{event.id}", "type": "event", "label": event.title})
            # Add edges to related characters/locations
            for char_id in event.related_character_ids:
                if f"char_{char_id}" in [n["id"] for n in nodes]:
                    edges.append({"source": f"event_{event.id}", "target": f"char_{char_id}", "label": "involves"})
            for loc_id in event.related_location_ids:
                if f"loc_{loc_id}" in [n["id"] for n in nodes]:
                    edges.append({"source": f"event_{event.id}", "target": f"loc_{loc_id}", "label": "occurs_at"})
        return {"nodes": nodes, "edges": edges}
    return {"nodes": [], "edges": []}
def generate_timeline_from_lore(world_id: int, user_id: str) -> List[TimelineEvent]:
    """Auto-generate timeline events from existing lore entries"""
    if MODE == "mock":
        # Get all lore entries for this world
        lore_entries = [e for e in _mock_lore_entries.values() if e.world_id == world_id and e.user_id == user_id]
        events = []
        for lore in lore_entries:
            event = TimelineEvent(
                id=_get_next_id("timeline"),
                title=f"Event: {lore.title}",
                description=lore.content[:200] if lore.content else "",
                event_date=datetime.utcnow(),  # Mock date
                world_id=world_id,
                related_character_ids=[],
                related_location_ids=[],
                user_id=user_id
            )
            _mock_timeline_events[event.id] = event
            events.append(event)
        return events
    # Prod mode: query lore from DB, generate events
    return []
def create_lore_entry(world_id: int, title: str, content: str, category: str, tags: List[str], user_id: str) -> Optional[LoreEntry]:
    if not get_world(world_id, user_id):
        return None
    if MODE == "mock":
        entry = LoreEntry(
            id=_get_next_id("lore"),
            title=title,
            content=content,
            category=category,
            tags=tags,
            world_id=world_id,
            user_id=user_id
        )
        _mock_lore_entries[entry.id] = entry
        return entry
    from app.database import engine
    with Session(engine) as session:
        entry = LoreEntry(title=title, content=content, category=category, tags=tags, world_id=world_id, user_id=user_id)
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return entry


# ---------- Consistency Checks ----------
def check_character_consistency(character_id: int, new_traits: Dict) -> bool:
    """Check if new character traits conflict with existing ones"""
    if MODE == "mock":
        char = _mock_characters.get(character_id)
        if not char:
            return True
        # Check all overlapping keys for conflicts
        for key in set(char.traits.keys()).intersection(new_traits.keys()):
            if char.traits[key] != new_traits[key]:
                return False
        return True
    return True


def get_character_consistency_report(character_id: int) -> Dict:
    """Generate detailed consistency report for a character"""
    if MODE == "mock":
        char = _mock_characters.get(character_id)
        if not char:
            return {"error": "Character not found"}
        return {
            "character_id": character_id,
            "name": char.name,
            "trait_count": len(char.traits),
            "traits": char.traits,
            "consistency_score": 100,  # Mock: always 100 for now
            "issues": []
        }
    return {}


def validate_character_for_generation(character_id: int, generation_traits: Dict) -> (bool, List[str]):
    """Validate character traits against a generation request, return (is_valid, issues)"""
    issues = []
    if MODE == "mock":
        char = _mock_characters.get(character_id)
        if not char:
            issues.append("Character not found")
            return (False, issues)
        # Check for conflicting traits in generation request
        for key in generation_traits:
            if key in char.traits and char.traits[key] != generation_traits[key]:
                issues.append(f"Trait conflict: {key} expected {char.traits[key]}, got {generation_traits[key]}")
        return (len(issues) == 0, issues)
    return (True, [])


def check_timeline_consistency(event: TimelineEvent) -> bool:
    """Check if timeline event dates align with existing events"""
    if MODE == "mock":
        world_events = [e for e in _mock_timeline_events.values() if e.world_id == event.world_id]
        for existing in world_events:
            if existing.id == event.id:
                continue
            # No overlapping events with same title on same date
            if existing.title == event.title and existing.event_date == event.event_date:
                return False
        return True
    return True
