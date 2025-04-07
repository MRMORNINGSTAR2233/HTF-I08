"""add config_type to chats

Revision ID: xxxx
Revises: <previous_revision_id>
Create Date: 2024-04-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'xxxx'  # alembic will replace this
down_revision = '<previous_revision_id>'  # replace with your last migration id
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create enum type
    op.execute("CREATE TYPE configtype AS ENUM ('database', 'file')")
    
    # Add column with NOT NULL constraint, default to 'database'
    op.add_column('chats', 
        sa.Column('config_type', 
            postgresql.ENUM('database', 'file', name='configtype'), 
            server_default='database', 
            nullable=False
        )
    )

def downgrade() -> None:
    op.drop_column('chats', 'config_type')
    op.execute("DROP TYPE configtype")
