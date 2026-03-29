"""Add approval fields to instructor_time_records

Revision ID: a1b2c3d4e5f6
Revises: fae5c7a048a3
Create Date: 2026-03-10 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = 'fae5c7a048a3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('instructor_time_records',
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default=sa.text('false'), comment='원장 승인(정산) 여부')
    )
    op.add_column('instructor_time_records',
        sa.Column('approved_at', sa.DateTime(), nullable=True, comment='승인 일시')
    )


def downgrade() -> None:
    op.drop_column('instructor_time_records', 'approved_at')
    op.drop_column('instructor_time_records', 'is_approved')
