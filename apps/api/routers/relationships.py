from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

# Mock router for relationship mapping
router = APIRouter(prefix="/relationships", tags=["relationships"])

# In-memory storage for demo (in prod, use database)
relationship_store: List[Dict[str, Any]] = []
asset_store: List[Dict[str, Any]] = []

@router.post("/analyze")
async def analyze_relationships(assets: List[Dict[str, Any]]):
    """Analyze relationships between a list of assets"""
    from app.services.relationship_mapper import relationship_mapper
    
    # Store assets
    for asset in assets:
        if asset.get('id') not in [a.get('id') for a in asset_store]:
            asset_store.append(asset)
    
    # Detect relationships
    relationships = relationship_mapper.detect_relationships(assets)
    
    # Store relationships
    relationship_store.extend(relationships)
    
    return {
        "assets_analyzed": len(assets),
        "relationships_found": len(relationships),
        "relationships": relationships
    }

@router.post("/suggest-links")
async def suggest_links(
    new_asset: Dict[str, Any],
    existing_assets: List[Dict[str, Any]]
):
    """Suggest potential links for a new asset"""
    from app.services.relationship_mapper import relationship_mapper
    
    suggestions = relationship_mapper.suggest_links(new_asset, existing_assets)
    
    return {
        "new_asset_id": new_asset.get('id'),
        "suggestions_count": len(suggestions),
        "suggestions": suggestions
    }

@router.post("/link")
async def create_manual_link(
    source_id: str,
    target_id: str,
    relation_type: str = "manual_link",
    metadata: Dict[str, Any] = {}
):
    """Manually create a link between two assets"""
    link = {
        "source": source_id,
        "target": target_id,
        "type": relation_type,
        "strength": 1.0,
        "metadata": metadata,
        "is_manual": True
    }
    
    relationship_store.append(link)
    
    return {
        "status": "success",
        "link": link
    }

@router.get("/graph")
async def get_relationship_graph():
    """Get the full relationship graph (nodes + edges)"""
    return {
        "nodes": asset_store,
        "edges": relationship_store,
        "node_count": len(asset_store),
        "edge_count": len(relationship_store)
    }

@router.delete("/clear")
async def clear_graph():
    """Clear all relationships and assets (for testing)"""
    relationship_store.clear()
    asset_store.clear()
    return {"status": "cleared"}
