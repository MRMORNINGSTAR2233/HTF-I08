from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse

from app.core.config import settings

# Parse connection URL
database_url = settings.DATABASE_URL

# Fix for 'postgres://' vs 'postgresql://' in connection strings
# Neon DB and other services often use 'postgres://', but SQLAlchemy requires 'postgresql://'
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

parsed_url = urlparse(database_url)
is_neon_db = "neon.tech" in parsed_url.netloc

# Create SQLAlchemy engine with SSL options for Neon if needed
if is_neon_db:
    # Neon PostgreSQL requires SSL
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        connect_args={"sslmode": "require"}
    )
else:
    # Standard connection for local development
    engine = create_engine(database_url, pool_pre_ping=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()