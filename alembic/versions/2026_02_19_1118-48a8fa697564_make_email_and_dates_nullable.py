"""make_email_and_dates_nullable

Revision ID: 48a8fa697564
Revises: 5f71a7901b6f
Create Date: 2026-02-19 11:18:45.322359

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '48a8fa697564'
down_revision = '5f71a7901b6f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite는 ALTER COLUMN을 지원하지 않으므로 batch_alter_table 사용
    with op.batch_alter_table('instructors') as batch_op:
        batch_op.alter_column('email',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=True)
        batch_op.alter_column('hire_date',
                              existing_type=sa.DATE(),
                              nullable=True)

    with op.batch_alter_table('students') as batch_op:
        batch_op.alter_column('email',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=True)
        batch_op.alter_column('enrollment_date',
                              existing_type=sa.DATE(),
                              nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('students') as batch_op:
        batch_op.alter_column('enrollment_date',
                              existing_type=sa.DATE(),
                              nullable=False)
        batch_op.alter_column('email',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=False)

    with op.batch_alter_table('instructors') as batch_op:
        batch_op.alter_column('hire_date',
                              existing_type=sa.DATE(),
                              nullable=False)
        batch_op.alter_column('email',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=False)
