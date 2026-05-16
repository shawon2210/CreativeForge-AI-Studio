import os
from pathlib import Path
from fastapi import APIRouter, Body, HTTPException, Query

# Add apps/api to Python path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from services.prompt_to_product_service import PromptToProductService

router = APIRouter(prefix="/prompt-to-product", tags=["Prompt-to-Product"])

# Initialize service with dual mode
service = PromptToProductService(mode=os.getenv("CREATIVEFORGE_MODE", "mock"))

@router.post("/templates/")
async def create_template(
    user_id: str = Body(...),
    name: str = Body(...),
    template: str = Body(...),
    description: str = Body(None),
    category: str = Body("general")
):
    """Create a new prompt template"""
    try:
        return await service.create_template(user_id, name, template, description, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@router.post("/generate/")
async def generate_product(
    user_id: str = Body(...),
    prompt: str = Body(...),
    product_type: str = Body(...),
    template_id: str = Body(None),
    variables: dict = Body({})
):
    """Generate a product from a prompt or template"""
    try:
        return await service.generate_product(user_id, prompt, product_type, template_id, variables)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate product: {str(e)}")

@router.get("/products/")
async def get_user_products(
    user_id: str = Query(...),
    product_type: str = Query(None)
):
    """Get all products for a user"""
    try:
        return await service.get_user_products(user_id, product_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get products: {str(e)}")

@router.post("/products/{product_id}/iterate/")
async def iterate_product(
    product_id: str,
    body: dict = Body(...)
):
    """Create a new iteration of a product"""
    new_prompt = body.get("new_prompt", "")
    changes = body.get("changes", {})
    try:
        result = await service.iterate_product(product_id, new_prompt, changes)
        if not result:
            raise HTTPException(status_code=404, detail="Product not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to iterate product: {str(e)}")
