import os
from typing import Dict, Optional, List, Any
from datetime import datetime
from sqlmodel import Session, select

from ..models.multi_agent import Agent, AgentMessage, AgentTask

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_agents: Dict[int, Agent] = {}
_mock_messages: List[AgentMessage] = []
_mock_tasks: Dict[int, AgentTask] = {}
_mock_agent_id = 1
_mock_message_id = 1
_mock_task_id = 1


class BaseAgent:
    """Base class for all agents in the multi-agent system"""
    
    def __init__(self, agent_type: str, name: str, user_id: str, capabilities: List[str] = None):
        self.agent_type = agent_type
        self.name = name
        self.user_id = user_id
        self.capabilities = capabilities or []
        self.agent_id = None
        self._init_agent()
    
    def _init_agent(self):
        """Initialize or retrieve agent from storage"""
        if MODE == "mock":
            # Check if agent already exists
            for agent in _mock_agents.values():
                if agent.name == self.name and agent.user_id == self.user_id:
                    self.agent_id = agent.id
                    return
            # Create new agent
            global _mock_agent_id
            agent = Agent(
                id=_mock_agent_id,
                name=self.name,
                agent_type=self.agent_type,
                capabilities=self.capabilities,
                status="idle",
                user_id=self.user_id
            )
            _mock_agents[_mock_agent_id] = agent
            self.agent_id = _mock_agent_id
            _mock_agent_id += 1
        else:
            # Prod mode: query or create in DB
            from app.database import engine
            with Session(engine) as session:
                existing = session.exec(
                    select(Agent).where(
                        Agent.name == self.name,
                        Agent.user_id == self.user_id
                    )
                ).first()
                if existing:
                    self.agent_id = existing.id
                else:
                    agent = Agent(
                        name=self.name,
                        agent_type=self.agent_type,
                        capabilities=self.capabilities,
                        status="idle",
                        user_id=self.user_id
                    )
                    session.add(agent)
                    session.commit()
                    session.refresh(agent)
                    self.agent_id = agent.id
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        """Process a task - to be overridden by subclasses"""
        raise NotImplementedError("Subclasses must implement process_task")
    
    def send_message(self, to_agent_id: int, message_type: str, payload: Dict) -> AgentMessage:
        """Send a message to another agent"""
        if MODE == "mock":
            global _mock_message_id
            msg = AgentMessage(
                id=_mock_message_id,
                from_agent_id=self.agent_id,
                to_agent_id=to_agent_id,
                message_type=message_type,
                payload=payload,
                user_id=self.user_id
            )
            _mock_messages.append(msg)
            _mock_message_id += 1
            return msg
        else:
            from app.database import engine
            with Session(engine) as session:
                msg = AgentMessage(
                    from_agent_id=self.agent_id,
                    to_agent_id=to_agent_id,
                    message_type=message_type,
                    payload=payload,
                    user_id=self.user_id
                )
                session.add(msg)
                session.commit()
                session.refresh(msg)
                return msg
    
    def get_messages(self, as_sender: bool = False) -> List[AgentMessage]:
        """Get messages for this agent"""
        if MODE == "mock":
            if as_sender:
                return [m for m in _mock_messages if m.from_agent_id == self.agent_id]
            return [m for m in _mock_messages if m.to_agent_id == self.agent_id]
        else:
            from app.database import engine
            with Session(engine) as session:
                if as_sender:
                    return session.exec(
                        select(AgentMessage).where(AgentMessage.from_agent_id == self.agent_id)
                    ).all()
                return session.exec(
                    select(AgentMessage).where(AgentMessage.to_agent_id == self.agent_id)
                ).all()
    
    def create_task(self, task_type: str, input_data: Dict) -> AgentTask:
        """Create a new task for this agent"""
        if MODE == "mock":
            global _mock_task_id
            task = AgentTask(
                id=_mock_task_id,
                agent_id=self.agent_id,
                task_type=task_type,
                input_data=input_data,
                status="pending",
                user_id=self.user_id
            )
            _mock_tasks[_mock_task_id] = task
            _mock_task_id += 1
            return task
        else:
            from app.database import engine
            with Session(engine) as session:
                task = AgentTask(
                    agent_id=self.agent_id,
                    task_type=task_type,
                    input_data=input_data,
                    status="pending",
                    user_id=self.user_id
                )
                session.add(task)
                session.commit()
                session.refresh(task)
                return task


