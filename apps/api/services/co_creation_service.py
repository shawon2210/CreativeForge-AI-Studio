import os
import sys; sys.path.append(str(__file__ + "/../../"))
from typing import Dict, Optional, List, Any
from datetime import datetime
from sqlmodel import Session, select

from models.co_creation import CoCreationSession, LiveSuggestion, PredictiveState

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_sessions: Dict[int, CoCreationSession] = {}
_mock_suggestions: List[LiveSuggestion] = []
_mock_states: Dict[int, PredictiveState] = {}
_mock_session_id = 1
_mock_suggestion_id = 1
_mock_state_id = 1


# ---------- Session Management ----------
def create_session(user_id: str, session_type: str = "text", context: Dict = None) -> CoCreationSession:
    if MODE == "mock":
        global _mock_session_id
        session = CoCreationSession(
            id=_mock_session_id,
            user_id=user_id,
            session_type=session_type,
            context=context or {},
            status="active"
        )
        _mock_sessions[_mock_session_id] = session
        _mock_session_id += 1
        return session
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        db_session = CoCreationSession(
            user_id=user_id,
            session_type=session_type,
            context=context or {},
            status="active"
        )
        session.add(db_session)
        session.commit()
        session.refresh(db_session)
        return db_session


def get_session(session_id: int, user_id: str) -> Optional[CoCreationSession]:
    if MODE == "mock":
        s = _mock_sessions.get(session_id)
        return s if s and s.user_id == user_id else None
    from app.database import engine
    with Session(engine) as session:
        return session.exec(
            select(CoCreationSession).where(
                CoCreationSession.id == session_id,
                CoCreationSession.user_id == user_id
            )
        ).first()


# ---------- Prediction Service ----------
def predict_intent(text: str) -> Dict[str, Any]:
    """Predict user intent from partial text"""
    text_lower = text.lower()
    intent = {"subject": "unknown", "genre": "unknown", "style": "unknown"}
    confidence = {"subject": 0.0, "genre": 0.0, "style": 0.0}
    
    # Mock prediction: keyword matching
    if "cyberpunk" in text_lower:
        intent["genre"] = "cyberpunk"
        confidence["genre"] = 0.9
    if "warrior" in text_lower or "fighter" in text_lower:
        intent["subject"] = "warrior"
        confidence["subject"] = 0.8
    if "cinematic" in text_lower:
        intent["style"] = "cinematic"
        confidence["style"] = 0.85
    
    return {"intent": intent, "confidence": confidence, "text_analyzed": text[:50]}


def generate_suggestions(text: str, position: int, user_id: str) -> List[LiveSuggestion]:
    """Generate live suggestions as user types"""
    suggestions = []
    text_lower = text.lower()
    
    # Mock suggestions based on keywords
    suggestion_map = {
        "cyberpunk": ["with neon lights", "in dystopian city", "with high-tech implants"],
        "warrior": ["with glowing sword", "in battle armor", "with scarred face"],
        "landscape": ["with mountains", "at sunset", "with dramatic clouds"]
    }
    
    if MODE == "mock":
        global _mock_suggestion_id
        for keyword, completions in suggestion_map.items():
            if keyword in text_lower:
                for comp in completions:
                    suggestion = LiveSuggestion(
                        id=_mock_suggestion_id,
                        session_id=1,  # Mock session
                        suggestion_type="prompt_completion",
                        content=text + " " + comp,
                        confidence=0.8,
                        position=position,
                        user_id=user_id
                    )
                    _mock_suggestions.append(suggestion)
                    suggestions.append(suggestion)
                    _mock_suggestion_id += 1
        return suggestions
    return []


def generate_live_preview(text: str) -> Dict[str, Any]:
    """Generate live preview of generation based on current text"""
    intent = predict_intent(text)
    return {
        "preview_type": "mock_image",
        "preview_url": f"https://mock.example.com/preview?text={text[:20]}",
        "intent": intent["intent"],
        "estimated_quality": 0.75
    }


def update_predictive_state(session_id: int, text: str, user_id: str) -> PredictiveState:
    """Update the predictive state for a session"""
    intent = predict_intent(text)
    if MODE == "mock":
        global _mock_state_id
        if session_id in _mock_states:
            state = _mock_states[session_id]
            state.predicted_intent = intent["intent"]
            state.predicted_elements = list(intent["intent"].values())
            state.confidence_scores = intent["confidence"]
            state.updated_at = datetime.utcnow()
            return state
        else:
            state = PredictiveState(
                id=_mock_state_id,
                session_id=session_id,
                predicted_intent=intent["intent"],
                predicted_elements=list(intent["intent"].values()),
                confidence_scores=intent["confidence"],
                user_id=user_id
            )
            _mock_states[_mock_state_id] = state
            _mock_state_id += 1
            return state
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        state = session.exec(
            select(PredictiveState).where(PredictiveState.session_id == session_id)
        ).first()
        if state:
            state.predicted_intent = intent["intent"]
            state.predicted_elements = list(intent["intent"].values())
            state.confidence_scores = intent["confidence"]
            state.updated_at = datetime.utcnow()
            session.add(state)
            session.commit()
            session.refresh(state)
            return state
        else:
            state = PredictiveState(
                session_id=session_id,
                predicted_intent=intent["intent"],
                predicted_elements=list(intent["intent"].values()),
                confidence_scores=intent["confidence"],
                user_id=user_id
            )
            session.add(state)
            session.commit()
            session.refresh(state)
            return state
