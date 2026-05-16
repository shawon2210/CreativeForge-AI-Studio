import os
from typing import Dict, Optional, List, Any
from datetime import datetime
from sqlmodel import Session, select

from ..models.visual_node import NodeTemplate, Workflow, NodeConnection

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_templates: Dict[int, NodeTemplate] = {}
_mock_workflows: Dict[int, Workflow] = {}
_mock_connections: List[NodeConnection] = []
_mock_template_id = 1
_mock_workflow_id = 1
_mock_connection_id = 1


# ---------- Node Template Management ----------
def get_node_templates(category: Optional[str] = None, user_id: Optional[str] = None) -> List[NodeTemplate]:
    if MODE == "mock":
        templates = list(_mock_templates.values())
        if category:
            templates = [t for t in templates if t.category == category]
        if user_id:
            templates = [t for t in templates if t.user_id == user_id or t.user_id == "system"]
        return templates
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        query = select(NodeTemplate)
        if category:
            query = query.where(NodeTemplate.category == category)
        if user_id:
            query = query.where((NodeTemplate.user_id == user_id) | (NodeTemplate.user_id == "system"))
        return session.exec(query).all()


def create_node_template(
    name: str, node_type: str, category: str,
    default_config: Dict, input_types: List[str], output_types: List[str],
    user_id: str
) -> NodeTemplate:
    if MODE == "mock":
        global _mock_template_id
        template = NodeTemplate(
            id=_mock_template_id,
            name=name, node_type=node_type, category=category,
            default_config=default_config, input_types=input_types,
            output_types=output_types, user_id=user_id
        )
        _mock_templates[_mock_template_id] = template
        _mock_template_id += 1
        return template
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        template = NodeTemplate(
            name=name, node_type=node_type, category=category,
            default_config=default_config, input_types=input_types,
            output_types=output_types, user_id=user_id
        )
        session.add(template)
        session.commit()
        session.refresh(template)
        return template


# ---------- AI Node Generation ----------
def generate_nodes_from_text(description: str, user_id: str) -> Dict[str, Any]:
    """Generate nodes and connections from natural language description"""
    description_lower = description.lower()
    nodes = []
    edges = []
    
    # Mock: keyword-based node generation
    node_id = 1
    
    if "prompt" in description_lower or "text" in description_lower:
        nodes.append({
            "id": f"node_{node_id}",
            "type": "prompt",
            "position": {"x": 100, "y": 100},
            "data": {"label": "Prompt Input", "config": {"prompt": ""}}
        })
        node_id += 1
    
    if "image" in description_lower or "gen" in description_lower:
        # Connect to previous node if exists
        source_handle = f"node_{node_id-1}" if nodes else None
        nodes.append({
            "id": f"node_{node_id}",
            "type": "image_gen",
            "position": {"x": 300, "y": 100},
            "data": {"label": "Image Generation", "config": {"model": "mock_sd"}}
        })
        if source_handle:
            edges.append({
                "id": f"edge_{len(edges)+1}",
                "source": source_handle,
                "target": f"node_{node_id}",
                "sourceHandle": "output",
                "targetHandle": "input"
            })
        node_id += 1
    
    if "filter" in description_lower or "adjust" in description_lower:
        source_handle = f"node_{node_id-1}" if nodes else None
        nodes.append({
            "id": f"node_{node_id}",
            "type": "filter",
            "position": {"x": 500, "y": 100},
            "data": {"label": "Filter", "config": {"brightness": 1.0}}
        })
        if source_handle:
            edges.append({
                "id": f"edge_{len(edges)+1}",
                "source": source_handle,
                "target": f"node_{node_id}",
                "sourceHandle": "output",
                "targetHandle": "input"
            })
        node_id += 1
    
    if "output" in description_lower or "save" in description_lower:
        source_handle = f"node_{node_id-1}" if nodes else None
        nodes.append({
            "id": f"node_{node_id}",
            "type": "output",
            "position": {"x": 700, "y": 100},
            "data": {"label": "Output", "config": {"format": "png"}}
        })
        if source_handle:
            edges.append({
                "id": f"edge_{len(edges)+1}",
                "source": source_handle,
                "target": f"node_{node_id}",
                "sourceHandle": "output",
                "targetHandle": "input"
            })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "description": description,
        "generated_at": datetime.utcnow().isoformat()
    }


def create_workflow_from_text(name: str, description: str, user_id: str) -> Workflow:
    """Create a complete workflow from natural language"""
    generated = generate_nodes_from_text(description=description, user_id=user_id)
    
    workflow_data = {
        "nodes": generated["nodes"],
        "edges": generated["edges"],
        "viewport": {"x": 0, "y": 0, "zoom": 1.0}
    }
    
    if MODE == "mock":
        global _mock_workflow_id
        workflow = Workflow(
            id=_mock_workflow_id,
            name=name,
            description=description,
            workflow_data=workflow_data,
            is_template=False,
            user_id=user_id
        )
        _mock_workflows[_mock_workflow_id] = workflow
        _mock_workflow_id += 1
        return workflow
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        workflow = Workflow(
            name=name,
            description=description,
            workflow_data=workflow_data,
            is_template=False,
            user_id=user_id
        )
        session.add(workflow)
        session.commit()
        session.refresh(workflow)
        return workflow
