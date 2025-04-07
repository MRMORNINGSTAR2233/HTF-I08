import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class ConfigType(str, enum.Enum):
    DATABASE = "database"
    FILE = "file"

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    config_id = Column(Integer, ForeignKey("database_configs.id", ondelete="CASCADE"))
    conversation = Column(JSON, nullable=True, default=list)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    config_type = Column(String, nullable=False, server_default=ConfigType.DATABASE)
    
    # Relations
    config = relationship("DatabaseConfig", backref="chats")
    user = relationship("User", backref="chats")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
