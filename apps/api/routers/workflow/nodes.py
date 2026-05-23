"""
Workflow node template and execution endpoints.
GET /templates - Get all node templates
POST /execute/text - Execute a text generation node
POST /execute/image - Execute an image generation node
POST /execute/agent - Execute an agent node
"""
import time
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/nodes", tags=["Workflow Nodes"])


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class NodeTemplate(BaseModel):
    type: str
    name: str
    description: str
    category: str
    inputs: List[Dict[str, str]] = Field(default_factory=list)
    outputs: List[Dict[str, str]] = Field(default_factory=list)
    config_schema: Dict[str, Any] = Field(default_factory=dict)


class TextGenRequest(BaseModel):
    prompt: str = ""
    model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 2048
    system_prompt: str = ""
    input_data: Dict[str, Any] = Field(default_factory=dict)


class TextGenResponse(BaseModel):
    text: str
    model: str
    tokens_used: int = 0
    duration_ms: float = 0.0


class ImageGenRequest(BaseModel):
    prompt: str = ""
    model: str = "dall-e-3"
    size: str = "1024x1024"
    quality: str = "standard"
    style: str = "vivid"
    input_data: Dict[str, Any] = Field(default_factory=list)


class ImageGenResponse(BaseModel):
    image_url: str
    model: str
    size: str
    duration_ms: float = 0.0


class AgentRequest(BaseModel):
    task: str = ""
    agent_type: str = "general"
    tools: List[str] = Field(default_factory=list)
    max_steps: int = 10
    input_data: Dict[str, Any] = Field(default_factory=dict)


class AgentResponse(BaseModel):
    result: str
    steps_taken: int = 0
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    duration_ms: float = 0.0


# ---------------------------------------------------------------------------
# Node templates
# ---------------------------------------------------------------------------

