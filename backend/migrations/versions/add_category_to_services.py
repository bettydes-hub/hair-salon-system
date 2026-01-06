"""Add category field to services

Revision ID: a1b2c3d4e5f6
Revises: 3939abb5f84d
Create Date: 2026-01-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '3939abb5f84d'
branch_labels = None
depends_on = None


def upgrade():
    # Add category column as nullable (existing services won't have a category)
    with op.batch_alter_table('services', schema=None) as batch_op:
        batch_op.add_column(sa.Column('category', sa.String(length=100), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # Remove category column
    with op.batch_alter_table('services', schema=None) as batch_op:
        batch_op.drop_column('category')

    # ### end Alembic commands ###

