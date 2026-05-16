import re
from typing import Dict, List, Any

def detect_weak_prompt(prompt: str) -> Dict[str, Any]:
    """Detect vague/weak prompts and rate quality (extracted from agent for reusability)"""
    score = 0
    issues = []
    word_count = len(prompt.split())
    
    # 1. Length check
    if word_count < 5:
        issues.append(f"Prompt is too short ({word_count} words, recommended ≥5)")
        score += 30
    elif word_count < 10:
        issues.append(f"Prompt is brief ({word_count} words, consider adding more details)")
        score += 15
    
    # 2. Descriptive terms check
    descriptive_categories = {
        "visual": ["cinematic", "atmosphere", "lighting", "color", "mood", "texture", "composition"],
        "style": ["realistic", "stylized", "anime", "cyberpunk", "fantasy", "minimalist"],
        "technical": ["4k", "8k", "hdr", "hdri", "ray tracing", "volumetric"]
    }
    found_descriptive = []
    for category, terms in descriptive_categories.items():
        if any(term in prompt.lower() for term in terms):
            found_descriptive.append(category)
    if not found_descriptive:
        issues.append("Missing descriptive terms (add atmosphere, lighting, mood, style)")
        score += 40
    elif len(found_descriptive) < 2:
        issues.append(f"Only {len(found_descriptive)} descriptive category(ies) found, add more details")
        score += 20
    
    # 3. Specificity check
    generic_terms = ["create", "generate", "make", "art", "image", "picture"]
    if any(term == prompt.lower().strip() for term in generic_terms):
        issues.append("Prompt is too generic, specify subject and style")
        score += 50
    elif sum(1 for term in generic_terms if term in prompt.lower()) >= 3:
        issues.append("Prompt contains too many generic terms, be more specific")
        score += 25
    
    # 4. Capitalization/punctuation check (basic grammar)
    if prompt == prompt.lower():
        issues.append("Consider using proper capitalization for proper nouns/style terms")
        score += 5
    
    return {
        "is_weak": score > 50,
        "quality_score": max(0, 100 - score),
        "issues": issues,
        "word_count": word_count,
        "descriptive_categories_found": found_descriptive
    }

def suggest_prompt_improvements(prompt: str, weakness_analysis: Dict[str, Any]) -> List[str]:
    """Generate actionable improvement suggestions based on weakness analysis"""
    suggestions = []
    if weakness_analysis["word_count"] < 5:
        suggestions.append("Add more details: describe subject, setting, style, lighting")
    if not weakness_analysis["descriptive_categories_found"]:
        suggestions.append("Add descriptive terms: e.g., 'cinematic lighting', 'neon atmosphere', '4k resolution'")
    if "generic" in str(weakness_analysis["issues"]).lower():
        suggestions.append("Be specific: instead of 'create image', say 'cyberpunk warrior with neon armor in rainy street'")
    return suggestions
