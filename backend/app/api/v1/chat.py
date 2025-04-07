from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.chat import Chat
from app.schemas.chat import ChatCreate, ChatUpdate, ChatInDB, Message
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ChatInDB)
def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_chat = Chat(
        name=chat.name,
        config_id=chat.config_id,
        user_id=current_user.id,
        conversation=[]
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@router.get("/{chat_id}", response_model=ChatInDB)
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.put("/{chat_id}/message", response_model=ChatInDB)
def add_message(
    chat_id: int,
    message: Message,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    message.timestamp = datetime.now()
    if not chat.conversation:
        chat.conversation = []
    chat.conversation.append(message.model_dump())
    
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/", response_model=List[ChatInDB])
def list_chats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Chat).filter(Chat.user_id == current_user.id).all()
