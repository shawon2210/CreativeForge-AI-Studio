import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class ResearchInspirationService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_topics = {}
        self.mock_papers = {}
        self.mock_sources = {}
        
    async def create_topic(
        self,
        user_id: str,
        topic_name: str,
        description: Optional[str] = None,
        keywords: Optional[List[str]] = None
    ) -> Dict:
        """Create a new research topic"""
        topic_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        topic = {
            "id": topic_id,
            "user_id": user_id,
            "topic_name": topic_name,
            "description": description,
            "keywords": keywords or [],
            "status": "active",
            "metadata": {},
            "papers": [],
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_topics[topic_id] = topic
            return topic
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def add_paper(
        self,
        topic_id: str,
        title: str,
        authors: Optional[List[str]] = None,
        abstract: Optional[str] = None,
        url: Optional[str] = None,
        relevance_score: float = 0.0
    ) -> Optional[Dict]:
        """Add a research paper to a topic"""
        if self.mode == "mock":
            topic = self.mock_topics.get(topic_id)
            if not topic:
                return None
            
            paper_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            paper = {
                "id": paper_id,
                "topic_id": topic_id,
                "title": title,
                "authors": authors or [],
                "abstract": abstract,
                "url": url,
                "citation_count": 0,
                "relevance_score": relevance_score,
                "read": False,
                "notes": None,
                "metadata": {},
                "created_at": now
            }
            
            self.mock_papers[paper_id] = paper
            topic["papers"].append(paper)
            return paper
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_inspiration(
        self,
        user_id: str,
        source_type: str,
        title: str,
        description: Optional[str] = None,
        url: Optional[str] = None,
        tags: Optional[List[str]] = None,
        rating: int = 0
    ) -> Dict:
        """Create a new inspiration source"""
        source_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        source = {
            "id": source_id,
            "user_id": user_id,
            "source_type": source_type,
            "title": title,
            "description": description,
            "url": url,
            "tags": tags or [],
            "rating": rating,
            "used_in_project": None,
            "metadata": {},
            "created_at": now
        }
        
        if self.mode == "mock":
            self.mock_sources[source_id] = source
            return source
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_topic_with_papers(
        self,
        topic_id: str
    ) -> Optional[Dict]:
        """Get research topic with all papers"""
        if self.mode == "mock":
            topic = self.mock_topics.get(topic_id)
            return topic
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_user_inspirations(
        self,
        user_id: str,
        source_type: Optional[str] = None
    ) -> List[Dict]:
        """Get all inspiration sources for a user"""
        if self.mode == "mock":
            sources = list(self.mock_sources.values())
            sources = [s for s in sources if s["user_id"] == user_id]
            if source_type:
                sources = [s for s in sources if s["source_type"] == source_type]
            return sources
        else:
            raise NotImplementedError("Prod mode not implemented yet")
