import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.generation import Generation
from app.services.rag_service import store_memory, retrieve_similar_memories
from app.services.creative_director_agent import CreativeDirectorAgent
from app.services.style_genome_service import StyleGenomeService

router = APIRouter(prefix="/generations", tags=["generations"])

@router.post("/")
async def create_generation(
    prompt: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    # 1. Initialize Creative Director Agent
    agent = CreativeDirectorAgent(db, user_id)
    agent_analysis = agent.enhance_prompt(prompt)
    
    # 2. Get user's style DNA
    style_service = StyleGenomeService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))
    style_dna = await style_service.get_user_style_dna(user_id)
    
    # 3. Retrieve similar past memories
    similar_memories = retrieve_similar_memories(db, user_id, prompt, limit=3)
    memory_context = "\n".join([m.content_text for m in similar_memories])
    
    # 4. Combine agent-enhanced prompt with memory and style DNA context
    style_context = f"Style DNA: {style_dna.get('style_fingerprint', {})}" if style_dna else ""
    final_prompt = f"{agent_analysis['enhanced_prompt']}\nContext from past work: {memory_context}\n{style_context}"
    
    # 4. TODO: Add actual AI generation logic here
    generation_result = f"Generated result for: {final_prompt}"
    
    # 5. Store new memory
    store_memory(
        db=db,
        user_id=user_id,
        content_type="generation",
        content_text=prompt,
        metadata={
            "result": generation_result,
            "agent_analysis": agent_analysis,
            "style_dna": style_dna
        }
    )
    
    return {
        "original_prompt": prompt,
        "agent_analysis": agent_analysis,
        "style_dna": style_dna,
        "final_enhanced_prompt": final_prompt,
        "result": generation_result,
        "similar_memories_count": len(similar_memories)
    }
