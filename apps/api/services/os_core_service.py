import os
from typing import Dict, Optional, List, Any
from datetime import datetime
from sqlmodel import Session, select

from ..models.os_core import OSModule, SharedMemory, SharedEmbedding, SharedProject

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_modules: Dict[int, OSModule] = {}
_mock_memories: List[SharedMemory] = []
_mock_embeddings: List[SharedEmbedding] = []
_mock_projects: Dict[int, SharedProject] = {}
_mock_module_id = 1
_mock_memory_id = 1
_mock_embedding_id = 1
_mock_project_id = 1


# ---------- Module Management ----------
def get_modules(user_id: str, module_type: Optional[str] = None) -> List[OSModule]:
    if MODE == "mock":
        modules = list(_mock_modules.values())
        if module_type:
            modules = [m for m in modules if m.module_type == module_type]
        return [m for m in modules if m.user_id == user_id or m.user_id == "system"]
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        query = select(OSModule)
        if module_type:
            query = query.where(OSModule.module_type == module_type)
        return session.exec(query).all()


def toggle_module(module_id: int, user_id: str) -> Optional[OSModule]:
    """Enable/disable a module"""
    if MODE == "mock":
        module = _mock_modules.get(module_id)
        if not module or (module.user_id != user_id and module.user_id != "system"):
            return None
        module.is_enabled = not module.is_enabled
        module.updated_at = datetime.utcnow()
        return module
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        module = session.exec(select(OSModule).where(OSModule.id == module_id)).first()
        if module and (module.user_id == user_id or module.user_id == "system"):
            module.is_enabled = not module.is_enabled
            module.updated_at = datetime.utcnow()
            session.add(module)
            session.commit()
            session.refresh(module)
            return module
        return None


# ---------- Shared Memory ----------
def add_shared_memory(
    user_id: str, memory_type: str, content: str,
    source_module: str, metadata: Dict = None
) -> SharedMemory:
    if MODE == "mock":
        global _mock_memory_id
        memory = SharedMemory(
            id=_mock_memory_id,
            user_id=user_id,
            memory_type=memory_type,
            content=content,
            source_module=source_module,
            metadata=metadata or {}
        )
        _mock_memories.append(memory)
        _mock_memory_id += 1
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
    user_id: str, query: str, memory_type: Optional[str] = None
) -> List[SharedMemory]:
    """Search across all shared memories (mock: simple substring match)"""
    if MODE == "mock":
        results = [m for m in _mock_memories if m.user_id == user_id]
        if memory_type:
            results = [m for m in results if m.memory_type == memory_type]
        return [m for m in results if query.lower() in m.content.lower()]
    return []


# ---------- Shared Projects ----------
def create_shared_project(
    user_id: str, name: str, description: str = "",
    modules_used: List[str] = None, project_data: Dict = None
) -> SharedProject:
    if MODE == "mock":
        global _mock_project_id
        project = SharedProject(
            id=_mock_project_id,
            name=name,
            description=description,
            project_data=project_data or {},
            modules_used=modules_used or [],
            user_id=user_id
        )
        _mock_projects[_mock_project_id] = project
        _mock_project_id += 1
        return project
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        project = SharedProject(
            name=name,
            description=description,
            project_data=project_data or {},
            modules_used=modules_used or [],
            user_id=user_id
        )
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


def get_shared_projects(user_id: str) -> List[SharedProject]:
    if MODE == "mock":
        return [p for p in _mock_projects.values() if p.user_id == user_id]
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        return session.exec(select(SharedProject).where(SharedProject.user_id == user_id)).all()
