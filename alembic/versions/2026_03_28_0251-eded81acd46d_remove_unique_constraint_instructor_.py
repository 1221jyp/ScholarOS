"""remove_unique_constraint_instructor_work_date

Revision ID: eded81acd46d
Revises: a1b2c3d4e5f6
Create Date: 2026-03-28 02:51:43.784670

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eded81acd46d'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint('uix_instructor_work_date', 'instructor_time_records', type_='unique')


def downgrade() -> None:
    op.create_unique_constraint(
        'uix_instructor_work_date',
        'instructor_time_records',
        ['instructor_id', 'work_date']
    )
