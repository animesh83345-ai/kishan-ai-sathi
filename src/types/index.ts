/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'hi';

export type CropType = 
  | 'Wheat' 
  | 'Rice (Paddy)' 
  | 'Maize' 
  | 'Pulses (Chickpea/Moong)' 
  | 'Sugarcane' 
  | 'Cotton' 
  | 'Mustard' 
  | 'Vegetables (Tomato/Onion)'
  | 'Soybean'
  | 'Groundnut';

export type GrowthStage = 
  | 'Sowing / Germination' 
  | 'Vegetative Stage' 
  | 'Flowering / Tasseling' 
  | 'Grain / Fruit Formation' 
  | 'Ripening / Maturity' 
  | 'Harvesting Ready';

export type SoilType = 
  | 'Alluvial Soil' 
  | 'Black Cotton Soil (Regur)' 
  | 'Red and Yellow Soil' 
  | 'Sandy Loam Soil' 
  | 'Clayey Soil' 
  | 'Laterite Soil';

export type IrrigationMethod = 
  | 'Drip Irrigation' 
  | 'Sprinkler Irrigation' 
  | 'Canal / Flood Irrigation' 
  | 'Tube Well / Borewell' 
  | 'Rainfed (No Irrigation)';

export type CallingWindow = 
  | 'Morning (07:00 - 09:00)' 
  | 'Afternoon (12:00 - 14:00)' 
  | 'Evening (17:00 - 19:30)';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  crop: CropType;
  growthStage: GrowthStage;
  farmArea: number;
  areaUnit: 'Acres' | 'Hectares' | 'Bigha';
  soilType: SoilType;
  sowingDate: string;
  irrigationMethod: IrrigationMethod;
  preferredLanguage: Language;
  preferredCallingWindow: CallingWindow;
  consentForCalls: boolean;
  consentTimestamp: string;
  avatarSeed?: string;
  lastCallTimestamp?: string;
}

export interface NASAObservation {
  latitude: number;
  longitude: number;
  date: string;
  temperatureMax: number; // °C (T2M_MAX)
  temperatureMin: number; // °C (T2M_MIN)
  temperatureMean: number; // °C (T2M)
  precipitation24h: number; // mm (PRECTOTCORR)
  precipitation7d: number; // mm 7-day cumulative
  precipitationAnomaly: number; // % deviation from normal
  relativeHumidity: number; // % (RH2M)
  solarRadiation: number; // MJ/m^2/day (ALLSKY_SFC_SW_DWN)
  rootZoneSoilMoisture: number; // 0.0 - 1.0 (GWETROOT / SMAP L4)
  surfaceSoilMoisture: number; // 0.0 - 1.0 (GWETTOP / SMAP L3)
  ndvi: number; // Normalized Difference Vegetation Index (MODIS MOD13A2: 0.1 to 0.85)
  vaporPressureDeficit: number; // kPa
  dewPoint: number; // °C
  dataSource: string;
  dataQuality: 'Validated Satellite Observation' | 'Reanalysis Calibrated' | 'Realtime Near-Earth Stream';
  cached: boolean;
  datasetLimitations: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactor {
  name: string;
  level: RiskLevel;
  score: number; // 0 to 100
  metricValue: string;
  thresholdValue: string;
  impactSummary: string;
  scientificExplanation: string;
}

export interface RiskAssessment {
  overallRiskLevel: RiskLevel;
  overallScore: number;
  assessmentTimestamp: string;
  cropEvaluated: CropType;
  cropStage: GrowthStage;
  factors: {
    heatStress: RiskFactor;
    droughtRisk: RiskFactor;
    excessRainfall: RiskFactor;
    soilMoistureDeficit: RiskFactor;
    pestDiseaseFungal: RiskFactor;
  };
  recommendedActions: {
    urgency: 'IMMEDIATE' | 'NEXT_48_HOURS' | 'SEASONAL';
    category: 'Irrigation' | 'Nutrient' | 'Crop Protection' | 'Harvesting';
    actionEn: string;
    actionHi: string;
  }[];
  auditTrail: {
    ruleTriggered: string;
    datasetUsed: string;
    observationTime: string;
    confidence: string;
  }[];
  uncertaintyNotes: string;
}

export type CallStatus = 'QUEUED' | 'RINGING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER' | 'STATUS_UNKNOWN' | 'SCHEDULED';
export type CallType = 'CRITICAL_ALERT' | 'WEEKLY_ADVISORY' | 'MANUAL_OUTREACH' | 'SIMULATED_TEST';

export interface CallTurn {
  speaker: 'AI' | 'FARMER';
  textEn: string;
  textHi: string;
  timestamp: string;
}

export interface CallRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  phone: string;
  district: string;
  state: string;
  crop: CropType;
  callType: CallType;
  status: CallStatus;
  providerCallId?: string;
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
  isDemo: boolean;
  triggerReason: string;
  transcript: CallTurn[];
  aiBriefingEn: string;
  aiBriefingHi: string;
  telephonyProvider: 'Demo Voice Synthesizer' | 'Exotel AgentStream';
  failureReason?: string;
}

export interface ClimateScenarioInput {
  crop: CropType;
  growthStage: GrowthStage;
  deltaTempC: number; // e.g. -4 to +8
  deltaRainfallPercent: number; // e.g. -60% to +80%
  soilMoistureLevel: number; // 10% to 90%
}

export interface ClimateScenarioResult {
  heatRiskShift: { from: RiskLevel; to: RiskLevel; deltaScore: number };
  droughtRiskShift: { from: RiskLevel; to: RiskLevel; deltaScore: number };
  waterloggingShift: { from: RiskLevel; to: RiskLevel; deltaScore: number };
  estimatedYieldImpact: number; // percentage change: e.g. -18% or +4%
  adaptationMeasures: string[];
  simulationNote: string;
}

export interface WeatherForecastSummary {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
  source: 'Open-Meteo';
  attribution: string;
  fetchedAt: string;
}
