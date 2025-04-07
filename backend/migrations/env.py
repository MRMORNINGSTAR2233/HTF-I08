from logging.config import fileConfig
from urllib.parse import urlparse
import json

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import your models here
from app.db.session import Base
from app.models import user, database
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Fix for 'postgres://' vs 'postgresql://' in connection strings
database_url = settings.DATABASE_URL
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

# Set the SQLAlchemy URL from our settings
config.set_main_option("sqlalchemy.url", database_url)

# Check if we're using Neon PostgreSQL
parsed_url = urlparse(database_url)
is_neon_db = "neon.tech" in parsed_url.netloc

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context_opts = {"url": url}
    
    if is_neon_db:
        context_opts["dialect_opts"] = {"connect_args": {"sslmode": "require"}}
    
    context.configure(
        target_metadata=target_metadata,
        literal_binds=True,
        **context_opts
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    cfg = config.get_section(config.config_ini_section)
    
    if is_neon_db:
        cfg["sqlalchemy.connect_args"] = {"sslmode": "require"}
    
    connectable = engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
