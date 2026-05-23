import sys
from pathlib import Path
from fastapi import APIRouter, Body, Query
from typing import Dict, List, Optional, Any

sys.path.append(str(Path(__file__).parent.parent))
from services.os_core_service import (
    get_modules, toggle_module,
    add_shared_memory, search_shared_memory,
    create_shared_project, get_shared_projects,
)

router = APIRouter(prefix="/os-core", tags=["AI Creative OS"])

@router.post("/modules/")
async def get_modules_endpoint(
    user_id: str = Body(...),
    module_type: Optional[str] = Body(default=None)
):
    return [m.dict() for m in get_modules(user_id=user_id, module_type=module_type)]

@router.post("/module/toggle/")
async def toggle_module_endpoint(
    module_id: int = Body(...),
    user_id: str = Body(...)
):
    result = toggle_module(module_id=module_id, user_id=user_id)
    return result.dict() if result else None

@router.post("/memory/add/")
async def add_memory_endpoint(
    user_id: str = Body(...),
    memory_type: str = Body(...),
    content: str = Body(...),
    source_module: str = Body(...),
    metadata: Dict = Body(default={})
):
    return add_shared_memory(
        user_id=user_id, memory_type=memory_type,
        content=content, source_module=source_module,
        metadata=metadata
    ).dict()

@router.post("/memory/search/")
async def search_memory_endpoint(
    user_id: str = Body(...),
    query: str = Body(...),
    memory_type: Optional[str] = Body(default=None)
):
    return [m.dict() for m in search_shared_memory(user_id=user_id, query=query, memory_type=memory_type)]

@router.post("/project/create/")
async def create_project_endpoint(
    user_id: str = Body(...),
    name: str = Body(...),
    description: str = Body(default=""),
    modules_used: List[str] = Body(default=[]),
    project_data: Dict = Body(default={})
):
    return create_shared_project(
        user_id=user_id, name=name,
        description=description, modules_used=modules_used,
        project_data=project_data
    ).dict()

@router.get("/projects/")
async def get_projects_endpoint(user_id: str = Query(...)):
    return [p.dict() for p in get_shared_projects(user_id=user_id)]
