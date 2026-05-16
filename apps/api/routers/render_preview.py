import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.render_preview_service import RenderPreviewService

router = APIRouter(prefix="/render-preview", tags=["Render Preview"])

# Initialize service with dual mode
service = RenderPreviewService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/jobs/")
async def create_render_job(
    user_id: str = Body(...),
    generation_id: int = Body(...),
    render_settings: dict = Body(default={})
):
    """Create a new render job"""
    try:
        return await service.create_render_job(user_id, generation_id, render_settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create render job: {str(e)}")

@router.get("/jobs/{job_id}")
async def get_render_status(job_id: str):
    """Get render job status"""
    try:
        job = await service.get_render_status(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

@router.get("/jobs/{job_id}/preview/")
async def get_render_preview(job_id: str):
    """Get render preview for a completed job"""
    try:
        preview = await service.get_render_preview(job_id)
        if not preview:
            raise HTTPException(status_code=404, detail="Preview not found or job not complete")
        return preview
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get preview: {str(e)}")
