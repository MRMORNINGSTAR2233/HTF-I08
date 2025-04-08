from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = None

class ChatCreate(BaseModel):
    name: str
    config_id: int
    config_type: Optional[str] = "DATABASE"

class ChatUpdate(BaseModel):
    name: Optional[str] = None
    conversation: Optional[List[Message]] = None

class ChatInDB(ChatCreate):
    id: int
    user_id: int
    conversation: List[Message]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
