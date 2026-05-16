from fastapi import APIRouter, Body
from typing import Dict, List, Optional

from ..services.visual_node_service import (
    get_node_templates, create_node_template,
    generate_nodes_from_text, create_workflow_from_text,
    NodeTemplate, Workflow
)

router = APIRouter(prefix="/visual-node", tags=["Visual Node AI Programming"])

@router.get("/templates/", response_model=List[NodeTemplate])
async def get_templates_endpoint(
    category: Optional[str] = None,
    user_id: Optional[str] = None
):
    return get_node_templates(category=category, user_id=user_id)

@router.post("/template/create/", response_model=NodeTemplate)
async def create_template_endpoint(
    name: str = Body(...),
    node_type: str = Body(...),
    category: str = Body(default="general"),
    default_config: Dict = Body(default={}),
    input_types: List[str] = Body(default=[]),
    output_types: List[str] = Body(default=[]),
    user_id: str = Body(...)
):
    return create_node_template(
        name=name, node_type=node_type, category=category,
        default_config=default_config, input_types=input_types,
        output_types=output_types, user_id=user_id
    )

@router.post("/generate-nodes/", response_model=Dict)
async def generate_nodes_endpoint(
    description: str = Body(...),
    user_id: str = Body(...)
):
    return generate_nodes_from_text(description=description, user_id=user_id)

@router.post("/workflow/create/", response_model=Workflow)
async def create_workflow_endpoint(
    name: str = Body(...),
    description: str = Body(...),
    user_id: str = Body(...)
):
    return create_workflow_from_text(name=name, description=description, user_id=user_id)

@router.get("/workflow/{workflow_id}/", response_model=Optional[Workflow])
async def get_workflow_endpoint(workflow_id: int, user_id: str = Body(...)):
    # Mock: return workflow from mock storage
    from ..services.visual_node_service import _mock_workflows
    wf = _mock_workflows.get(workflow_id)
    if wf and (wf.user_id == user_id or wf.user_id == "system"):
        return wf
    return None
