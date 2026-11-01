"""
Pydantic v2 schemas for KrishiSaathi AI requests and responses.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class FarmerCreate(BaseModel):
    name: str
    phone: str
    village: str
    district: str
    state: str
    latitude: float
    longitude: float
    crop: str
    growth_stage: str
    farm_area: float
    area_unit: str = "Acres"
    soil_type: str
    sowing_date: Optional[str] = None
    irrigation_method: str = "Tube Well / Borewell"
    preferred_language: str = "hi"
    preferred_calling_window: str = "Morning (07:00 - 09:00)"
    consent_for_calls: bool = False

class FarmerResponse(FarmerCreate):
    id: str
    consent_timestamp: Optional[datetime] = None
    last_call_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CallDispatchRequest(BaseModel):
    farmer_id: str
    call_type: str = "CRITICAL_ALERT"
    alert_reason: Optional[str] = None
    is_demo: bool = True

class CallTurn(BaseModel):
    speaker: str
    textEn: str
    textHi: str
    timestamp: str

class AdvisorChatRequest(BaseModel):
    message: str
    farmer_id: Optional[str] = None
    language: str = "en"
    environmental_context: Optional[Dict[str, Any]] = None

class SimulatorRequest(BaseModel):
    crop: str
    growth_stage: str
    delta_temp_c: float
    delta_rainfall_percent: float
    soil_moisture_level: float
