from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ConnectionInfo(BaseModel):
    host: str
    port: int

class PreviewData(BaseModel):
    columns: List[str]
    data_sample: List[Dict[str, Any]]
    total_rows: int
    data_types: Optional[Dict[str, str]] = None

class DataMetadata(BaseModel):
    source_type: str
    name: str
    database_type: Optional[str] = None
    database_name: Optional[str] = None
    file_type: Optional[str] = None
    connection_info: Optional[ConnectionInfo] = None
    schema: Optional[Dict[str, Any]] = None
    statistics: Optional[Dict[str, Any]] = None
    preview: PreviewData
