import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))  # Add apps/api to Python path

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Include all feature routers for mock testing
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

# Routers that use relative imports — wrapped in try/except
try:
    from routers.co_creation import router as co_creation_router
except (ImportError, ModuleNotFoundError):
    co_creation_router = None

try:
    from routers.multi_agent import router as multi_agent_router
except (ImportError, ModuleNotFoundError):
    multi_agent_router = None

try:
    from routers.os_core import router as os_core_router
except (ImportError, ModuleNotFoundError):
    os_core_router = None

try:
    from routers.visual_node import router as visual_node_router
except (ImportError, ModuleNotFoundError):
    visual_node_router = None

try:
    from routers.relationships import router as relationships_router
except (ImportError, ModuleNotFoundError):
    relationships_router = None

# Workflow sub-routers
try:
    from routers.workflow.save import router as workflow_save_router
except (ImportError, ModuleNotFoundError):
    workflow_save_router = None

try:
    from routers.workflow.execute import router as workflow_execute_router
except (ImportError, ModuleNotFoundError):
    workflow_execute_router = None

try:
    from routers.workflow.nodes import router as workflow_nodes_router
except (ImportError, ModuleNotFoundError):
    workflow_nodes_router = None

try:
    from routers.workflow.validate import router as workflow_validate_router
except (ImportError, ModuleNotFoundError):
    workflow_validate_router = None

# World Engine - wrapped for mock mode (sqlmodel not installed)
try:
    from routers.world_engine import router as world_router
except (ImportError, ModuleNotFoundError):
    world_router = None

# Emotion AI - wrapped for mock mode (sqlmodel not installed)
try:
    from routers.emotion_ai import router as emotion_router
except (ImportError, ModuleNotFoundError):
    emotion_router = None

app = FastAPI(title="CreativeForge API - Mock Mode")

# CORS (allow frontend on port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "mock"}

@app.post("/generations/")
async def create_generation(
    prompt: str = Body(...),
    user_id: str = Body(...),
    emotion: str = Body(default="calm"),
    intensity: float = Body(default=0.5)
):
    """Mock generation endpoint - no database required"""
    agent_analysis = {
        "original_prompt": prompt,
        "intent": {"subject": "unknown", "genre": "unknown", "style": "unknown"},
        "weakness_analysis": {"is_weak": False, "quality_score": 80, "issues": []},
        "suggestions": {
            "atmosphere": ["cinematic lighting"],
            "cinematic_framing": ["wide shot"],
            "color_grading": ["teal-orange"],
            "camera_angles": ["low angle"],
            "lighting": ["neon rim lighting"],
            "alternate_directions": []
        },
        "enhanced_prompt": f"[Enhanced] {prompt} with cinematic lighting and neon atmosphere"
    }

    try:
        from services.emotion_service import map_emotion_to_visual_params
        visual_params = map_emotion_to_visual_params(emotion, intensity)
    except (ImportError, AttributeError):
        visual_params = {"saturation": 1.2, "brightness": 0.9, "contrast": 1.1}

    agent_analysis["emotion"] = {"emotion": emotion, "intensity": intensity, "visual_params": visual_params}

    try:
        from services.style_genome_service import get_user_style_dna
        style_dna = get_user_style_dna(user_id=user_id)
        if style_dna:
            agent_analysis["style_dna"] = {
                "fingerprint": style_dna.style_fingerprint,
                "applied": True
            }
        else:
            agent_analysis["style_dna"] = {"applied": False, "message": "No style DNA found"}
    except (ImportError, AttributeError):
        agent_analysis["style_dna"] = {"applied": False, "message": "Mock mode - style DNA service not available"}

    agent_analysis["multi_agent"] = {
        "director": {"enhanced_prompt": f"[Director] {prompt}"},
        "writer": {"narrative": "Mock narrative structure"},
        "visual": {"color_palette": ["#ff0000", "#00ff00"]},
        "lighting": {"setup": "three_point_lighting"},
        "consistency": {"is_consistent": True},
        "prompt_engineer": {"optimized_prompt": f"[Engineered] {prompt}"}
    }

    agent_analysis["co_creation"] = {
        "live_preview": f"https://mock.example.com/preview?text={prompt[:20]}",
        "predicted_intent": {"subject": "unknown", "genre": "unknown"},
        "suggestions": [prompt + " with neon lights", prompt + " in dystopian city"]
    }

    return {
        "original_prompt": prompt,
        "agent_analysis": agent_analysis,
        "final_enhanced_prompt": f"{agent_analysis['enhanced_prompt']}\nContext from past work: (mock memory)",
        "result": f"Mock generation result for: {prompt}",
        "similar_memories_count": 0
    }


# ── Unified Orchestrator ───────────────────────────────────────────
from services.orchestrator import CreativeForgeOrchestrator

@app.post("/pipeline/")
async def run_pipeline(
    prompt: str = Body(...),
    user_id: str = Body(default="mock_user_123"),
    options: dict = Body(default={}),
):
    """Run the full integrated pipeline across all 23 features"""
    orchestrator = CreativeForgeOrchestrator(user_id=user_id)
    result = await orchestrator.process(prompt, options)
    return result


@app.get("/pipeline/status/{pipeline_id}")
async def get_pipeline_status(pipeline_id: str):
    """Get status of a pipeline run"""
    return {"pipeline_id": pipeline_id, "status": "completed", "mode": "mock"}


# ── Register all routers ───────────────────────────────────────────
# Core feature routers (always included)
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

# Conditionally included routers
if co_creation_router:
    app.include_router(co_creation_router)
if multi_agent_router:
    app.include_router(multi_agent_router)
if os_core_router:
    app.include_router(os_core_router)
if visual_node_router:
    app.include_router(visual_node_router)
if relationships_router:
    app.include_router(relationships_router)
if workflow_save_router:
    app.include_router(workflow_save_router)
if workflow_execute_router:
    app.include_router(workflow_execute_router)
if workflow_nodes_router:
    app.include_router(workflow_nodes_router)
if workflow_validate_router:
    app.include_router(workflow_validate_router)
if world_router is not None:
    app.include_router(world_router)
if emotion_router is not None:
    app.include_router(emotion_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
