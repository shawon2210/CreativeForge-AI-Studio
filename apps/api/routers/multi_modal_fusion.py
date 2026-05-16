import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.multi_modal_fusion_service import MultiModalFusionService

router = APIRouter(prefix="/multi-modal-fusion", tags=["Multi-Modal Fusion"])

# Initialize service with dual mode
service = MultiModalFusionService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/jobs/")
async def create_fusion_job(
    user_id: str = Body(...),
    prompt: str = Body(...),
    inputs: list = Body(...),
    fusion_type: str = Body("default")
):
    """Create a new fusion job with multiple modal inputs"""
    try:
        return await service.create_fusion_job(user_id, prompt, inputs, fusion_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create fusion job: {str(e)}")

@router.get("/jobs/{job_id}")
async def get_fusion_status(job_id: str):
    """Get fusion job status"""
    try:
        job = await service.get_fusion_status(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

@router.get("/jobs/")
async def get_user_fusion_jobs(
    user_id: str = Query(...),
    status: str = Query(None)
):
    """Get all fusion jobs for a user"""
    try:
        return await service.get_user_fusion_jobs(user_id, status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get fusion jobs: {str(e)}")
