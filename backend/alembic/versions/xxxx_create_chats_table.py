"""create chats table

Revision ID: xxxx
Revises: 6ff2bd78aeb3
Create Date: 2024-04-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'xxxx'  # alembic will replace this
down_revision = '6ff2bd78aeb3'  # replace with your last migration
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'chats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('conversation', sa.JSON(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('config_type', sa.String(), nullable=False, server_default='database'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['config_id'], ['database_configs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chats_id'), 'chats', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_chats_id'), table_name='chats')
    op.drop_table('chats')
