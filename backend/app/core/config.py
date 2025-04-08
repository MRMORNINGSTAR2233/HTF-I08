from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, validator, field_validator
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    CORS_ORIGINS: List[str] = []
    
    # Database settings
    DATABASE_URL: Optional[PostgresDsn] = os.getenv("DATABASE_URL")
    
    # OpenRouter API Key
    OR_API_KEY: str = os.getenv("OR_API_KEY", "")
    
    # Project name
    PROJECT_NAME: str = "Voi2Viz"

    # CORS settings validation
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
        
    class Config:
        case_sensitive = True
        env_file = ".env"
        
settings = Settings()