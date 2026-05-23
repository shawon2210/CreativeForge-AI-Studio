"""
Workflow persistence endpoints.
POST /save - Save a workflow
GET /list - List all workflows
GET /{workflow_id} - Get a specific workflow
DELETE /{workflow_id} - Delete a workflow
GET /{workflow_id}/export - Export workflow as JSON
POST /import - Import workflow from JSON
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/save", tags=["Workflow Save"])

# In-memory workflow store (replace with DB in production)
_workflow_store: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class SaveWorkflowRequest(BaseModel):
    name: str = "Untitled Workflow"
    description: str = ""
    definition: Dict[str, Any] = Field(default_factory=dict)
    workflow_id: Optional[str] = None  # If provided, update existing


class SaveWorkflowResponse(BaseModel):
    workflow_id: str
    name: str
    created_at: str
    updated_at: str
    message: str


class WorkflowSummary(BaseModel):
    workflow_id: str
    name: str
    description: str
    node_count: int = 0
    created_at: str
    updated_at: str


class WorkflowListResponse(BaseModel):
    workflows: List[WorkflowSummary]
    total: int


class WorkflowDetailResponse(BaseModel):
    workflow_id: str
    name: str
    description: str
    definition: Dict[str, Any]
    created_at: str
    updated_at: str


class DeleteResponse(BaseModel):
    workflow_id: str
    message: str


class ExportResponse(BaseModel):
    workflow_id: str
    name: str
    version: str = "1.0"
    exported_at: str
    definition: Dict[str, Any]


class ImportRequest(BaseModel):
    name: Optional[str] = None
    definition: Dict[str, Any]


class ImportResponse(BaseModel):
    workflow_id: str
    name: str
    message: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=SaveWorkflowResponse)
async def save_workflow(request: SaveWorkflowRequest):
    """Save a workflow. Creates new or updates existing if workflow_id is provided."""
    now = datetime.now(timezone.utc).isoformat()

    if request.workflow_id and request.workflow_id in _workflow_store:
        # Update existing
        wf_id = request.workflow_id
        existing = _workflow_store[wf_id]
        existing["name"] = request.name
        existing["description"] = request.description
        existing["definition"] = request.definition
        existing["updated_at"] = now
        message = "Workflow updated"
    else:
        # Create new
        wf_id = str(uuid.uuid4())
        _workflow_store[wf_id] = {
            "workflow_id": wf_id,
            "name": request.name,
            "description": request.description,
            "definition": request.definition,
            "created_at": now,
            "updated_at": now,
        }
        message = "Workflow created"

    return SaveWorkflowResponse(
        workflow_id=wf_id,
        name=_workflow_store[wf_id]["name"],
        created_at=_workflow_store[wf_id]["created_at"],
        updated_at=_workflow_store[wf_id]["updated_at"],
        message=message,
    )


@router.get("/list", response_model=WorkflowListResponse)
async def list_workflows(
    search: Optional[str] = Query(None, description="Search by name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List all saved workflows with optional search and pagination."""
    workflows = list(_workflow_store.values())

    if search:
        workflows = [w for w in workflows if search.lower() in w["name"].lower()]

    total = len(workflows)
    workflows = workflows[offset : offset + limit]

    summaries = []
    for w in workflows:
        definition = w.get("definition", {})
        node_count = len(definition.get("nodes", []))
        summaries.append(WorkflowSummary(
            workflow_id=w["workflow_id"],
            name=w["name"],
            description=w.get("description", ""),
            node_count=node_count,
            created_at=w["created_at"],
            updated_at=w["updated_at"],
        ))

    return WorkflowListResponse(workflows=summaries, total=total)


@router.get("/{workflow_id}", response_model=WorkflowDetailResponse)
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID."""
    wf = _workflow_store.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

    return WorkflowDetailResponse(
        workflow_id=wf["workflow_id"],
        name=wf["name"],
        description=wf.get("description", ""),
        definition=wf["definition"],
        created_at=wf["created_at"],
        updated_at=wf["updated_at"],
    )


@router.delete("/{workflow_id}", response_model=DeleteResponse)
async def delete_workflow(workflow_id: str):
    """Delete a workflow by ID."""
    if workflow_id not in _workflow_store:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

    del _workflow_store[workflow_id]
    return DeleteResponse(workflow_id=workflow_id, message="Workflow deleted")


@router.get("/{workflow_id}/export", response_model=ExportResponse)
async def export_workflow(workflow_id: str):
    """Export a workflow as a portable JSON definition."""
    wf = _workflow_store.get(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")

    return ExportResponse(
        workflow_id=wf["workflow_id"],
        name=wf["name"],
        version="1.0",
        exported_at=datetime.now(timezone.utc).isoformat(),
        definition=wf["definition"],
    )


@router.post("/import", response_model=ImportResponse)
async def import_workflow(request: ImportRequest):
    """Import a workflow from a JSON definition."""
    now = datetime.now(timezone.utc).isoformat()
    wf_id = str(uuid.uuid4())

    name = request.name or request.definition.get("name", "Imported Workflow")

    _workflow_store[wf_id] = {
        "workflow_id": wf_id,
        "name": name,
        "description": request.definition.get("description", ""),
        "definition": request.definition,
        "created_at": now,
        "updated_at": now,
    }

    return ImportResponse(
        workflow_id=wf_id,
        name=name,
        message="Workflow imported successfully",
    )
