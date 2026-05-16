import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.future_ready_service import FutureReadyService

router = APIRouter(prefix="/future-ready", tags=["Future-Ready Expansions"])

# Initialize service with dual mode
service = FutureReadyService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/features/")
async def create_feature(
    feature_name: str = Body(...),
    description: str = Body(None),
    category: str = Body("tech"),
    priority: str = Body("medium"),
    target_date: str = Body(None)  # ISO format string
):
    """Create a new future feature"""
    try:
        from datetime import datetime
        target_dt = datetime.fromisoformat(target_date) if target_date else None
        return await service.create_feature(
            feature_name, description, category, priority, target_dt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create feature: {str(e)}")

@router.post("/roadmap/")
async def add_roadmap_item(
    feature_id: str = Body(...),
    milestone_name: str = Body(...),
    target_quarter: str = Body(...),
    milestone_description: str = Body(None),
    dependencies: list = Body([])
):
    """Add a roadmap milestone to a feature"""
    try:
        result = await service.add_roadmap_item(
            feature_id, milestone_name, target_quarter, milestone_description, dependencies
        )
        if not result:
            raise HTTPException(status_code=404, detail="Feature not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add roadmap item: {str(e)}")

@router.post("/expansion-plans/")
async def create_expansion_plan(
    plan_name: str = Body(...),
    target_market: str = Body(...),
    strategy: str = Body(...),
    budget_allocated: float = Body(0.0),
    expected_roi: float = Body(0.0),
    timeline_months: int = Body(12)
):
    """Create a new expansion plan"""
    try:
        return await service.create_expansion_plan(
            plan_name, target_market, strategy, budget_allocated, expected_roi, timeline_months
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create expansion plan: {str(e)}")

@router.get("/features/")
async def get_all_features(
    category: str = Query(None),
    status: str = Query(None)
):
    """Get all future features, optionally filtered"""
    try:
        return await service.get_all_features(category, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get features: {str(e)}")

@router.get("/features/{feature_id}/")
async def get_feature_with_roadmap(feature_id: str):
    """Get future feature with all roadmap items"""
    try:
        result = await service.get_feature_with_roadmap(feature_id)
        if not result:
            raise HTTPException(status_code=404, detail="Feature not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feature: {str(e)}")
