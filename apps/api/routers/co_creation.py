import sys
from pathlib import Path
from fastapi import APIRouter, Body
from typing import Dict, List, Optional

sys.path.append(str(Path(__file__).parent.parent))
from services.co_creation_service import (
    create_session, get_session,
    predict_intent, generate_suggestions, generate_live_preview,
    update_predictive_state, LiveSuggestion, PredictiveState, CoCreationSession
)

router = APIRouter(prefix="/co-creation", tags=["Real-Time Co-Creation"])

@router.post("/session/create/", response_model=CoCreationSession)
async def create_session_endpoint(
    user_id: str = Body(...),
    session_type: str = Body(default="text"),
    context: Dict = Body(default={})
):
    return create_session(user_id=user_id, session_type=session_type, context=context)

@router.get("/session/{session_id}/", response_model=Optional[CoCreationSession])
async def get_session_endpoint(session_id: int, user_id: str = Body(...)):
    return get_session(session_id=session_id, user_id=user_id)

@router.post("/predict-intent/", response_model=Dict)
async def predict_intent_endpoint(body: dict = Body(...)):
    return predict_intent(text=body.get("text", ""))

@router.post("/suggestions/", response_model=List[LiveSuggestion])
async def get_suggestions_endpoint(
    text: str = Body(...),
    position: int = Body(...),
    user_id: str = Body(...)
):
    return generate_suggestions(text=text, position=position, user_id=user_id)

@router.post("/live-preview/", response_model=Dict)
async def live_preview_endpoint(body: dict = Body(...)):
    return generate_live_preview(text=body.get("text", ""))

@router.post("/state/update/", response_model=PredictiveState)
async def update_state_endpoint(
    session_id: int = Body(...),
    text: str = Body(...),
    user_id: str = Body(...)
):
    return update_predictive_state(session_id=session_id, text=text, user_id=user_id)

@router.get("/state/{session_id}/", response_model=Optional[PredictiveState])
async def get_state_endpoint(session_id: int):
    from services.co_creation_service import _mock_states
    return _mock_states.get(session_id)

@router.get("/live-updates/{session_id}/")
async def live_updates_endpoint(session_id: int, last_update: Optional[float] = None):
    return {
        "session_id": session_id,
        "timestamp": 1234567890.123,
        "updates": [
            {"type": "suggestion", "content": "Mock live suggestion"},
            {"type": "preview", "url": "https://mock.example.com/live-preview"}
        ],
        "has_more": False
    }
