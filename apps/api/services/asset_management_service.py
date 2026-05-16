import os
import uuid
from datetime import datetime
from typing import Optional, Dict, List

class AssetManagementService:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mock_assets = {}
        self.mock_tags = {}
        self.mock_collections = {}
        self.mock_collection_assets = {}
        
    async def upload_asset(
        self, 
        user_id: str, 
        filename: str,
        file_url: str,
        file_type: str,
        file_size: int,
        metadata: Dict = None
    ) -> Dict:
        """Upload a new asset"""
        asset_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        asset = {
            "id": asset_id,
            "user_id": user_id,
            "filename": filename,
            "file_url": file_url,
            "file_type": file_type,
            "file_size": file_size,
            "metadata": metadata or {},
            "created_at": now,
            "updated_at": now,
            "tags": []
        }
        
        if self.mode == "mock":
            self.mock_assets[asset_id] = asset
            return asset
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def get_assets(
        self, 
        user_id: str, 
        file_type: Optional[str] = None,
        tag: Optional[str] = None
    ) -> List[Dict]:
        """Get all assets for a user, optionally filtered"""
        if self.mode == "mock":
            assets = list(self.mock_assets.values())
            # Filter by user_id
            assets = [a for a in assets if a["user_id"] == user_id]
            # Filter by file_type
            if file_type:
                assets = [a for a in assets if a["file_type"] == file_type]
            # Filter by tag
            if tag:
                assets = [a for a in assets if any(t["tag"] == tag for t in a.get("tags", []))]
            return assets
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def add_tag_to_asset(self, asset_id: str, tag: str) -> Optional[Dict]:
        """Add a tag to an asset"""
        if self.mode == "mock":
            asset = self.mock_assets.get(asset_id)
            if not asset:
                return None
            tag_id = str(uuid.uuid4())
            tag_obj = {"id": tag_id, "asset_id": asset_id, "tag": tag, "created_at": datetime.utcnow().isoformat()}
            self.mock_tags[tag_id] = tag_obj
            asset["tags"].append(tag_obj)
            return tag_obj
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def create_collection(
        self, 
        user_id: str, 
        name: str, 
        description: Optional[str] = None
    ) -> Dict:
        """Create a new asset collection"""
        collection_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        collection = {
            "id": collection_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "created_at": now,
            "updated_at": now,
            "assets": []
        }
        
        if self.mode == "mock":
            self.mock_collections[collection_id] = collection
            return collection
        else:
            raise NotImplementedError("Prod mode not implemented yet")
    
    async def add_asset_to_collection(self, collection_id: str, asset_id: str) -> bool:
        """Add an asset to a collection"""
        if self.mode == "mock":
            collection = self.mock_collections.get(collection_id)
            asset = self.mock_assets.get(asset_id)
            if not collection or not asset:
                return False
            if any(a["id"] == asset_id for a in collection["assets"]):
                return True  # Already added
            collection["assets"].append(asset)
            return True
        else:
            raise NotImplementedError("Prod mode not implemented yet")
