"""Add image_url field to services

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-01-05 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add image_url column as nullable (existing services won't have images)
    with op.batch_alter_table('services', schema=None) as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # Remove image_url column
    with op.batch_alter_table('services', schema=None) as batch_op:
        batch_op.drop_column('image_url')

    # ### end Alembic commands ###

