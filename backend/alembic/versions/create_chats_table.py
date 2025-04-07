"""create chats table

Revision ID: create_chats_v1
Revises: 6ff2bd78aeb3
Create Date: 2024-04-08
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'create_chats_v1'
down_revision = '6ff2bd78aeb3'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Drop existing chats table if it exists
    op.execute('DROP TABLE IF EXISTS chats CASCADE')
    
    op.create_table(
        'chats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('conversation', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('config_type', sa.String(), nullable=False, server_default=sa.text("'database'")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['config_id'], ['database_configs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_chats_id', 'chats', ['id'], unique=False)
    op.create_index('ix_chats_user_id', 'chats', ['user_id'], unique=False)
    op.create_index('ix_chats_config_id', 'chats', ['config_id'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_chats_config_id')
    op.drop_index('ix_chats_user_id')
    op.drop_index('ix_chats_id')
    op.drop_table('chats')
