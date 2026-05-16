from fastapi import APIRouter, Body
from typing import Dict, List, Optional

from ..services.multi_agent_service import (
    BaseAgent, DirectorAgent, WriterAgent, VisualAgent,
    LightingAgent, ConsistencyAgent, PromptEngineerAgent,
    get_agent
)
from ..models.multi_agent import Agent, AgentMessage, AgentTask

router = APIRouter(prefix="/multi-agent", tags=["Multi-Agent Collaboration"])

@router.post("/agent/create/", response_model=Agent)
async def create_agent_endpoint(
    agent_type: str = Body(...),
    name: str = Body(...),
    user_id: str = Body(...),
    capabilities: List[str] = Body(default=[])
):
    if agent_type == "director":
        agent = DirectorAgent(name=name, user_id=user_id)
    elif agent_type == "writer":
        agent = WriterAgent(name=name, user_id=user_id)
    elif agent_type == "visual":
        agent = VisualAgent(name=name, user_id=user_id)
    elif agent_type == "lighting":
        agent = LightingAgent(name=name, user_id=user_id)
    elif agent_type == "consistency":
        agent = ConsistencyAgent(name=name, user_id=user_id)
    elif agent_type == "prompt_engineer":
        agent = PromptEngineerAgent(name=name, user_id=user_id)
    else:
        return {"error": "Invalid agent type"}
    return {"id": agent.agent_id, "name": agent.name, "agent_type": agent.agent_type, "status": "idle"}

@router.get("/agent/{agent_type}/{user_id}", response_model=Optional[Agent])
async def get_agent_endpoint(agent_type: str, user_id: str):
    agent = get_agent(agent_type=agent_type, user_id=user_id)
    if agent:
        return {"id": agent.agent_id, "name": agent.name, "agent_type": agent.agent_type, "capabilities": agent.capabilities}
    return None

@router.post("/message/send/", response_model=AgentMessage)
async def send_message_endpoint(
    from_agent_id: int = Body(...),
    to_agent_id: int = Body(...),
    message_type: str = Body(default="info"),
    payload: Dict = Body(...),
    user_id: str = Body(...)
):
    sender = get_agent_by_id(from_agent_id, user_id)
    if not sender:
        return {"error": "Sender agent not found"}
    return sender.send_message(to_agent_id=to_agent_id, message_type=message_type, payload=payload)

@router.get("/messages/{agent_id}/", response_model=List[AgentMessage])
async def get_messages_endpoint(agent_id: int, as_sender: bool = False):
    # Mock: get agent by id
    agent = get_mock_agent_by_id(agent_id)
    if not agent:
        return []
    return agent.get_messages(as_sender=as_sender)

@router.post("/task/create/", response_model=AgentTask)
async def create_task_endpoint(
    agent_id: int = Body(...),
    task_type: str = Body(...),
    input_data: Dict = Body(...),
    user_id: str = Body(...)
):
    agent = get_mock_agent_by_id(agent_id)
    if not agent:
        return {"error": "Agent not found"}
    return agent.create_task(task_type=task_type, input_data=input_data)

@router.post("/task/process/{task_id}/")
async def process_task_endpoint(task_id: int, agent_id: int = Body(...)):
    # Mock processing
    return {"status": "processed", "task_id": task_id, "result": {"mock": "result"}}

# ---------- Helper Functions (Mock Only) ----------
def get_agent_by_id(agent_id: int, user_id: str) -> Optional[BaseAgent]:
    """Retrieve agent by ID (mock mode)"""
    from ..services.multi_agent_service import _mock_agents
    agent_model = _mock_agents.get(agent_id)
    if not agent_model:
        return None
    # Recreate the appropriate agent class
    if agent_model.agent_type == "director":
        return DirectorAgent(name=agent_model.name, user_id=user_id)
    elif agent_model.agent_type == "writer":
        return WriterAgent(name=agent_model.name, user_id=user_id)
    # Add other types as needed
    return None

def get_mock_agent_by_id(agent_id: int) -> Optional[BaseAgent]:
    """Get mock agent by ID"""
    from ..services.multi_agent_service import _mock_agents
    agent_model = _mock_agents.get(agent_id)
    if not agent_model:
        return None
    if agent_model.agent_type == "director":
        return DirectorAgent(name=agent_model.name, user_id=agent_model.user_id)
    return None
