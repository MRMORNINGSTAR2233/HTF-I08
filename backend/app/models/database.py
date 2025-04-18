from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base

class DatabaseType(enum.Enum):
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    CSV = "csv"
    EXCEL = "excel"

class DatabaseConfig(Base):
    __tablename__ = "database_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    db_type = Column(String, nullable=False)
    host = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    database_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)  # For CSV and Excel files
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", backref="database_configs")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @property
    def connection_string(self) -> str:
        """Generate a connection string from the database configuration fields"""
        if self.db_type == 'mysql':
            return f"mysql+pymysql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database_name}"
        elif self.db_type == 'postgresql':
            return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database_name}"
        else:
            # For CSV/Excel files, we don't have a connection string
            # This should be handled separately in the application code
            return None