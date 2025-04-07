from pydantic import BaseModel, Field
from typing import Optional, Union, Literal
from datetime import datetime

# Database configuration schemas
class DatabaseConfigBase(BaseModel):
    name: str
    db_type: Literal["mysql", "postgresql", "csv", "excel"]


class DatabaseConfigCreate(DatabaseConfigBase):
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None
    file_path: Optional[str] = None


class DatabaseConfigUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None
    file_path: Optional[str] = None


class DatabaseConfigInDB(DatabaseConfigBase):
    id: int
    user_id: int
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    database_name: Optional[str] = None
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DatabaseConfig(DatabaseConfigInDB):
    pass


# Query execution schema
class QueryRequest(BaseModel):
    db_config_id: int
    query: str


class QueryResponse(BaseModel):
    results: list
    columns: list[str]
    execution_time: float