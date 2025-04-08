from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class MessageBase(BaseModel):
    content: str

class MessageResponse(MessageBase):
    role: str
    content: Dict[str, Any]  # For storing query, result, data
    timestamp: datetime

class MessageCreate(MessageBase):
    pass

class ChatCreate(BaseModel):
    name: str
    config_id: int
    config_type: str

class ChatResponse(BaseModel):
    id: int
    name: str
    config_id: int
    config_type: str
    conversation: List[MessageResponse]  # Changed to use MessageResponse
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
