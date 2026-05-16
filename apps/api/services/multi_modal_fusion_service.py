import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class MultiModalFusionService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_fusion_jobs = {}
        self.mock_inputs = {}
        self.mock_outputs = {}
        
    async def create_fusion_job(
        self,
        user_id: str,
        prompt: str,
        inputs: List[Dict],  # List of {modality_type, input_data, metadata}
        fusion_type: str = "default"
    ) -> Dict:
        """Create a new fusion job with multiple modal inputs"""
        job_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        job = {
            "id": job_id,
            "user_id": user_id,
            "prompt": prompt,
            "status": "processing",  # Mock starts processing immediately
            "fusion_type": fusion_type,
            "created_at": now,
            "updated_at": now,
            "inputs": [],
            "outputs": []
        }
        
        if self.mode == "mock":
            self.mock_fusion_jobs[job_id] = job
            
            # Create inputs
            for input_data in inputs:
                input_id = str(uuid.uuid4())
                input_obj = {
                    "id": input_id,
                    "fusion_job_id": job_id,
                    "modality_type": input_data.get("modality_type", "text"),
                    "input_data": input_data.get("input_data", ""),
                    "metadata": input_data.get("metadata", {}),
                    "created_at": now
                }
                self.mock_inputs[input_id] = input_obj
                job["inputs"].append(input_obj)
            
            return job
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_fusion_status(self, job_id: str) -> Optional[Dict]:
        """Get fusion job status"""
        if self.mode == "mock":
            job = self.mock_fusion_jobs.get(job_id)
            if job:
                # Simulate completion in mock mode
                if job["status"] == "processing":
                    job["status"] = "completed"
                    job["updated_at"] = datetime.utcnow().isoformat()
                    # Generate mock output if not exists
                    if not job.get("outputs"):
                        await self._generate_mock_output(job_id)
            return job
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def _generate_mock_output(self, job_id: str):
        """Generate mock output for a fusion job"""
        job = self.mock_fusion_jobs.get(job_id)
        if not job:
            return
        
        output_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        output = {
            "id": output_id,
            "fusion_job_id": job_id,
            "output_type": "multimodal",
            "output_url": f"https://mock.example.com/fusion/{job_id}/output.json",
            "metadata": {
                "fused_modalities": [inp["modality_type"] for inp in job["inputs"]],
                "prompt": job["prompt"]
            },
            "created_at": now
        }
        
        self.mock_outputs[output_id] = output
        job["outputs"].append(output)
    
    async def get_user_fusion_jobs(
        self,
        user_id: str,
        status: Optional[str] = None
    ) -> List[Dict]:
        """Get all fusion jobs for a user"""
        if self.mode == "mock":
            jobs = list(self.mock_fusion_jobs.values())
            jobs = [j for j in jobs if j["user_id"] == user_id]
            if status:
                jobs = [j for j in jobs if j["status"] == status]
            return jobs
        else:
            raise NotImplementedError("Prod mode not implemented yet")
