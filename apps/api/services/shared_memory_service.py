import os
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlmodel import Session, select

from ..models.os_core import SharedMemory

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_shared_memories: List[SharedMemory] = []
_mock_shared_id = 1


def add_shared_memory(
    user_id: str,
    memory_type: str,
    content: str,
    source_module: str,
    metadata: Dict = None
) -> SharedMemory:
    """Add a memory to the shared memory system"""
    if MODE == "mock":
        global _mock_shared_id
        memory = SharedMemory(
            id=_mock_shared_id,
            user_id=user_id,
            memory_type=memory_type,
            content=content,
            source_module=source_module,
            metadata=metadata or {}
        )
        _mock_shared_memories.append(memory)
        _mock_shared_id += 1
        return memory
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        memory = SharedMemory(
            user_id=user_id,
            memory_type=memory_type,
            content=content,
            source_module=source_module,
            metadata=metadata or {}
        )
        session.add(memory)
        session.commit()
        session.refresh(memory)
        return memory


def search_shared_memory(
    user_id: str,
    query: str,
    memory_type: Optional[str] = None,
    source_module: Optional[str] = None
) -> List[SharedMemory]:
    """Search shared memories across all modules"""
    if MODE == "mock":
        results = [m for m in _mock_shared_memories if m.user_id == user_id]
        if memory_type:
            results = [m for m in results if m.memory_type == memory_type]
        if source_module:
            results = [m for m in results if m.source_module == source_module]
        return [m for m in results if query.lower() in m.content.lower()]
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        query_obj = select(SharedMemory).where(SharedMemory.user_id == user_id)
        if memory_type:
            query_obj = query_obj.where(SharedMemory.memory_type == memory_type)
        if source_module:
            query_obj = query_obj.where(SharedMemory.source_module == source_module)
        return session.exec(query_obj).all()


def get_memories_by_module(
    user_id: str,
    source_module: str
) -> List[SharedMemory]:
    """Get all memories from a specific module"""
    if MODE == "mock":
        return [m for m in _mock_shared_memories if m.user_id == user_id and m.source_module == source_module]
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        return session.exec(
            select(SharedMemory).where(
                SharedMemory.user_id == user_id,
                SharedMemory.source_module == source_module
            )
        ).all()


def sync_module_memory(
    user_id: str,
    source_module: str,
    contents: List[str]
) -> List[SharedMemory]:
    """Sync memories from a module to shared memory"""
    added = []
    for content in contents:
        memory = add_shared_memory(
            user_id=user_id,
            memory_type=source_module,
            content=content,
            source_module=source_module
        )
        added.append(memory)
    return added
