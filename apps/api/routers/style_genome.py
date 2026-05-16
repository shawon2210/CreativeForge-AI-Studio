import os
from fastapi import APIRouter, Body, HTTPException

router = APIRouter(prefix="/style-genome", tags=["Style Genome"])

# Mock style DNA store
mock_style_dnas = {
    "mock_user_123": {
        "user_id": "mock_user_123",
        "style_fingerprint": {"cinematic": 0.8, "neon": 0.7, "dystopian": 0.9},
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
}

@router.get("/{user_id}")
async def get_user_style_dna(user_id: str):
    """Retrieve a user's style DNA (mock)"""
    return mock_style_dnas.get(user_id, {
        "user_id": user_id,
        "style_fingerprint": {},
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    })

@router.post("/mutate/")
async def mutate_style(
    user_id: str = Body(...),
    mutation_params: dict = Body(...)
):
    """Mutate a user's style DNA based on parameters (mock)"""
    if user_id not in mock_style_dnas:
        mock_style_dnas[user_id] = {
            "user_id": user_id,
            "style_fingerprint": {},
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    # Apply mock mutation
    for key, value in mutation_params.items():
        mock_style_dnas[user_id]["style_fingerprint"][key] = value
    mock_style_dnas[user_id]["updated_at"] = "2024-01-01T00:00:00"
    return {"status": "mutated", "style_dna": mock_style_dnas[user_id]}

@router.post("/evolve/")
async def evolve_style(
    user_id: str = Body(...),
    feedback: dict = Body(...)
):
    """Evolve style DNA based on user feedback (mock)"""
    if user_id not in mock_style_dnas:
        return {"status": "no_style_dna", "message": "Create style DNA first"}
    # Apply mock evolution
    if "boost" in feedback:
        for key in feedback["boost"]:
            if key in mock_style_dnas[user_id]["style_fingerprint"]:
                mock_style_dnas[user_id]["style_fingerprint"][key] = min(1.0, mock_style_dnas[user_id]["style_fingerprint"][key] + 0.1)
    mock_style_dnas[user_id]["updated_at"] = "2024-01-01T00:00:00"
    return {"status": "evolved", "style_dna": mock_style_dnas[user_id]}