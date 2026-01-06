"""Add profile_photo_url field to users

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-01-05 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    # Add profile_photo_url column as nullable (existing users won't have photos)
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_photo_url', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # Remove profile_photo_url column
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('profile_photo_url')

    # ### end Alembic commands ###

