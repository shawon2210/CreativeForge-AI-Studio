import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.asset_management_service import AssetManagementService

router = APIRouter(prefix="/asset-management", tags=["Asset Management"])

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
    try:
        return await service.get_assets(user_id, file_type, tag)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assets: {str(e)}")

@router.post("/assets/{asset_id}/tags/")
async def add_tag_to_asset(
    asset_id: str,
    body: dict = Body(...)
):
    tag = body.get("tag", "")
    if not tag:
        raise HTTPException(status_code=422, detail="tag is required in body")
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
    try:
        return await service.create_collection(user_id, name, description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")

@router.post("/collections/{collection_id}/assets/")
async def add_asset_to_collection(
    collection_id: str,
    body: dict = Body(...)
):
    asset_id = body.get("asset_id", "")
    if not asset_id:
        raise HTTPException(status_code=422, detail="asset_id is required in body")
    try:
        result = await service.add_asset_to_collection(collection_id, asset_id)
        if not result:
            raise HTTPException(status_code=404, detail="Collection or asset not found")
        return {"status": "added"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add asset to collection: {str(e)}")
