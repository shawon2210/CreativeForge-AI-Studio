import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.marketplace_service import MarketplaceService

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

# Initialize service with dual mode
service = MarketplaceService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/items/")
async def create_item(
    seller_id: str = Body(...),
    item_name: str = Body(...),
    description: str = Body(...),
    item_type: str = Body(...),
    price: float = Body(0.0),
    download_url: str = Body(None),
    preview_url: str = Body(None)
):
    """Create a new marketplace item"""
    try:
        return await service.create_item(
            seller_id, item_name, description, item_type, 
            price, download_url, preview_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create item: {str(e)}")

@router.get("/items/")
async def get_marketplace_items(
    item_type: str = Query(None),
    status: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None)
):
    """Get all marketplace items with optional filters"""
    try:
        return await service.get_marketplace_items(
            item_type, status, min_price, max_price
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get items: {str(e)}")

@router.post("/transactions/")
async def purchase_item(
    item_id: str = Body(...),
    buyer_id: str = Body(...),
    amount: float = Body(...)
):
    """Purchase a marketplace item (create transaction)"""
    try:
        result = await service.purchase_item(item_id, buyer_id, amount)
        if not result:
            raise HTTPException(status_code=404, detail="Item not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to purchase item: {str(e)}")

@router.post("/reviews/")
async def create_review(
    item_id: str = Body(...),
    reviewer_id: str = Body(...),
    rating: int = Body(...),
    review_text: str = Body(None)
):
    """Create a review for a marketplace item"""
    try:
        result = await service.create_review(item_id, reviewer_id, rating, review_text)
        if not result:
            raise HTTPException(status_code=404, detail="Item not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create review: {str(e)}")

@router.get("/items/{item_id}/reviews/")
async def get_item_reviews(item_id: str):
    """Get all reviews for a marketplace item"""
    try:
        item = service.mock_items.get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item.get("reviews", [])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reviews: {str(e)}")
