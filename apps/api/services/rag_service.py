import logging
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.models.creative_memory import CreativeMemory  # Will create this model next

logger = logging.getLogger(__name__)

# Load lightweight embedding model (384 dimensions)
MODEL_NAME = "all-MiniLM-L6-v2"
_embedder = None

def get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        logger.info(f"Loading embedding model: {MODEL_NAME}")
        _embedder = SentenceTransformer(MODEL_NAME)
    return _embedder

def embed_text(text: str) -> List[float]:
    """Generate vector embedding for input text"""
    embedder = get_embedder()
    return embedder.encode(text).tolist()

def store_memory(
    db: Session,
    user_id: str,
    content_type: str,
    content_text: str,
    metadata: Dict[str, Any] = None
) -> CreativeMemory:
    """Store a new memory entry with vector embedding"""
    embedding = embed_text(content_text)
    memory = CreativeMemory(
        user_id=user_id,
        content_type=content_type,
        content_text=content_text,
        embedding=embedding,
        metadata=metadata or {}
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory

def retrieve_similar_memories(
    db: Session,
    user_id: str,
    query_text: str,
    limit: int = 5
) -> List[CreativeMemory]:
    """Retrieve top similar memories for a user"""
    query_embedding = embed_text(query_text)
    # Using pgvector cosine similarity search
    memories = (
        db.query(CreativeMemory)
        .filter(CreativeMemory.user_id == user_id)
        .order_by(CreativeMemory.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .all()
    )
    return memories
