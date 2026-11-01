"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-31 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'farmers',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('phone', sa.String(length=32), nullable=False),
        sa.Column('village', sa.String(length=128), nullable=False),
        sa.Column('district', sa.String(length=128), nullable=False),
        sa.Column('state', sa.String(length=128), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('crop', sa.String(length=64), nullable=False),
        sa.Column('growth_stage', sa.String(length=64), nullable=False),
        sa.Column('farm_area', sa.Float(), nullable=False),
        sa.Column('area_unit', sa.String(length=32), default='Acres'),
        sa.Column('soil_type', sa.String(length=64), nullable=False),
        sa.Column('sowing_date', sa.String(length=32), nullable=True),
        sa.Column('irrigation_method', sa.String(length=64), default='Tube Well / Borewell'),
        sa.Column('preferred_language', sa.String(length=8), default='hi'),
        sa.Column('preferred_calling_window', sa.String(length=64), default='Morning (07:00 - 09:00)'),
        sa.Column('consent_for_calls', sa.Boolean(), default=False, nullable=False),
        sa.Column('consent_timestamp', sa.DateTime(), nullable=True),
        sa.Column('last_call_timestamp', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    op.create_table(
        'call_records',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('farmer_id', sa.String(length=64), sa.ForeignKey('farmers.id'), nullable=False),
        sa.Column('phone', sa.String(length=32), nullable=False),
        sa.Column('call_type', sa.String(length=32), default='CRITICAL_ALERT'),
        sa.Column('status', sa.String(length=32), default='IN_PROGRESS'),
        sa.Column('start_time', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), default=0),
        sa.Column('is_demo', sa.Boolean(), default=True),
        sa.Column('trigger_reason', sa.Text(), nullable=False),
        sa.Column('ai_briefing_en', sa.Text(), nullable=True),
        sa.Column('ai_briefing_hi', sa.Text(), nullable=True),
        sa.Column('transcript_json', sa.JSON(), nullable=True),
        sa.Column('telephony_provider', sa.String(length=64), default='Demo Voice Synthesizer'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

def downgrade() -> None:
    op.drop_table('call_records')
    op.drop_table('farmers')
