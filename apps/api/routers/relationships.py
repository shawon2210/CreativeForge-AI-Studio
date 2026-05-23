import sys
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException
from typing import List, Dict, Any

sys.path.append(str(Path(__file__).parent.parent))

router = APIRouter(prefix="/relationships", tags=["relationships"])

relationship_store: List[Dict[str, Any]] = []
asset_store: List[Dict[str, Any]] = []

@router.post("/analyze")
async def analyze_relationships(assets: List[Dict[str, Any]]):
    from services.relationship_mapper import relationship_mapper
    for asset in assets:
        if asset.get('id') not in [a.get('id') for a in asset_store]:
            asset_store.append(asset)
    relationships = relationship_mapper.detect_relationships(assets)
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
    from services.relationship_mapper import relationship_mapper
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
    link = {
        "source": source_id,
        "target": target_id,
        "type": relation_type,
        "strength": 1.0,
        "metadata": metadata,
        "is_manual": True
    }
    relationship_store.append(link)
    return {"status": "success", "link": link}

@router.get("/graph")
async def get_relationship_graph():
    return {
        "nodes": asset_store,
        "edges": relationship_store,
        "node_count": len(asset_store),
        "edge_count": len(relationship_store)
    }

@router.delete("/clear")
async def clear_graph():
    relationship_store.clear()
    asset_store.clear()
    return {"status": "cleared"}
