"""
Workflow validation endpoints.
POST /validate - Validate workflow structure and return errors/warnings
"""
from typing import Any, Dict, List, Optional, Set

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/validate", tags=["Workflow Validation"])

# Supported node types
SUPPORTED_NODE_TYPES = {
    "text_gen", "image_gen", "canvas", "output",
    "agent", "condition", "loop", "memory", "webhook",
}

# Node types that are valid as workflow entry points (no required inputs)
ENTRY_POINT_TYPES = {"webhook", "memory"}

# Node types that must be leaf nodes (no outputs)
LEAF_TYPES = {"output", "canvas"}


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ValidateNode(BaseModel):
    id: str
    type: str
    name: str = ""
    config: Dict[str, Any] = Field(default_factory=dict)


class ValidateConnection(BaseModel):
    source_node_id: str
    target_node_id: str
    source_output: str = "output"
    target_input: str = "input"


class ValidateRequest(BaseModel):
    nodes: List[ValidateNode] = Field(default_factory=list)
    connections: List[ValidateConnection] = Field(default_factory=list)


class ValidationError(BaseModel):
    code: str
    message: str
    node_id: Optional[str] = None
    severity: str = "error"  # error, warning


class ValidateResponse(BaseModel):
    valid: bool
    errors: List[ValidationError] = Field(default_factory=list)
    warnings: List[ValidationError] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Validation logic
# ---------------------------------------------------------------------------

def _validate_workflow(nodes: List[ValidateNode], connections: List[ValidateConnection]) -> ValidateResponse:
    errors: List[ValidationError] = []
    warnings: List[ValidationError] = []

    if not nodes:
        errors.append(ValidationError(
            code="EMPTY_WORKFLOW",
            message="Workflow must contain at least one node",
        ))
        return ValidateResponse(valid=False, errors=errors, warnings=warnings)

    node_ids: Set[str] = set()
    node_map: Dict[str, ValidateNode] = {}

    # Check for duplicate node IDs
    for node in nodes:
        if node.id in node_ids:
            errors.append(ValidationError(
                code="DUPLICATE_NODE_ID",
                message=f"Duplicate node ID: {node.id}",
                node_id=node.id,
            ))
        node_ids.add(node.id)
        node_map[node.id] = node

    # Validate each node
    has_entry_point = False
    for node in nodes:
        # Check node type is supported
        if node.type not in SUPPORTED_NODE_TYPES:
            errors.append(ValidationError(
                code="UNSUPPORTED_NODE_TYPE",
                message=f"Unsupported node type: '{node.type}'. Supported: {', '.join(sorted(SUPPORTED_NODE_TYPES))}",
                node_id=node.id,
            ))

        # Check for entry points
        if node.type in ENTRY_POINT_TYPES:
            has_entry_point = True

        # Check required config fields
        if node.type == "text_gen" and not node.config.get("prompt") and not node.config.get("model"):
            warnings.append(ValidationError(
                code="MISSING_TEXT_GEN_CONFIG",
                message="Text generation node should have 'prompt' or 'model' configured",
                node_id=node.id,
                severity="warning",
            ))

        if node.type == "webhook" and not node.config.get("url"):
            errors.append(ValidationError(
                code="MISSING_WEBHOOK_URL",
                message="Webhook node requires a 'url' in config",
                node_id=node.id,
            ))

        if node.type == "image_gen" and not node.config.get("prompt"):
            warnings.append(ValidationError(
                code="MISSING_IMAGE_GEN_PROMPT",
                message="Image generation node should have a 'prompt' configured",
                node_id=node.id,
                severity="warning",
            ))

    # Check that there is at least one entry point
    if not has_entry_point:
        warnings.append(ValidationError(
            code="NO_ENTRY_POINT",
            message="Workflow has no entry point node (webhook, memory). Execution may not be triggerable.",
            severity="warning",
        ))

    # Validate connections
    for conn in connections:
        if conn.source_node_id not in node_ids:
            errors.append(ValidationError(
                code="INVALID_CONNECTION_SOURCE",
                message=f"Connection references unknown source node: {conn.source_node_id}",
            ))
        if conn.target_node_id not in node_ids:
            errors.append(ValidationError(
                code="INVALID_CONNECTION_TARGET",
                message=f"Connection references unknown target node: {conn.target_node_id}",
            ))
        if conn.source_node_id == conn.target_node_id:
            errors.append(ValidationError(
                code="SELF_CONNECTION",
                message=f"Node {conn.source_node_id} cannot connect to itself",
                node_id=conn.source_node_id,
            ))

    # Check for cycles using DFS
    adjacency: Dict[str, List[str]] = {nid: [] for nid in node_ids}
    for conn in connections:
        if conn.source_node_id in node_ids and conn.target_node_id in node_ids:
            adjacency[conn.source_node_id].append(conn.target_node_id)

    visited: Set[str] = set()
    rec_stack: Set[str] = set()

    def _has_cycle(node_id: str) -> bool:
        visited.add(node_id)
        rec_stack.add(node_id)
        for neighbor in adjacency.get(node_id, []):
            if neighbor not in visited:
                if _has_cycle(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        rec_stack.discard(node_id)
        return False

    for nid in node_ids:
        if nid not in visited:
            if _has_cycle(nid):
                errors.append(ValidationError(
                    code="CIRCULAR_DEPENDENCY",
                    message="Workflow contains a circular dependency",
                ))
                break

    # Check for disconnected nodes
    connected_nodes: Set[str] = set()
    for conn in connections:
        connected_nodes.add(conn.source_node_id)
        connected_nodes.add(conn.target_node_id)

    disconnected = node_ids - connected_nodes
    if len(nodes) > 1 and disconnected:
        for nid in disconnected:
            warnings.append(ValidationError(
                code="DISCONNECTED_NODE",
                message=f"Node {nid} is not connected to any other node",
                node_id=nid,
                severity="warning",
            ))

    valid = len(errors) == 0
    return ValidateResponse(valid=valid, errors=errors, warnings=warnings)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=ValidateResponse)
async def validate_workflow(request: ValidateRequest):
    """Validate a workflow structure and return any errors or warnings."""
    return _validate_workflow(request.nodes, request.connections)
