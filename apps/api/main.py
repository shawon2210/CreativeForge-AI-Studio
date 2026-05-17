"""
CreativeForge API - Production entry point.
Supports both mock mode (no DB) and production mode (PostgreSQL + Redis).
Set CREATIVEFORGE_MODE=mock for CI/testing, or omit for production.
"""
import os
import sys
from pathlib import Path

# Add app directory to Python path
sys.path.append(str(Path(__file__).parent))

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

MODE = os.getenv("CREATIVEFORGE_MODE", "production")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app = FastAPI(title=f"CreativeForge API - {MODE.title()} Mode")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Import all routers ----
from routers.style_genome import router as style_router
from routers.render_preview import router as render_router
from routers.asset_management import router as asset_router
from routers.prompt_to_product import router as prompt_router
from routers.multi_modal_fusion import router as fusion_router
from routers.cinematic_ai import router as cinematic_router
from routers.knowledge_graph import router as kg_router
from routers.generative_ui import router as ui_router
from routers.marketplace import router as marketplace_router
from routers.timeline_versioning import router as timeline_router
from routers.voice_driven import router as voice_router
from routers.collaborative_studio import router as collab_router
from routers.creative_twin import router as twin_router
from routers.research_inspiration import router as research_router
from routers.future_ready import router as future_router
from routers.world_engine import router as world_router
from routers.emotion_ai import router as emotion_router

# ---- Register all routers ----
app.include_router(style_router)
app.include_router(render_router)
app.include_router(asset_router)
app.include_router(prompt_router)
app.include_router(fusion_router)
app.include_router(cinematic_router)
app.include_router(kg_router)
app.include_router(ui_router)
app.include_router(marketplace_router)
app.include_router(timeline_router)
app.include_router(voice_router)
app.include_router(collab_router)
app.include_router(twin_router)
app.include_router(research_router)
app.include_router(future_router)
app.include_router(world_router)
app.include_router(emotion_router)

# ---- Health check ----
@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": MODE}

# ---- Mock generations endpoint ----
if MODE == "mock":
    @app.post("/generations/")
    async def create_generation(
        prompt: str = Body(...),
        user_id: str = Body(...),
        emotion: str = Body(default="calm"),
        intensity: float = Body(default=0.5)
    ):
        return {
            "original_prompt": prompt,
            "result": f"Mock generation result for: {prompt}",
            "emotion": emotion,
            "intensity": intensity,
            "mode": "mock"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