# ---------- Individual Agent Implementations ----------

class DirectorAgent(BaseAgent):
    """Handles cinematic vision and creative direction"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("director", name, user_id, ["cinematic_analysis", "prompt_enhancement"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "analyze":
            # Mock: analyze prompt for cinematic elements
            return {
                "intent": {"subject": "unknown", "genre": "unknown"},
                "suggestions": {
                    "cinematic_framing": ["wide shot"],
                    "color_grading": ["teal-orange"]
                }
            }
        elif task_type == "enhance":
            prompt = input_data.get("prompt", "")
            return {"enhanced_prompt": f"[Director Enhanced] {prompt}"}
        return {"status": "task_not_supported"}


class WriterAgent(BaseAgent):
    """Handles storyelling and narrative structure"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("writer", name, user_id, ["storytelling", "narrative_analysis"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "story":
            return {"narrative": "Mock story structure", "themes": ["conflict", "resolution"]}
        return {"status": "task_not_supported"}


class VisualAgent(BaseAgent):
    """Handles image aesthetics and visual style"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("visual", name, user_id, ["color_analysis", "composition"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "analyze":
            return {"color_palette": ["#ff0000", "#00ff00"], "composition": "rule_of_thirds"}
        return {"status": "task_not_supported"}


class LightingAgent(BaseAgent):
    """Handles scene illumination and lighting setup"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("lighting", name, user_id, ["lighting_setup", "mood_lighting"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "setup":
            return {"lighting": "three_point_lighting", "mood": "cinematic"}
        return {"status": "task_not_supported"}


class ConsistencyAgent(BaseAgent):
    """Maintains continuity across generations"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("consistency", name, user_id, ["continuity_check", "style_validation"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "validate":
            return {"is_consistent": True, "issues": []}
        return {"status": "task_not_supported"}


class PromptEngineerAgent(BaseAgent):
    """Optimizes prompts for better generation results"""
    
    def __init__(self, name: str, user_id: str):
        super().__init__("prompt_engineer", name, user_id, ["prompt_optimization", "keyword_extraction"])
    
    def process_task(self, task_type: str, input_data: Dict) -> Dict:
        if task_type == "optimize":
            prompt = input_data.get("prompt", "")
            return {"optimized_prompt": f"[Engineered] {prompt}", "keywords": ["cinematic", "4k"]}
        return {"status": "task_not_supported"}


# ---------- Agent Factory ----------
def get_agent(agent_type: str, user_id: str) -> Optional[BaseAgent]:
    """Retrieve an existing agent by type and user"""
    if MODE == "mock":
        for agent in _mock_agents.values():
            if agent.agent_type == agent_type and agent.user_id == user_id:
                # Recreate the appropriate agent class
                from app.services.multi_agent_service import DirectorAgent, WriterAgent, VisualAgent
                if agent_type == "director":
                    return DirectorAgent(agent.name, user_id)
                elif agent_type == "writer":
                    return WriterAgent(agent.name, user_id)
                elif agent_type == "visual":
                    return VisualAgent(agent.name, user_id)
        return None
    else:
        from app.database import engine
        with Session(engine) as session:
            agent = session.exec(
                select(Agent).where(
                    Agent.agent_type == agent_type,
                    Agent.user_id == user_id
                )
            ).first()
            if agent:
                from app.services.multi_agent_service import DirectorAgent, WriterAgent, VisualAgent
                if agent_type == "director":
                    return DirectorAgent(agent.name, user_id)
                elif agent_type == "writer":
                    return WriterAgent(agent.name, user_id)
                elif agent_type == "visual":
                    return VisualAgent(agent.name, user_id)
            return None
