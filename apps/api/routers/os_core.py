from fastapi import APIRouter, Body
from typing import Dict, List, Optional

from ..services.os_core_service import (
    get_modules, toggle_module,
    add_shared_memory, search_shared_memory,
    create_shared_project, get_shared_projects,
    OSModule, SharedMemory, SharedProject
)

router = APIRouter(prefix="/os-core", tags=["AI Creative OS"])

@router.get("/modules/", response_model=List[OSModule])
async def get_modules_endpoint(
    user_id: str = Body(...),
    module_type: Optional[str] = Body(default=None)
):
    return get_modules(user_id=user_id, module_type=module_type)

@router.post("/module/toggle/", response_model=Optional[OSModule])
async def toggle_module_endpoint(
    module_id: int = Body(...),
    user_id: str = Body(...)
):
    return toggle_module(module_id=module_id, user_id=user_id)

@router.post("/memory/add/", response_model=SharedMemory)
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
    )

@router.post("/memory/search/", response_model=List[SharedMemory])
async def search_memory_endpoint(
    user_id: str = Body(...),
    query: str = Body(...),
    memory_type: Optional[str] = Body(default=None)
):
    return search_shared_memory(user_id=user_id, query=query, memory_type=memory_type)

@router.post("/project/create/", response_model=SharedProject)
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
    )

@router.get("/projects/", response_model=List[SharedProject])
async def get_projects_endpoint(user_id: str = Body(...)):
    return get_shared_projects(user_id=user_id)
