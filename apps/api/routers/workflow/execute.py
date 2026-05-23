"""
Workflow execution endpoints.
POST /execute - Start a workflow execution
POST /stop/{execution_id} - Stop a running execution
GET /status/{execution_id} - Get execution status
POST /node/test - Test a single node
GET /stream/{execution_id} - WebSocket for real-time updates
"""
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from services.workflow.engine import WorkflowExecutor

router = APIRouter(prefix="/execute", tags=["Workflow Execution"])

# In-memory store for active executions
_active_executions: Dict[str, WorkflowExecutor] = {}


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class NodeConnection(BaseModel):
    source_node_id: str
    target_node_id: str
    source_output: str = "output"
    target_input: str = "input"


class WorkflowNode(BaseModel):
    id: str
    type: str  # text_gen, image_gen, canvas, output, agent, condition, loop, memory, webhook
    name: str = ""
    config: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})


class WorkflowDefinition(BaseModel):
    name: str = "Untitled Workflow"
    description: str = ""
    nodes: list[WorkflowNode] = Field(default_factory=list)
    connections: list[NodeConnection] = Field(default_factory=list)
    variables: Dict[str, Any] = Field(default_factory=dict)


class ExecuteResponse(BaseModel):
    execution_id: str
    status: str = "started"
    message: str = "Workflow execution started"


class ExecutionStatusResponse(BaseModel):
    execution_id: str
    status: str  # pending, running, completed, failed, stopped
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    current_node: Optional[str] = None
    completed_nodes: list[str] = Field(default_factory=list)
    failed_nodes: list[str] = Field(default_factory=list)
    logs: list[Dict[str, Any]] = Field(default_factory=list)
    error: Optional[str] = None


class StopResponse(BaseModel):
    execution_id: str
    status: str
    message: str


class NodeTestRequest(BaseModel):
    node: WorkflowNode
    input_data: Dict[str, Any] = Field(default_factory=dict)


class NodeTestResponse(BaseModel):
    node_id: str
    node_type: str
    success: bool
    output: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    duration_ms: float = 0.0


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/", response_model=ExecuteResponse)
async def execute_workflow(workflow: WorkflowDefinition):
    """Start executing a workflow. Returns an execution ID immediately."""
    execution_id = str(uuid.uuid4())

    executor = WorkflowExecutor(workflow)
    _active_executions[execution_id] = executor

    # Launch async execution in the background
    asyncio.create_task(executor.run(execution_id))

    return ExecuteResponse(
        execution_id=execution_id,
        status="started",
        message=f"Workflow '{workflow.name}' execution started",
    )


@router.post("/stop/{execution_id}", response_model=StopResponse)
async def stop_execution(execution_id: str):
    """Stop a running workflow execution."""
    executor = _active_executions.get(execution_id)
    if not executor:
        raise HTTPException(status_code=404, detail=f"Execution {execution_id} not found")

    await executor.cancel()
    return StopResponse(
        execution_id=execution_id,
        status="stopped",
        message="Execution stopped",
    )


@router.get("/status/{execution_id}", response_model=ExecutionStatusResponse)
async def get_execution_status(execution_id: str):
    """Get the current status of a workflow execution."""
    executor = _active_executions.get(execution_id)
    if not executor:
        raise HTTPException(status_code=404, detail=f"Execution {execution_id} not found")

    return ExecutionStatusResponse(
        execution_id=execution_id,
        status=executor.status,
        started_at=executor.started_at,
        finished_at=executor.finished_at,
        current_node=executor.current_node,
        completed_nodes=executor.completed_nodes,
        failed_nodes=executor.failed_nodes,
        logs=executor.logs,
        error=executor.error,
    )


@router.post("/node/test", response_model=NodeTestResponse)
async def test_node(request: NodeTestRequest):
    """Test a single node with the given configuration and input data."""
    import time

    start = time.monotonic()
    try:
        from services.workflow.engine import execute_node

        output = await execute_node(request.node, request.input_data)
        duration_ms = (time.monotonic() - start) * 1000
        return NodeTestResponse(
            node_id=request.node.id,
            node_type=request.node.type,
            success=True,
            output=output,
            duration_ms=round(duration_ms, 2),
        )
    except Exception as e:
        duration_ms = (time.monotonic() - start) * 1000
        return NodeTestResponse(
            node_id=request.node.id,
            node_type=request.node.type,
            success=False,
            error=str(e),
            duration_ms=round(duration_ms, 2),
        )


@router.websocket("/stream/{execution_id}")
async def stream_execution(websocket: WebSocket, execution_id: str):
    """WebSocket endpoint that streams real-time execution logs and node status."""
    await websocket.accept()

    executor = _active_executions.get(execution_id)
    if not executor:
        await websocket.send_json({"type": "error", "message": f"Execution {execution_id} not found"})
        await websocket.close()
        return

    # Register the websocket as a listener
    executor.add_ws_listener(websocket)

    try:
        # Send current state immediately
        await websocket.send_json({
            "type": "status",
            "execution_id": execution_id,
            "status": executor.status,
            "completed_nodes": executor.completed_nodes,
            "failed_nodes": executor.failed_nodes,
        })

        # Keep the connection alive and handle client messages
        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                if msg == "ping":
                    await websocket.send_json({"type": "pong"})
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        pass
    finally:
        executor.remove_ws_listener(websocket)
