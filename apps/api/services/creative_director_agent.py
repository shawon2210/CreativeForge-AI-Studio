import os
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.services.rag_service import retrieve_similar_memories
from app.services.prompt_utils import detect_weak_prompt, suggest_prompt_improvements
from app.models.user_style_dna import UserStyleDNA  # Will create this model next

logger = logging.getLogger(__name__)

# Project's dual mode: mock (CPU) / prod (GPU) - aligned to existing setup
MODE = os.getenv("CREATIVEFORGE_MODE", "mock")  # mock or prod

class CreativeDirectorAgent:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.mode = MODE
        self.user_style = self._load_user_style()

    def _load_user_style(self) -> Optional[Dict[str, Any]]:
        """Load user's style DNA from Feature 1 tables"""
        style = self.db.query(UserStyleDNA).filter(UserStyleDNA.user_id == self.user_id).first()
        if style:
            return {
                "preferred_colors": style.preferred_color_palettes,
                "composition": style.composition_tendencies,
                "lighting": style.lighting_preferences
            }
        return None

    def analyze_intent(self, prompt: str) -> Dict[str, Any]:
        """Analyze user prompt to extract creative intent"""
        if self.mode == "mock":
            # Rule-based intent analysis for mock mode
            intent = {"subject": "unknown", "genre": "unknown", "style": "unknown"}
            prompt_lower = prompt.lower()
            # Detect subject
            if any(word in prompt_lower for word in ["warrior", "character", "person"]):
                intent["subject"] = "character"
            elif any(word in prompt_lower for word in ["city", "landscape", "world"]):
                intent["subject"] = "environment"
            # Detect genre
            if "cyberpunk" in prompt_lower:
                intent["genre"] = "cyberpunk"
            elif "fantasy" in prompt_lower:
                intent["genre"] = "fantasy"
            # Detect style
            if "cinematic" in prompt_lower:
                intent["style"] = "cinematic"
            return intent
        else:
            # Prod mode: use LLM for intent analysis (placeholder)
            logger.info("Prod mode: LLM intent analysis not yet implemented")
            return {"subject": "unknown", "genre": "unknown", "style": "unknown"}

    def detect_weak_prompts(self, prompt: str) -> Dict[str, Any]:
        """Detect vague/weak prompts and rate quality using shared utility"""
        weakness = detect_weak_prompt(prompt)
        weakness["improvement_suggestions"] = suggest_prompt_improvements(prompt, weakness)
        return weakness

    def suggest_improvements(self, prompt: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Generate creative suggestions based on intent and user style"""
        suggestions = {
            "atmosphere": [],
            "cinematic_framing": [],
            "color_grading": [],
            "camera_angles": [],
            "lighting": [],
            "alternate_directions": []
        }
        # Mock mode rule-based suggestions
        if intent["genre"] == "cyberpunk":
            suggestions["atmosphere"].extend(["neon-soaked rain", "foggy dystopian streets", "holographic billboards"])
            suggestions["color_grading"].extend(["teal-orange contrast", "high saturation neon", "dark shadows with bright highlights"])
            suggestions["camera_angles"].extend(["low angle heroic shot", "wide establishing shot", "close-up on cybernetic implants"])
            suggestions["lighting"].extend(["neon rim lighting", "volumetric fog with street lights", "harsh fluorescent overhead"])
        # Incorporate user style if available
        if self.user_style:
            if self.user_style.get("preferred_colors"):
                suggestions["color_grading"].append(f"Use your preferred palette: {', '.join(self.user_style['preferred_colors'][:3])}")
            if self.user_style.get("lighting"):
                suggestions["lighting"].append(f"Match your lighting preference: {self.user_style['lighting']}")
        # Add user memory context from Feature 1
        memories = retrieve_similar_memories(self.db, self.user_id, prompt, limit=2)
        if memories:
            suggestions["alternate_directions"].append(f"Based on your past work: {memories[0].content_text}")
        return suggestions

    def enhance_prompt(self, prompt: str) -> Dict[str, Any]:
        """Full agent workflow: analyze, detect issues, suggest improvements"""
        intent = self.analyze_intent(prompt)
        weakness = self.detect_weak_prompts(prompt)
        suggestions = self.suggest_improvements(prompt, intent)
        # Build enhanced prompt
        enhanced = prompt
        if suggestions["atmosphere"]:
            enhanced += f" | Atmosphere: {', '.join(suggestions['atmosphere'][:2])}"
        if suggestions["lighting"]:
            enhanced += f" | Lighting: {', '.join(suggestions['lighting'][:2])}"
        return {
            "original_prompt": prompt,
            "intent": intent,
            "weakness_analysis": weakness,
            "suggestions": suggestions,
            "enhanced_prompt": enhanced
        }
