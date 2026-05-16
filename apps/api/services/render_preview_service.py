import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class RenderPreviewService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_jobs = {}  # In-memory storage for mock mode
        self.mock_previews = {}
        
    async def create_render_job(
        self, 
        user_id: str, 
        generation_id: int, 
        render_settings: Dict = None
    ) -> Dict:
        """Create a new render job"""
        job_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        job = {
            "id": job_id,
            "user_id": user_id,
            "generation_id": generation_id,
            "status": "pending",
            "render_settings": render_settings or {},
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_jobs[job_id] = job
            # Simulate async processing in mock mode
            self.mock_jobs[job_id]["status"] = "processing"
            return job
        else:
            # TODO: Implement SQLModel database storage for prod mode
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_render_status(self, job_id: str) -> Optional[Dict]:
        """Get render job status"""
        if self.mode == "mock":
            job = self.mock_jobs.get(job_id)
            if job:
                # Simulate status progression in mock mode
                if job["status"] == "processing":
                    job["status"] = "done"
                    job["updated_at"] = datetime.utcnow().isoformat()
            return job
        else:
            # TODO: Implement SQLModel query for prod mode
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_render_preview(self, job_id: str) -> Optional[Dict]:
        """Get render preview for a completed job"""
        if self.mode == "mock":
            job = await self.get_render_status(job_id)
            if not job or job["status"] != "done":
                return None
            
            if job_id not in self.mock_previews:
                preview_id = str(uuid.uuid4())
                self.mock_previews[job_id] = {
                    "id": preview_id,
                    "job_id": job_id,
                    "preview_url": f"https://mock.example.com/render/{job_id}/preview.png",
                    "thumbnail_url": f"https://mock.example.com/render/{job_id}/thumbnail.png",
                    "width": 1920,
                    "height": 1080,
                    "format": "png",
                    "created_at": datetime.utcnow().isoformat()
                }
            return self.mock_previews[job_id]
        else:
            # TODO: Implement SQLModel query for prod mode
            raise NotImplementedError("Prod mode not implemented yet")
