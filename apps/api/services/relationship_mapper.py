import re
from typing import Dict, List, Any, Tuple
from collections import defaultdict

class RelationshipMapper:
    """AI-powered relationship mapping between creative assets"""
    
    def __init__(self, db=None):
        self.db = db
        # Relationship types
        self.relation_types = [
            "style_similarity",
            "subject_similarity", 
            "color_palette_match",
            "composition_similarity",
            "narrative_connection",
            "character_reference",
            "location_reference",
            "timeline_sequence"
        ]
    
    def analyze_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity score (0.0 to 1.0)"""
        # Simple word overlap for mock - in prod use embeddings
        words1 = set(re.findall(r'\w+', text1.lower()))
        words2 = set(re.findall(r'\w+', text2.lower()))
        
        if not words1 or not words2:
            return 0.0
        
        overlap = words1.intersection(words2)
        return len(overlap) / max(len(words1), len(words2))
    
    def detect_relationships(self, assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze a list of assets and detect relationships between them.
        Returns list of edges with relationship metadata.
        """
        relationships = []
        
        for i, asset1 in enumerate(assets):
            for j, asset2 in enumerate(assets[i+1:], i+1):
                # Calculate various similarity scores
                prompt_sim = self.analyze_text_similarity(
                    asset1.get('prompt', ''), 
                    asset2.get('prompt', '')
                )
                
                # Determine relationship type based on similarity
                relation_type = "weak_connection"
                strength = prompt_sim
                
                if prompt_sim > 0.6:
                    relation_type = "strong_similarity"
                elif prompt_sim > 0.4:
                    relation_type = "moderate_similarity"
                
                # Check for specific patterns
                if any(word in asset1.get('prompt', '').lower() and word in asset2.get('prompt', '').lower() 
                       for word in ['character', 'person', 'warrior', 'hero']):
                    relation_type = "character_reference"
                    strength = max(strength, 0.7)
                
                if any(word in asset1.get('prompt', '').lower() and word in asset2.get('prompt', '').lower() 
                       for word in ['city', 'location', 'world', 'planet']):
                    relation_type = "location_reference"
                    strength = max(strength, 0.8)
                
                # Only create edge if there's meaningful relationship
                if strength > 0.3:
                    relationships.append({
                        "source": asset1.get('id'),
                        "target": asset2.get('id'),
                        "type": relation_type,
                        "strength": round(strength, 2),
                        "metadata": {
                            "prompt1": asset1.get('prompt', '')[:50],
                            "prompt2": asset2.get('prompt', '')[:50],
                            "detected_patterns": self._extract_patterns(
                                asset1.get('prompt', ''), 
                                asset2.get('prompt', '')
                            )
                        }
                    })
        
        return relationships
    
    def _extract_patterns(self, text1: str, text2: str) -> List[str]:
        """Extract common patterns between two texts"""
        patterns = []
        combined = (text1 + " " + text2).lower()
        
        pattern_keywords = {
            "cyberpunk": ["cyberpunk", "neon", "tech", "future"],
            "fantasy": ["fantasy", "magic", "dragon", "wizard"],
            "scifi": ["sci-fi", "space", "alien", "robot"],
            "cinematic": ["cinematic", "movie", "film", "shot"],
            "portrait": ["portrait", "face", "person", "character"]
        }
        
        for pattern, keywords in pattern_keywords.items():
            if any(kw in combined for kw in keywords):
                patterns.append(pattern)
        
        return patterns
    
    def suggest_links(self, new_asset: Dict[str, Any], existing_assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Suggest potential links when a new asset is added to the canvas"""
        suggestions = []
        
        for existing in existing_assets:
            if existing.get('id') == new_asset.get('id'):
                continue
            
            similarity = self.analyze_text_similarity(
                new_asset.get('prompt', ''),
                existing.get('prompt', '')
            )
            
            if similarity > 0.3:
                suggestions.append({
                    "target_id": existing.get('id'),
                    "target_label": existing.get('label', 'Unknown'),
                    "similarity": round(similarity, 2),
                    "reason": self._generate_link_reason(new_asset, existing)
                })
        
        return sorted(suggestions, key=lambda x: x['similarity'], reverse=True)[:5]
    
    def _generate_link_reason(self, asset1: Dict, asset2: Dict) -> str:
        """Generate human-readable reason for linking"""
        prompt1 = asset1.get('prompt', '').lower()
        prompt2 = asset2.get('prompt', '').lower()
        
        if 'cyberpunk' in prompt1 and 'cyberpunk' in prompt2:
            return "Both assets share cyberpunk theme"
        elif 'character' in prompt1 and 'character' in prompt2:
            return "Both are character-related assets"
        elif any(word in prompt1 and word in prompt2 for word in ['city', 'world', 'location']):
            return "Shared location/world elements"
        else:
            return "Similar prompt patterns detected"

# Export singleton instance
relationship_mapper = RelationshipMapper()
