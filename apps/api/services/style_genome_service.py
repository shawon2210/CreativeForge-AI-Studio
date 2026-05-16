import os
from typing import Dict, Optional, List
from datetime import datetime
from sqlmodel import Session, select

from ..models.style_genome import StyleDNA, StyleMutation, StyleEvolution

MODE = os.getenv("CREATIVEFORGE_MODE", "mock")

# Mock storage
_mock_style_dna: Dict[str, StyleDNA] = {}  # user_id -> StyleDNA
_mock_mutations: List[StyleMutation] = []
_mock_evolutions: List[StyleEvolution] = []
_mock_mid = 1
_mock_eid = 1


# ---------- Style DNA Core ----------
def get_user_style_dna(user_id: str) -> Optional[StyleDNA]:
    if MODE == "mock":
        return _mock_style_dna.get(user_id)
    from app.database import engine
    with Session(engine) as session:
        return session.exec(select(StyleDNA).where(StyleDNA.user_id == user_id)).first()


def update_style_dna(user_id: str, new_fingerprint: Dict) -> StyleDNA:
    if MODE == "mock":
        dna = _mock_style_dna.get(user_id)
        if not dna:
            dna = StyleDNA(user_id=user_id, style_fingerprint=new_fingerprint)
            _mock_style_dna[user_id] = dna
        else:
            dna.style_fingerprint = new_fingerprint
            dna.updated_at = datetime.utcnow()
        return dna
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        dna = session.exec(select(StyleDNA).where(StyleDNA.user_id == user_id)).first()
        if not dna:
            dna = StyleDNA(user_id=user_id, style_fingerprint=new_fingerprint)
            session.add(dna)
        else:
            dna.style_fingerprint = new_fingerprint
            dna.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(dna)
        return dna


# ---------- Style Mutation ----------
def mutate_style(user_id: str, mutation_type: str = "random") -> StyleMutation:
    current_dna = get_user_style_dna(user_id)
    original = current_dna.style_fingerprint if current_dna else {}
    # Mock mutation: flip 1-2 keys
    mutated = original.copy()
    if mutation_type == "random" and mutated:
        keys = list(mutated.keys())
        if keys:
            k = keys[0]
            mutated[k] = "mutated_" + str(mutated[k])  # Simple mock mutation
    if MODE == "mock":
        global _mock_mid
        mutation = StyleMutation(
            id=_mock_mid, user_id=user_id,
            original_dna=original, mutated_dna=mutated,
            mutation_type=mutation_type
        )
        _mock_mutations.append(mutation)
        _mock_mid += 1
        return mutation
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        mutation = StyleMutation(
            user_id=user_id, original_dna=original,
            mutated_dna=mutated, mutation_type=mutation_type
        )
        session.add(mutation)
        session.commit()
        session.refresh(mutation)
        return mutation


# ---------- Style Evolution ----------
def evolve_style(user_id: str, generation_id: int, feedback: str) -> StyleEvolution:
    current_dna = get_user_style_dna(user_id)
    style_dna = current_dna.style_fingerprint if current_dna else {}
    # Mock evolution score based on feedback
    score = 0.9 if feedback == "like" else 0.3 if feedback == "dislike" else 0.5
    if MODE == "mock":
        global _mock_eid
        evolution = StyleEvolution(
            id=_mock_eid, user_id=user_id, generation_id=generation_id,
            style_dna=style_dna, evolution_score=score, feedback=feedback
        )
        _mock_evolutions.append(evolution)
        _mock_eid += 1
        return evolution
    # Prod mode
    from app.database import engine
    with Session(engine) as session:
        evolution = StyleEvolution(
            user_id=user_id, generation_id=generation_id,
            style_dna=style_dna, evolution_score=score, feedback=feedback
        )
        session.add(evolution)
        session.commit()
        session.refresh(evolution)
        return evolution
