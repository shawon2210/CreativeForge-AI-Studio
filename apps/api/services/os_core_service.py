import os
import sys
from pathlib import Path
from typing import Dict, Optional, List, Any
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")


class OSModule:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}


class SharedMemory:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}


class SharedProject:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
    def dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}


# Mock storage
_mock_modules: Dict[int, Any] = {}
_mock_memories: List[Any] = []
_mock_projects: Dict[int, Any] = {}
_mock_module_id = 1
_mock_memory_id = 1
_mock_project_id = 1

# Pre-populate some modules
for i, (name, mtype) in enumerate([
    ("Generations", "generation"), ("Style Genome", "style"), ("Render Preview", "render"),
    ("Asset Management", "asset"), ("Cinematic AI", "cinematic"), ("Knowledge Graph", "knowledge"),
    ("Marketplace", "marketplace"), ("Creative Twin", "twin"), ("World Engine", "world"),
], start=1):
    _mock_modules[i] = OSModule(
        id=i, name=name, module_type=mtype, user_id="system",
        is_enabled=True, config={}, created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
_mock_module_id = 10


def get_modules(user_id: str, module_type: Optional[str] = None) -> List[Any]:
    modules = list(_mock_modules.values())
    if module_type:
        modules = [m for m in modules if m.module_type == module_type]
    return [m for m in modules if m.user_id == user_id or m.user_id == "system"]


def toggle_module(module_id: int, user_id: str) -> Optional[Any]:
    module = _mock_modules.get(module_id)
    if not module or (module.user_id != user_id and module.user_id != "system"):
        return None
    module.is_enabled = not module.is_enabled
    module.updated_at = datetime.utcnow()
    return module


def add_shared_memory(
    user_id: str, memory_type: str, content: str,
    source_module: str, metadata: Dict = None
) -> Any:
    global _mock_memory_id
    memory = SharedMemory(
        id=_mock_memory_id, user_id=user_id, memory_type=memory_type,
        content=content, source_module=source_module, metadata=metadata or {},
        created_at=datetime.utcnow()
    )
    _mock_memories.append(memory)
    _mock_memory_id += 1
    return memory


def search_shared_memory(
    user_id: str, query: str, memory_type: Optional[str] = None
) -> List[Any]:
    results = [m for m in _mock_memories if m.user_id == user_id]
    if memory_type:
        results = [m for m in results if m.memory_type == memory_type]
    return [m for m in results if query.lower() in m.content.lower()]


def create_shared_project(
    user_id: str, name: str, description: str = "",
    modules_used: List[str] = None, project_data: Dict = None
) -> Any:
    global _mock_project_id
    project = SharedProject(
        id=_mock_project_id, name=name, description=description,
        project_data=project_data or {}, modules_used=modules_used or [],
        user_id=user_id, created_at=datetime.utcnow(), updated_at=datetime.utcnow()
    )
    _mock_projects[_mock_project_id] = project
    _mock_project_id += 1
    return project


def get_shared_projects(user_id: str) -> List[Any]:
    return [p for p in _mock_projects.values() if p.user_id == user_id]
