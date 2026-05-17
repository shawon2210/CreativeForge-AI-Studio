import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))  # Add apps/api to Python path

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
# Include all feature routers for mock testing
# Routers that import sqlmodel-dependent services are wrapped in try/except
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
    # Mock agent analysis
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
    
    # Add emotion parameters (mock - no external service needed)
    try:
        from services.emotion_service import map_emotion_to_visual_params
        visual_params = map_emotion_to_visual_params(emotion, intensity)
    except (ImportError, AttributeError):
        # Mock emotion parameters if service not available
        visual_params = {"saturation": 1.2, "brightness": 0.9, "contrast": 1.1}
    
    agent_analysis["emotion"] = {"emotion": emotion, "intensity": intensity, "visual_params": visual_params}

    # Add style DNA parameters (mock - no external service needed)
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
        # Mock style DNA if service not available
        agent_analysis["style_dna"] = {"applied": False, "message": "Mock mode - style DNA service not available"}
    
    # Add multi-agent collaboration (mock)
    agent_analysis["multi_agent"] = {
        "director": {"enhanced_prompt": f"[Director] {prompt}"},
        "writer": {"narrative": "Mock narrative structure"},
        "visual": {"color_palette": ["#ff0000", "#00ff00"]},
        "lighting": {"setup": "three_point_lighting"},
        "consistency": {"is_consistent": True},
        "prompt_engineer": {"optimized_prompt": f"[Engineered] {prompt}"}
    }
    
    # Add co-creation live preview (mock)
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

# Include Style Genome, Render Preview, Asset Management, Prompt-to-Product, Multi-Modal Fusion, Cinematic AI, Knowledge Graph, Generative UI, Marketplace, Timeline, Voice-Driven, Collaborative Studio, Creative Twin, Research & Inspiration, and Future-Ready routers (others require sqlalchemy)
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
