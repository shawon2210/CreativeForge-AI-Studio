import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class MarketplaceService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_items = {}
        self.mock_transactions = {}
        self.mock_reviews = {}
        
    async def create_item(
        self,
        seller_id: str,
        item_name: str,
        description: str,
        item_type: str,
        price: float = 0.0,
        download_url: Optional[str] = None,
        preview_url: Optional[str] = None
    ) -> Dict:
        """Create a new marketplace item"""
        item_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        item = {
            "id": item_id,
            "seller_id": seller_id,
            "item_name": item_name,
            "description": description,
            "item_type": item_type,
            "price": price,
            "download_url": download_url,
            "preview_url": preview_url,
            "status": "active",
            "metadata": {},
            "created_at": now,
            "updated_at": now,
            "reviews": [],
            "transactions": []
        }
        
        if self.mode == "mock":
            self.mock_items[item_id] = item
            return item
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_marketplace_items(
        self,
        item_type: Optional[str] = None,
        status: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Dict]:
        """Get all marketplace items with optional filters"""
        if self.mode == "mock":
            items = list(self.mock_items.values())
            if item_type:
                items = [i for i in items if i["item_type"] == item_type]
            if status:
                items = [i for i in items if i["status"] == status]
            if min_price is not None:
                items = [i for i in items if i["price"] >= min_price]
            if max_price is not None:
                items = [i for i in items if i["price"] <= max_price]
            return items
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def purchase_item(
        self,
        item_id: str,
        buyer_id: str,
        amount: float
    ) -> Optional[Dict]:
        """Purchase a marketplace item (create transaction)"""
        if self.mode == "mock":
            item = self.mock_items.get(item_id)
            if not item:
                return None
            
            transaction_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            transaction = {
                "id": transaction_id,
                "item_id": item_id,
                "buyer_id": buyer_id,
                "seller_id": item["seller_id"],
                "amount": amount,
                "transaction_type": "purchase",
                "status": "completed",
                "metadata": {},
                "created_at": now
            }
            
            self.mock_transactions[transaction_id] = transaction
            item["transactions"].append(transaction)
            return transaction
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_review(
        self,
        item_id: str,
        reviewer_id: str,
        rating: int,
        review_text: Optional[str] = None
    ) -> Optional[Dict]:
        """Create a review for a marketplace item"""
        if self.mode == "mock":
            item = self.mock_items.get(item_id)
            if not item:
                return None
            
            review_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            review = {
                "id": review_id,
                "item_id": item_id,
                "reviewer_id": reviewer_id,
                "rating": rating,
                "review_text": review_text,
                "helpful_count": 0,
                "created_at": now
            }
            
            self.mock_reviews[review_id] = review
            item["reviews"].append(review)
            return review
        else:
            raise NotImplementedError("Prod mode not implemented yet")
