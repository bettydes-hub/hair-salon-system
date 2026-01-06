"""add email verification and reset fields to users

Revision ID: add_email_verification_fields
Revises: 2658b13a1641
Create Date: 2026-02-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import Boolean

# revision identifiers, used by Alembic.
revision = 'add_email_verification_fields'
down_revision = '2658b13a1641'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
        batch_op.add_column(sa.Column('verification_code', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('verification_expires_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('reset_code', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('reset_expires_at', sa.DateTime(), nullable=True))

    # Set existing users to verified so they are not locked out
    users_table = table('users', column('email_verified', Boolean))
    op.execute(users_table.update().values(email_verified=True))


def downgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('reset_expires_at')
        batch_op.drop_column('reset_code')
        batch_op.drop_column('verification_expires_at')
        batch_op.drop_column('verification_code')
        batch_op.drop_column('email_verified')

