import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session, select

from ..models.os_core import SharedEmbedding

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_embeddings: List[SharedEmbedding] = []
_mock_embedding_id = 1


def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text (mock: simple hash-based)"""
    # Mock: return a simple vector
    import hashlib
    hash_obj = hashlib.md5(text.encode())
    hash_hex = hash_obj.hexdigest()
    # Convert to a list of 384 floats (matching all-MiniLM-L6-v2 dimension)
    return [float(ord(c)) / 255.0 for c in hash_hex[:384]]


def store_embedding(
    user_id: str,
    source_type: str,
    source_id: int,
    content: str,
    model_name: str = "all-MiniLM-L6-v2"
) -> SharedEmbedding:
    """Store embedding in shared system"""
    embedding = generate_embedding(content)
    
    if MODE == "mock":
        global _mock_embedding_id
        shared_emb = SharedEmbedding(
            id=_mock_embedding_id,
            user_id=user_id,
            source_type=source_type,
            source_id=source_id,
            embedding=embedding,
            model_name=model_name
        )
        _mock_embeddings.append(shared_emb)
        _mock_embedding_id += 1
        return shared_emb
    
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        shared_emb = SharedEmbedding(
            user_id=user_id,
            source_type=source_type,
            source_id=source_id,
            embedding=embedding,
            model_name=model_name
        )
        session.add(shared_emb)
        session.commit()
        session.refresh(shared_emb)
        return shared_emb


def search_similar_embeddings(
    user_id: str,
    query: str,
    source_type: Optional[str] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """Search for similar embeddings across all modules"""
    query_emb = generate_embedding(query)
    
    if MODE == "mock":
        results = []
        for emb in _mock_embeddings:
            if emb.user_id != user_id:
                continue
            if source_type and emb.source_type != source_type:
                continue
            # Mock: calculate cosine similarity (simplified)
            similarity = sum(a * b for a, b in zip(query_emb, emb.embedding)) / (
                (sum(a*a for a in query_emb) ** 0.5) * (sum(b*b for b in emb.embedding) ** 0.5)
            )
            results.append({
                "source_type": emb.source_type,
                "source_id": emb.source_id,
                "similarity": similarity,
                "model": emb.model_name
            })
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
    
    # Prod mode - would use pgvector cosine similarity
    return []


# ---------- Integration Helpers ----------
def register_generation_embedding(user_id: str, generation_id: int, prompt: str):
    """Register a generation's embedding in shared system"""
    return store_embedding(
        user_id=user_id,
        source_type="generation",
        source_id=generation_id,
        content=prompt
    )


def register_world_entity_embedding(user_id: str, entity_type: str, entity_id: int, content: str):
    """Register world entity (character, location, etc.) embedding"""
    return store_embedding(
        user_id=user_id,
        source_type=entity_type,  # "character", "location", "timeline_event"
        source_id=entity_id,
        content=content
    )


def register_style_dna_embedding(user_id: str, style_dna_id: int, fingerprint: Dict):
    """Register style DNA embedding"""
    import json
    content = json.dumps(fingerprint)
    return store_embedding(
        user_id=user_id,
        source_type="style_dna",
        source_id=style_dna_id,
        content=content
    )
