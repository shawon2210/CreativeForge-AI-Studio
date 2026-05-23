"""
Workflow execution engine.
Provides WorkflowExecutor for running workflows with topological ordering,
async execution, error handling, retries, WebSocket streaming, and cancellation.
Also provides execute_node() dispatch and individual node-type handlers.
"""
import asyncio
import logging
import time
from collections import deque
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine, Dict, List, Optional, Set

from fastapi import WebSocket

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Node handler type
# ---------------------------------------------------------------------------

NodeHandler = Callable[..., Coroutine[Any, Any, Dict[str, Any]]]


# ---------------------------------------------------------------------------
# Node handlers
# ---------------------------------------------------------------------------

async def handle_text_gen(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle text generation nodes."""
    config = node.config if hasattr(node, "config") else {}
    prompt = config.get("prompt", "")
    model = config.get("model", "gpt-4o")
    temperature = config.get("temperature", 0.7)
    max_tokens = config.get("max_tokens", 2048)
    system_prompt = config.get("system_prompt", "")

    # Resolve variables from context
    for key, value in context.get("variables", {}).items():
        prompt = prompt.replace(f"{{{key}}}", str(value))

    # In production: call actual LLM API
    text = f"[text_gen:{model}] Generated text for: {prompt[:80]}..."
    return {"output": text, "model": model, "tokens_used": len(prompt.split()) * 2}


async def handle_image_gen(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle image generation nodes."""
    config = node.config if hasattr(node, "config") else {}
    prompt = config.get("prompt", "")
    model = config.get("model", "dall-e-3")
    size = config.get("size", "1024x1024")

    for key, value in context.get("variables", {}).items():
        prompt = prompt.replace(f"{{{key}}}", str(value))

    image_url = f"https://mock-images.creativeforge.ai/{size}/{hash(prompt) % 10000:04d}.png"
    return {"output": image_url, "model": model, "size": size}


async def handle_canvas(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle canvas rendering nodes."""
    config = node.config if hasattr(node, "config") else {}
    width = config.get("width", 1024)
    height = config.get("height", 1024)
    background = config.get("background", "#ffffff")

    data_url = f"data:image/png;base64,mock_canvas_{width}x{height}_{background}"
    return {"output": data_url, "width": width, "height": height}


async def handle_output(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle output nodes - collect and format final results."""
    config = node.config if hasattr(node, "config") else {}
    fmt = config.get("format", "json")
    destination = config.get("destination", "response")

    # Gather all outputs from context
    outputs = context.get("node_outputs", {})
    return {"output": outputs, "format": fmt, "destination": destination}


async def handle_agent(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle agent nodes - autonomous task execution."""
    config = node.config if hasattr(node, "config") else {}
    task = config.get("task", "")
    agent_type = config.get("agent_type", "general")
    max_steps = config.get("max_steps", 10)

    for key, value in context.get("variables", {}).items():
        task = task.replace(f"{{{key}}}", str(value))

    result = f"[agent:{agent_type}] Completed: {task[:80]}..."
    return {"output": result, "steps_taken": 3, "agent_type": agent_type}


async def handle_condition(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle condition nodes - branch based on expression evaluation."""
    config = node.config if hasattr(node, "config") else {}
    expression = config.get("expression", "True")

    # Simple expression evaluation (in production, use a safe evaluator)
    try:
        # Build evaluation scope from context
        scope = dict(context.get("variables", {}))
        scope["input"] = context.get("input_data", {})
        result = bool(eval(expression, {"__builtins__": {}}, scope))
    except Exception:
        result = False

    return {
        "true" if result else "false": context.get("input_data"),
        "condition_result": result,
    }


async def handle_loop(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle loop nodes - iterate over collections."""
    config = node.config if hasattr(node, "config") else {}
    iterations = config.get("iterations", 1)
    item_key = config.get("item_key", "item")

    input_data = context.get("input_data", [])
    if not isinstance(input_data, list):
        input_data = list(range(iterations))

    results = []
    for i, item in enumerate(input_data):
        if i >= 1000:  # Safety limit
            break
        loop_context = dict(context)
        loop_context["variables"] = dict(context.get("variables", {}))
        loop_context["variables"][item_key] = item
        loop_context["variables"]["index"] = i
        results.append(item)

    return {"output": results, "iterations": len(results)}


async def handle_memory(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle memory nodes - store/retrieve workflow data."""
    config = node.config if hasattr(node, "config") else {}
    operation = config.get("operation", "get")
    key = config.get("key", "default")
    default = config.get("default")

    memory_store = context.get("_memory_store", {})

    if operation == "set":
        memory_store[key] = context.get("input_data")
        return {"output": True, "key": key, "operation": "set"}
    elif operation == "delete":
        memory_store.pop(key, None)
        return {"output": True, "key": key, "operation": "delete"}
    else:  # get
        return {"output": memory_store.get(key, default), "key": key, "operation": "get"}


async def handle_webhook(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Handle webhook nodes - send/receive HTTP requests."""
    config = node.config if hasattr(node, "config") else {}
    url = config.get("url", "")
    method = config.get("method", "POST")
    headers = config.get("headers", {})

    # In production: make actual HTTP request
    return {
        "output": {"status": 200, "body": f"Mock webhook response from {url}"},
        "method": method,
        "url": url,
    }


# ---------------------------------------------------------------------------
# Handler registry
# ---------------------------------------------------------------------------

NODE_HANDLERS: Dict[str, NodeHandler] = {
    "text_gen": handle_text_gen,
    "image_gen": handle_image_gen,
    "canvas": handle_canvas,
    "output": handle_output,
    "agent": handle_agent,
    "condition": handle_condition,
    "loop": handle_loop,
    "memory": handle_memory,
    "webhook": handle_webhook,
}


# ---------------------------------------------------------------------------
# execute_node dispatch
# ---------------------------------------------------------------------------

async def execute_node(node: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatch a node to its appropriate handler."""
    node_type = node.type if hasattr(node, "type") else node.get("type", "")
    handler = NODE_HANDLERS.get(node_type)

    if not handler:
        raise ValueError(f"Unknown node type: {node_type}")

    return await handler(node, context)


# ---------------------------------------------------------------------------
# WorkflowExecutor
# ---------------------------------------------------------------------------

class WorkflowExecutor:
    """Executes a workflow definition with topological ordering, async processing,
    error handling, retries, WebSocket streaming, and cancellation support.
    """

    def __init__(self, workflow: Any):
        """
        Args:
            workflow: WorkflowDefinition or dict with nodes/connections/variables.
        """
        if hasattr(workflow, "nodes"):
            self.nodes = {n.id: n for n in workflow.nodes}
            self.connections = workflow.connections
            self.variables = dict(workflow.variables) if workflow.variables else {}
            self.name = workflow.name
        else:
            # Dict-based workflow
            nodes_list = workflow.get("nodes", [])
            self.nodes = {n.get("id", f"node_{i}"): n for i, n in enumerate(nodes_list)}
            self.connections = [type("Conn", (), c) if isinstance(c, dict) else c for c in workflow.get("connections", [])]
            self.variables = dict(workflow.get("variables", {}))
            self.name = workflow.get("name", "Workflow")

        self.status: str = "pending"
        self.started_at: Optional[str] = None
        self.finished_at: Optional[str] = None
        self.current_node: Optional[str] = None
        self.completed_nodes: List[str] = []
        self.failed_nodes: List[str] = []
        self.logs: List[Dict[str, Any]] = []
        self.error: Optional[str] = None

        self._cancelled: bool = False
        self._ws_listeners: List[WebSocket] = []
        self._max_retries: int = 3
        self._retry_delay: float = 1.0

    # ---- WebSocket management ----

    def add_ws_listener(self, websocket: WebSocket):
        if websocket not in self._ws_listeners:
            self._ws_listeners.append(websocket)

    def remove_ws_listener(self, websocket: WebSocket):
        if websocket in self._ws_listeners:
            self._ws_listeners.remove(websocket)

    async def _broadcast(self, message: Dict[str, Any]):
        """Send a message to all connected WebSocket listeners."""
        disconnected = []
        for ws in self._ws_listeners:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self._ws_listeners.remove(ws)

    # ---- Logging ----

    def _log(self, level: str, message: str, node_id: Optional[str] = None):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "message": message,
            "node_id": node_id,
        }
        self.logs.append(entry)
        level_map = {"info": logging.INFO, "warning": logging.WARNING, "error": logging.ERROR}
        logger.log(level_map.get(level, logging.INFO), f"[Workflow:{self.name}] {message}")

    # ---- Topological sort ----

    def _topological_sort(self) -> List[str]:
        """Return node IDs in topological execution order using Kahn's algorithm."""
        node_ids = set(self.nodes.keys())
        adjacency: Dict[str, List[str]] = {nid: [] for nid in node_ids}
        in_degree: Dict[str, int] = {nid: 0 for nid in node_ids}

        for conn in self.connections:
            src = conn.source_node_id if hasattr(conn, "source_node_id") else conn.get("source_node_id")
            tgt = conn.target_node_id if hasattr(conn, "target_node_id") else conn.get("target_node_id")
            if src in node_ids and tgt in node_ids:
                adjacency[src].append(tgt)
                in_degree[tgt] += 1

        queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
        order: List[str] = []

        while queue:
            nid = queue.popleft()
            order.append(nid)
            for neighbor in adjacency[nid]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(order) != len(node_ids):
            raise ValueError("Workflow contains circular dependencies")

        return order

    # ---- Execution ----

    async def run(self, execution_id: Optional[str] = None):
        """Execute the workflow asynchronously."""
        self.status = "running"
        self.started_at = datetime.now(timezone.utc).isoformat()
        self._cancelled = False
        self._log("info", f"Workflow '{self.name}' execution started")

        await self._broadcast({
            "type": "execution_started",
            "execution_id": execution_id,
            "workflow_name": self.name,
        })

        try:
            execution_order = self._topological_sort()
        except ValueError as e:
            self.status = "failed"
            self.error = str(e)
            self.finished_at = datetime.now(timezone.utc).isoformat()
            self._log("error", f"Topological sort failed: {e}")
            await self._broadcast({"type": "error", "message": str(e)})
            return

        # Build connection map for gathering inputs
        incoming: Dict[str, List[Any]] = {nid: [] for nid in self.nodes}
        for conn in self.connections:
            src = conn.source_node_id if hasattr(conn, "source_node_id") else conn.get("source_node_id")
            tgt = conn.target_node_id if hasattr(conn, "target_node_id") else conn.get("target_node_id")
            if tgt in incoming:
                incoming[tgt].append(conn)

        # Node outputs storage
        node_outputs: Dict[str, Dict[str, Any]] = {}
        memory_store: Dict[str, Any] = {}

        for node_id in execution_order:
            if self._cancelled:
                self.status = "stopped"
                self._log("warning", "Execution cancelled")
                await self._broadcast({"type": "execution_stopped", "execution_id": execution_id})
                break

            node = self.nodes[node_id]
            self.current_node = node_id
            node_name = node.name if hasattr(node, "name") else node.get("name", node_id)
            self._log("info", f"Executing node: {node_name}", node_id=node_id)

            await self._broadcast({
                "type": "node_started",
                "execution_id": execution_id,
                "node_id": node_id,
                "node_name": node_name,
            })

            # Gather inputs from upstream nodes
            input_data: Dict[str, Any] = {}
            for conn in incoming.get(node_id, []):
                src = conn.source_node_id if hasattr(conn, "source_node_id") else conn.get("source_node_id")
                src_output_key = conn.source_output if hasattr(conn, "source_output") else conn.get("source_output", "output")
                tgt_input_key = conn.target_input if hasattr(conn, "target_input") else conn.get("target_input", "input")

                if src in node_outputs:
                    output = node_outputs[src]
                    if isinstance(output, dict):
                        input_data[tgt_input_key] = output.get(src_output_key, output.get("output"))
                    else:
                        input_data[tgt_input_key] = output

            # Build context
            context: Dict[str, Any] = {
                "variables": dict(self.variables),
                "input_data": input_data.get("input", input_data),
                "node_outputs": node_outputs,
                "_memory_store": memory_store,
            }

            # Execute with retries
            success = False
            last_error: Optional[str] = None
            result: Dict[str, Any] = {}

            for attempt in range(1, self._max_retries + 1):
                if self._cancelled:
                    break
                try:
                    start_time = time.monotonic()
                    result = await execute_node(node, context)
                    duration_ms = (time.monotonic() - start_time) * 1000

                    success = True
                    self._log(
                        "info",
                        f"Node {node_name} completed in {duration_ms:.1f}ms",
                        node_id=node_id,
                    )
                    break
                except Exception as e:
                    last_error = str(e)
                    self._log(
                        "warning",
                        f"Node {node_name} attempt {attempt}/{self._max_retries} failed: {e}",
                        node_id=node_id,
                    )
                    if attempt < self._max_retries:
                        await asyncio.sleep(self._retry_delay * attempt)

            if success:
                node_outputs[node_id] = result
                self.completed_nodes.append(node_id)
                await self._broadcast({
                    "type": "node_completed",
                    "execution_id": execution_id,
                    "node_id": node_id,
                    "node_name": node_name,
                    "output": result,
                })
            else:
                self.failed_nodes.append(node_id)
                self._log(
                    "error",
                    f"Node {node_name} failed after {self._max_retries} attempts: {last_error}",
                    node_id=node_id,
                )
                await self._broadcast({
                    "type": "node_failed",
                    "execution_id": execution_id,
                    "node_id": node_id,
                    "node_name": node_name,
                    "error": last_error,
                })

                # Check if node is critical (not a leaf)
                is_leaf = node.type if hasattr(node, "type") else node.get("type", "") in {"output", "canvas"}
                if not is_leaf:
                    self.status = "failed"
                    self.error = f"Node {node_name} failed: {last_error}"
                    break

            self.current_node = None

        # Finalize
        if self.status == "running":
            if self.failed_nodes:
                self.status = "completed_with_errors"
            else:
                self.status = "completed"

        self.finished_at = datetime.now(timezone.utc).isoformat()
        self._log("info", f"Workflow '{self.name}' finished with status: {self.status}")

        await self._broadcast({
            "type": "execution_finished",
            "execution_id": execution_id,
            "status": self.status,
            "completed_nodes": self.completed_nodes,
            "failed_nodes": self.failed_nodes,
            "outputs": node_outputs,
        })

    async def cancel(self):
        """Cancel the running workflow."""
        self._cancelled = True
        self._log("warning", "Cancellation requested")
