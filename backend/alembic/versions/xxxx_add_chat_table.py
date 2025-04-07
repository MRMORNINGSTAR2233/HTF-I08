"""add chat table

Revision ID: xxxx
Revises: previous_revision_id
Create Date: 2024-04-07 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision = 'xxxx'
down_revision = 'previous_revision_id'  # Replace with your last migration id
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'chats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('conversation', JSON, nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['config_id'], ['database_configs.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chats_id'), 'chats', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_chats_id'), table_name='chats')
    op.drop_table('chats')
