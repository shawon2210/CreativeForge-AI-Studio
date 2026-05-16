import os
import uuid
import re
from datetime import datetime
from typing import Optional, Dict, List

class PromptToProductService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_templates = {}
        self.mock_products = {}
        self.mock_iterations = {}
        
    def _fill_template(self, template: str, variables: Dict) -> str:
        """Fill template placeholders with variables"""
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{key}}}", str(value))
        return result
    
    async def create_template(
        self,
        user_id: str,
        name: str,
        template: str,
        description: Optional[str] = None,
        category: str = "general"
    ) -> Dict:
        """Create a new prompt template"""
        template_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        template_obj = {
            "id": template_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "template": template,
            "category": category,
            "created_at": now,
            "updated_at": now
        }
        
        if self.mode == "mock":
            self.mock_templates[template_id] = template_obj
            return template_obj
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def generate_product(
        self,
        user_id: str,
        prompt: str,
        product_type: str,
        template_id: Optional[str] = None,
        variables: Optional[Dict] = None
    ) -> Dict:
        """Generate a product from a prompt or template"""
        product_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # If template provided, fill it with variables
        actual_prompt = prompt
        if template_id and template_id in self.mock_templates:
            template_obj = self.mock_templates[template_id]
            if variables:
                actual_prompt = self._fill_template(template_obj["template"], variables)
            else:
                actual_prompt = template_obj["template"]
        
        product = {
            "id": product_id,
            "user_id": user_id,
            "template_id": template_id,
            "prompt_used": actual_prompt,
            "product_type": product_type,
            "product_url": f"https://mock.example.com/products/{product_id}/result.png",
            "metadata": {},
            "status": "completed",
            "created_at": now,
            "updated_at": now,
            "iterations": []
        }
        
        if self.mode == "mock":
            self.mock_products[product_id] = product
            return product
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_user_products(
        self,
        user_id: str,
        product_type: Optional[str] = None
    ) -> List[Dict]:
        """Get all products for a user"""
        if self.mode == "mock":
            products = list(self.mock_products.values())
            products = [p for p in products if p["user_id"] == user_id]
            if product_type:
                products = [p for p in products if p["product_type"] == product_type]
            return products
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def iterate_product(
        self,
        product_id: str,
        new_prompt: str,
        changes: Optional[Dict] = None
    ) -> Optional[Dict]:
        """Create a new iteration of a product"""
        if self.mode == "mock":
            product = self.mock_products.get(product_id)
            if not product:
                return None
            
            iteration_id = str(uuid.uuid4())
            iteration_number = len(product["iterations"]) + 1
            now = datetime.utcnow().isoformat()
            
            iteration = {
                "id": iteration_id,
                "product_id": product_id,
                "iteration_number": iteration_number,
                "prompt_used": new_prompt,
                "product_url": f"https://mock.example.com/products/{product_id}/iteration_{iteration_number}.png",
                "changes": changes or {},
                "created_at": now
            }
            
            self.mock_iterations[iteration_id] = iteration
            product["iterations"].append(iteration)
            product["updated_at"] = now
            
            return iteration
        else:
            raise NotImplementedError("Prod mode not implemented yet")
