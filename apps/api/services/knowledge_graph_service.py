import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class KnowledgeGraphService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_entities = {}
        self.mock_relations = {}
        self.mock_graphs = {}
        
    async def create_entity(
        self,
        user_id: str,
        entity_name: str,
        entity_type: str,
        description: Optional[str] = None,
        properties: Optional[Dict] = None
    ) -> Dict:
        """Create a new knowledge entity"""
        entity_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        entity = {
            "id": entity_id,
            "user_id": user_id,
            "entity_name": entity_name,
            "entity_type": entity_type,
            "description": description,
            "properties": properties or {},
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_entities[entity_id] = entity
            return entity
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_relation(
        self,
        source_entity_id: str,
        target_entity_id: str,
        relation_type: str,
        weight: float = 1.0,
        metadata: Optional[Dict] = None
    ) -> Optional[Dict]:
        """Create a relationship between two entities"""
        if self.mode == "mock":
            # Verify entities exist
            if source_entity_id not in self.mock_entities or target_entity_id not in self.mock_entities:
                return None
            
            relation_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            relation = {
                "id": relation_id,
                "source_entity_id": source_entity_id,
                "target_entity_id": target_entity_id,
                "relation_type": relation_type,
                "weight": weight,
                "metadata": metadata or {},
                "created_at": now
            }
            
            self.mock_relations[relation_id] = relation
            return relation
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_graph(
        self,
        user_id: str,
        graph_name: str,
        description: Optional[str] = None
    ) -> Dict:
        """Create a new knowledge graph"""
        graph_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        graph = {
            "id": graph_id,
            "user_id": user_id,
            "graph_name": graph_name,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "entities": []
        }
        
        if self.mode == "mock":
            self.mock_graphs[graph_id] = graph
            return graph
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_user_graphs(
        self,
        user_id: str
    ) -> List[Dict]:
        """Get all knowledge graphs for a user"""
        if self.mode == "mock":
            graphs = list(self.mock_graphs.values())
            return [g for g in graphs if g["user_id"] == user_id]
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_graph_entities(
        self,
        graph_id: str
    ) -> List[Dict]:
        """Get all entities in a graph (mock: returns all entities for user)"""
        if self.mode == "mock":
            graph = self.mock_graphs.get(graph_id)
            if not graph:
                return []
            # In mock mode, return all entities for the user
            return list(self.mock_entities.values())
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_entity_relations(
        self,
        entity_id: str
    ) -> List[Dict]:
        """Get all relations for an entity"""
        if self.mode == "mock":
            relations = list(self.mock_relations.values())
            return [r for r in relations if r["source_entity_id"] == entity_id or r["target_entity_id"] == entity_id]
        else:
            raise NotImplementedError("Prod mode not implemented yet")
