import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.asset_management_service import AssetManagementService

router = APIRouter(prefix="/asset-management", tags=["Asset Management"])

# Initialize service with dual mode
service = AssetManagementService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/assets/")
async def upload_asset(
    user_id: str = Body(...),
    filename: str = Body(...),
    file_url: str = Body(...),
    file_type: str = Body(...),
    file_size: int = Body(...),
    metadata: dict = Body(default={})
):
    """Upload a new asset"""
    try:
        return await service.upload_asset(user_id, filename, file_url, file_type, file_size, metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload asset: {str(e)}")

@router.get("/assets/")
async def get_assets(
    user_id: str = Query(...),
    file_type: str = Query(None),
    tag: str = Query(None)
):
    """Get all assets for a user"""
    try:
        return await service.get_assets(user_id, file_type, tag)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assets: {str(e)}")

@router.post("/assets/{asset_id}/tags/")
async def add_tag_to_asset(
    asset_id: str,
    tag: str = Body(...)
):
    """Add a tag to an asset"""
    try:
        result = await service.add_tag_to_asset(asset_id, tag)
        if not result:
            raise HTTPException(status_code=404, detail="Asset not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add tag: {str(e)}")

@router.post("/collections/")
async def create_collection(
    user_id: str = Body(...),
    name: str = Body(...),
    description: str = Body(None)
):
    """Create a new asset collection"""
    try:
        return await service.create_collection(user_id, name, description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")

@router.post("/collections/{collection_id}/assets/")
async def add_asset_to_collection(
    collection_id: str,
    asset_id: str = Body(...)
):
    """Add an asset to a collection"""
    try:
        result = await service.add_asset_to_collection(collection_id, asset_id)
        if not result:
            raise HTTPException(status_code=404, detail="Collection or asset not found")
        return {"status": "added"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add asset to collection: {str(e)}")
