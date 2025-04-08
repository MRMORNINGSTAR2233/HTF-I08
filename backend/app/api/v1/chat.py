from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...models.chat import Chat
from ...schemas.chat import ChatCreate, ChatResponse, MessageCreate
from ...services.chat_service import ChatService
from ...auth.deps import get_current_user
from ...api.deps import get_db

router = APIRouter()

chat_service = ChatService()

@router.post("/chats", response_model=ChatResponse)
async def create_chat(
    chat_create: ChatCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return chat_service.create_chat(
            db, 
            current_user.id, 
            chat_create.name, 
            chat_create.config_id,
            chat_create.config_type
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: int,
    message: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return await chat_service.query_data(db, chat_id, message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(
    chat_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.get("/chats", response_model=List[ChatResponse])
async def get_user_chats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all chats for the current user."""
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return chats

@router.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat by ID."""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    db.delete(chat)
    db.commit()
    
    return None
