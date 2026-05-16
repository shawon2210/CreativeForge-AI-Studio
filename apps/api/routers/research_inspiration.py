import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.research_inspiration_service import ResearchInspirationService

router = APIRouter(prefix="/research", tags=["AI Research & Inspiration Engine"])

# Initialize service with dual mode
service = ResearchInspirationService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/topics/")
async def create_topic(
    user_id: str = Body(...),
    topic_name: str = Body(...),
    description: str = Body(None),
    keywords: list = Body([])
):
    """Create a new research topic"""
    try:
        return await service.create_topic(
            user_id, topic_name, description, keywords
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create topic: {str(e)}")

@router.post("/papers/")
async def add_paper(
    topic_id: str = Body(...),
    title: str = Body(...),
    authors: list = Body([]),
    abstract: str = Body(None),
    url: str = Body(None),
    relevance_score: float = Body(0.0)
):
    """Add a research paper to a topic"""
    try:
        result = await service.add_paper(
            topic_id, title, authors, abstract, url, relevance_score
        )
        if not result:
            raise HTTPException(status_code=404, detail="Topic not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add paper: {str(e)}")

@router.post("/inspirations/")
async def create_inspiration(
    user_id: str = Body(...),
    source_type: str = Body(...),
    title: str = Body(...),
    description: str = Body(None),
    url: str = Body(None),
    tags: list = Body([]),
    rating: int = Body(0)
):
    """Create a new inspiration source"""
    try:
        return await service.create_inspiration(
            user_id, source_type, title, description, url, tags, rating
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create inspiration: {str(e)}")

@router.get("/topics/{topic_id}/")
async def get_topic_with_papers(topic_id: str):
    """Get research topic with all papers"""
    try:
        result = await service.get_topic_with_papers(topic_id)
        if not result:
            raise HTTPException(status_code=404, detail="Topic not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get topic: {str(e)}")

@router.get("/inspirations/")
async def get_user_inspirations(
    user_id: str = Query(...),
    source_type: str = Query(None)
):
    """Get all inspiration sources for a user"""
    try:
        return await service.get_user_inspirations(user_id, source_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get inspirations: {str(e)}")