NODE_TEMPLATES: List[Dict[str, Any]] = [
    {
        "type": "text_gen",
        "name": "Text Generation",
        "description": "Generate text using a language model",
        "category": "AI",
        "inputs": [
            {"name": "input", "type": "string", "description": "Input text or prompt template"},
        ],
        "outputs": [
            {"name": "output", "type": "string", "description": "Generated text"},
        ],
        "config_schema": {
            "prompt": {"type": "string", "description": "The prompt template"},
            "model": {"type": "string", "description": "Model to use", "default": "gpt-4o"},
            "temperature": {"type": "number", "description": "Sampling temperature", "default": 0.7},
            "max_tokens": {"type": "integer", "description": "Max tokens to generate", "default": 2048},
            "system_prompt": {"type": "string", "description": "System prompt", "default": ""},
        },
    },
    {
        "type": "image_gen",
        "name": "Image Generation",
        "description": "Generate images from text prompts",
        "category": "AI",
        "inputs": [
            {"name": "input", "type": "string", "description": "Prompt template or context"},
        ],
        "outputs": [
            {"name": "output", "type": "string", "description": "Generated image URL"},
        ],
        "config_schema": {
            "prompt": {"type": "string", "description": "Image prompt"},
            "model": {"type": "string", "description": "Model to use", "default": "dall-e-3"},
            "size": {"type": "string", "description": "Image size", "default": "1024x1024"},
            "quality": {"type": "string", "description": "Image quality", "default": "standard"},
            "style": {"type": "string", "description": "Image style", "default": "vivid"},
        },
    },
    {
        "type": "canvas",
        "name": "Canvas",
        "description": "Render visual content on a canvas",
        "category": "Visual",
        "inputs": [
            {"name": "input", "type": "any", "description": "Content to render"},
        ],
        "outputs": [
            {"name": "output", "type": "string", "description": "Rendered canvas data URL"},
        ],
        "config_schema": {
            "width": {"type": "integer", "description": "Canvas width", "default": 1024},
            "height": {"type": "integer", "description": "Canvas height", "default": 1024},
            "background": {"type": "string", "description": "Background color", "default": "#ffffff"},
        },
    },
    {
        "type": "output",
        "name": "Output",
        "description": "Display or export workflow results",
        "category": "I/O",
        "inputs": [
            {"name": "input", "type": "any", "description": "Data to output"},
        ],
        "outputs": [],
        "config_schema": {
            "format": {"type": "string", "description": "Output format (json, text, image)", "default": "json"},
            "destination": {"type": "string", "description": "Output destination", "default": "response"},
        },
    },
    {
        "type": "agent",
        "name": "Agent",
        "description": "Autonomous agent that can use tools and make decisions",
        "category": "AI",
        "inputs": [
            {"name": "input", "type": "string", "description": "Task description"},
        ],
        "outputs": [
            {"name": "output", "type": "string", "description": "Agent result"},
        ],
        "config_schema": {
            "task": {"type": "string", "description": "Task for the agent"},
            "agent_type": {"type": "string", "description": "Agent type", "default": "general"},
            "tools": {"type": "array", "description": "Available tools", "default": []},
            "max_steps": {"type": "integer", "description": "Max execution steps", "default": 10},
        },
    },
    {
        "type": "condition",
        "name": "Condition",
        "description": "Branch workflow based on a condition",
        "category": "Logic",
        "inputs": [
            {"name": "input", "type": "any", "description": "Data to evaluate"},
        ],
        "outputs": [
            {"name": "true", "type": "any", "description": "Output when condition is true"},
            {"name": "false", "type": "any", "description": "Output when condition is false"},
        ],
        "config_schema": {
            "expression": {"type": "string", "description": "Condition expression (e.g., 'input.score > 0.5')"},
        },
    },
    {
        "type": "loop",
        "name": "Loop",
        "description": "Iterate over a collection or repeat N times",
        "category": "Logic",
        "inputs": [
            {"name": "input", "type": "array", "description": "Collection to iterate"},
        ],
        "outputs": [
            {"name": "output", "type": "array", "description": "Collected results"},
        ],
        "config_schema": {
            "iterations": {"type": "integer", "description": "Number of iterations (if no input array)", "default": 1},
            "item_key": {"type": "string", "description": "Variable name for current item", "default": "item"},
        },
    },
    {
        "type": "memory",
        "name": "Memory",
        "description": "Store and retrieve data from workflow memory",
        "category": "Data",
        "inputs": [
            {"name": "input", "type": "any", "description": "Data to store"},
        ],
        "outputs": [
            {"name": "output", "type": "any", "description": "Retrieved data"},
        ],
        "config_schema": {
            "operation": {"type": "string", "description": "Operation: get, set, delete", "default": "get"},
            "key": {"type": "string", "description": "Memory key"},
            "default": {"type": "any", "description": "Default value for get operation", "default": None},
        },
    },
    {
        "type": "webhook",
        "name": "Webhook",
        "description": "Receive or send data via HTTP webhook",
        "category": "I/O",
        "inputs": [],
        "outputs": [
            {"name": "output", "type": "any", "description": "Webhook payload"},
        ],
        "config_schema": {
            "url": {"type": "string", "description": "Webhook URL"},
            "method": {"type": "string", "description": "HTTP method", "default": "POST"},
            "headers": {"type": "object", "description": "HTTP headers", "default": {}},
        },
    },
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/templates", response_model=List[NodeTemplate])
async def get_node_templates():
    """Return all available node templates."""
    return [NodeTemplate(**t) for t in NODE_TEMPLATES]


@router.post("/execute/text", response_model=TextGenResponse)
async def execute_text_node(request: TextGenRequest):
    """Execute a text generation node with the given configuration."""
    start = time.monotonic()

    # In production, this would call the actual LLM API
    # For now, return a mock response
    prompt = request.prompt
    for key, value in request.input_data.items():
        prompt = prompt.replace(f"{{{key}}}", str(value))

    text = f"[Mock text generation] Response for prompt: {prompt[:100]}..."
    duration_ms = (time.monotonic() - start) * 1000

    return TextGenResponse(
        text=text,
        model=request.model,
        tokens_used=len(prompt.split()) * 2,  # rough estimate
        duration_ms=round(duration_ms, 2),
    )


@router.post("/execute/image", response_model=ImageGenResponse)
async def execute_image_node(request: ImageGenRequest):
    """Execute an image generation node with the given configuration."""
    start = time.monotonic()

    # In production, this would call the actual image generation API
    prompt = request.prompt
    image_url = f"https://mock-images.creativeforge.ai/{request.size}/{hash(prompt) % 10000:04d}.png"
    duration_ms = (time.monotonic() - start) * 1000

    return ImageGenResponse(
        image_url=image_url,
        model=request.model,
        size=request.size,
        duration_ms=round(duration_ms, 2),
    )


@router.post("/execute/agent", response_model=AgentResponse)
async def execute_agent_node(request: AgentRequest):
    """Execute an agent node with the given task and tools."""
    start = time.monotonic()

    # In production, this would run the actual agent loop
    result = f"[Mock agent] Completed task: {request.task[:100]}..."
    duration_ms = (time.monotonic() - start) * 1000

    return AgentResponse(
        result=result,
        steps_taken=3,
        tool_calls=[
            {"tool": "search", "input": request.task, "output": "Found relevant info"},
            {"tool": "analyze", "input": "search results", "output": "Analysis complete"},
            {"tool": "generate", "input": "analysis", "output": result},
        ],
        duration_ms=round(duration_ms, 2),
    )
