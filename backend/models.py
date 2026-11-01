"""
SQLAlchemy database models for KrishiSaathi AI.
"""
from datetime import datetime
from sqlalchemy import (
    Column, 
    String, 
    Integer, 
    Float, 
    Boolean, 
    DateTime, 
    Text, 
    ForeignKey, 
    JSON
)
from sqlalchemy.orm import relationship
from database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=False, index=True)
    village = Column(String(128), nullable=False)
    district = Column(String(128), nullable=False, index=True)
    state = Column(String(128), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Agronomic info
    crop = Column(String(64), nullable=False)
    growth_stage = Column(String(64), nullable=False)
    farm_area = Column(Float, nullable=False)
    area_unit = Column(String(32), default="Acres")
    soil_type = Column(String(64), nullable=False)
    sowing_date = Column(String(32), nullable=True)
    irrigation_method = Column(String(64), default="Tube Well / Borewell")

    # Communication & Compliance
    preferred_language = Column(String(8), default="hi")
    preferred_calling_window = Column(String(64), default="Morning (07:00 - 09:00)")
    consent_for_calls = Column(Boolean, default=False, nullable=False)
    consent_timestamp = Column(DateTime, nullable=True)
    last_call_timestamp = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    call_records = relationship("CallRecord", back_populates="farmer", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessmentRecord", back_populates="farmer", cascade="all, delete-orphan")

class EnvironmentalObservationRecord(Base):
    __tablename__ = "environmental_observations"

    id = Column(String(64), primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    observation_date = Column(String(32), nullable=False)
    temperature_max = Column(Float, nullable=False)
    temperature_min = Column(Float, nullable=False)
    temperature_mean = Column(Float, nullable=False)
    precipitation_24h = Column(Float, nullable=False)
    precipitation_7d = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    solar_radiation = Column(Float, nullable=False)
    root_zone_moisture = Column(Float, nullable=False)
    surface_moisture = Column(Float, nullable=False)
    ndvi = Column(Float, nullable=False)
    data_source = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskAssessmentRecord(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(64), primary_key=True, index=True)
    farmer_id = Column(String(64), ForeignKey("farmers.id"), nullable=False)
    overall_level = Column(String(16), nullable=False) # LOW, MEDIUM, HIGH
    overall_score = Column(Integer, nullable=False)
    heat_stress_level = Column(String(16), nullable=False)
    drought_level = Column(String(16), nullable=False)
    excess_rain_level = Column(String(16), nullable=False)
    pest_fungal_level = Column(String(16), nullable=False)
    factors_json = Column(JSON, nullable=False)
    recommendations_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="risk_assessments")

class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(String(64), primary_key=True, index=True)
    farmer_id = Column(String(64), ForeignKey("farmers.id"), nullable=False)
    phone = Column(String(32), nullable=False)
    call_type = Column(String(32), default="CRITICAL_ALERT")
    status = Column(String(32), default="IN_PROGRESS") # COMPLETED, RINGING, FAILED, NO_ANSWER
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    is_demo = Column(Boolean, default=True)
    trigger_reason = Column(Text, nullable=False)
    ai_briefing_en = Column(Text, nullable=True)
    ai_briefing_hi = Column(Text, nullable=True)
    transcript_json = Column(JSON, default=list)
    telephony_provider = Column(String(64), default="Demo Voice Synthesizer")
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="call_records")
