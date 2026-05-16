import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.knowledge_graph_service import KnowledgeGraphService

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph"])

# Initialize service with dual mode
service = KnowledgeGraphService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/entities/")
async def create_entity(
    user_id: str = Body(...),
    entity_name: str = Body(...),
    entity_type: str = Body(...),
    description: str = Body(None),
    properties: dict = Body({})
):
    """Create a new knowledge entity"""
    try:
        return await service.create_entity(user_id, entity_name, entity_type, description, properties)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create entity: {str(e)}")

@router.post("/relations/")
async def create_relation(
    source_entity_id: str = Body(...),
    target_entity_id: str = Body(...),
    relation_type: str = Body(...),
    weight: float = Body(1.0),
    metadata: dict = Body({})
):
    """Create a relationship between two entities"""
    try:
        result = await service.create_relation(source_entity_id, target_entity_id, relation_type, weight, metadata)
        if not result:
            raise HTTPException(status_code=404, detail="Source or target entity not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create relation: {str(e)}")

@router.post("/graphs/")
async def create_graph(
    user_id: str = Body(...),
    graph_name: str = Body(...),
    description: str = Body(None)
):
    """Create a new knowledge graph"""
    try:
        return await service.create_graph(user_id, graph_name, description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create graph: {str(e)}")

@router.get("/graphs/")
async def get_user_graphs(
    user_id: str = Query(...)
):
    """Get all knowledge graphs for a user"""
    try:
        return await service.get_user_graphs(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get graphs: {str(e)}")

@router.get("/graphs/{graph_id}/entities/")
async def get_graph_entities(graph_id: str):
    """Get all entities in a graph"""
    try:
        return await service.get_graph_entities(graph_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get entities: {str(e)}")

@router.get("/entities/{entity_id}/relations/")
async def get_entity_relations(entity_id: str):
    """Get all relations for an entity"""
    try:
        return await service.get_entity_relations(entity_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get relations: {str(e)}")
