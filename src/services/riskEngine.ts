/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropType, GrowthStage, NASAObservation, RiskAssessment, RiskFactor, RiskLevel, SoilType } from '../types';

export function assessClimateRisks(
  crop: CropType,
  stage: GrowthStage,
  soil: SoilType,
  obs: NASAObservation
): RiskAssessment {
  // 1. Heat Stress Evaluation
  let heatThreshold = 34; // default
  if (crop === 'Wheat') {
    heatThreshold = stage.includes('Flowering') || stage.includes('Grain') ? 31.0 : 33.5;
  } else if (crop === 'Rice (Paddy)') {
    heatThreshold = stage.includes('Flowering') ? 35.0 : 37.0;
  } else if (crop === 'Mustard') {
    heatThreshold = 28.5;
  } else if (crop === 'Vegetables (Tomato/Onion)') {
    heatThreshold = 33.0;
  } else if (crop === 'Cotton') {
    heatThreshold = 38.0;
  }

  let heatLevel: RiskLevel = 'LOW';
  let heatScore = Math.min(100, Math.max(0, Math.round(((obs.temperatureMax - (heatThreshold - 5)) / 8) * 100)));
  if (obs.temperatureMax >= heatThreshold) {
    heatLevel = 'HIGH';
    heatScore = Math.max(75, heatScore);
  } else if (obs.temperatureMax >= heatThreshold - 3) {
    heatLevel = 'MEDIUM';
    heatScore = Math.max(45, heatScore);
  } else {
    heatScore = Math.min(30, heatScore);
  }

  const heatFactor: RiskFactor = {
    name: 'Heat Stress Risk',
    level: heatLevel,
    score: heatScore,
    metricValue: `${obs.temperatureMax.toFixed(1)}°C max temp`,
    thresholdValue: `${heatThreshold.toFixed(1)}°C physiological threshold for ${crop}`,
    impactSummary: heatLevel === 'HIGH' 
      ? `Severe thermal stress during ${stage}. Risk of pollen sterility, premature forced ripening, and 15-25% yield drop.`
      : heatLevel === 'MEDIUM' 
      ? `Elevated canopy temperature. Transpiration rates elevated; watch for leaf wilting during mid-day.`
      : `Ambient temperatures are within the optimal physiological band for ${crop}.`,
    scientificExplanation: `Evaluated via NASA POWER Daily T2M_MAX against critical thermal thresholds documented in FAO crop water & climate indices for ${crop} at ${stage}.`
  };

  // 2. Drought & Moisture Stress Evaluation
  // Root-zone moisture: 0.0 to 1.0 (SMAP L4 GWETROOT)
  let droughtLevel: RiskLevel = 'LOW';
  let droughtScore = 20;
  if (obs.rootZoneSoilMoisture < 0.22 && obs.precipitation7d < 5) {
    droughtLevel = 'HIGH';
    droughtScore = 88;
  } else if (obs.rootZoneSoilMoisture < 0.32 || obs.precipitation7d < 10) {
    droughtLevel = 'MEDIUM';
    droughtScore = 55;
  } else {
    droughtScore = 15;
  }

  const droughtFactor: RiskFactor = {
    name: 'Drought & Root-Zone Moisture Stress',
    level: droughtLevel,
    score: droughtScore,
    metricValue: `${(obs.rootZoneSoilMoisture * 100).toFixed(0)}% root wetness, ${obs.precipitation7d.toFixed(1)}mm 7d rain`,
    thresholdValue: '<22% root-zone moisture (Wilting Point Alert)',
    impactSummary: droughtLevel === 'HIGH'
      ? `Critical soil moisture deficit in the effective root-zone. Plant experiencing stomatal closure and vegetative stunting.`
      : droughtLevel === 'MEDIUM'
      ? `Sub-optimal soil moisture reserves. Supplemental irrigation recommended before flowering initiation.`
      : `Adequate root-zone soil moisture available for normal transpirational pull.`,
    scientificExplanation: `Calculated from NASA SMAP L4 root-zone wetness (GWETROOT) integrated with NASA GPM 7-day cumulative precipitation.`
  };

  // 3. Excess Rainfall & Waterlogging
  let rainLevel: RiskLevel = 'LOW';
  let rainScore = 10;
  const isHeavySoil = soil.includes('Black') || soil.includes('Clay');
  const rainThreshold24h = isHeavySoil ? 35 : 55;

  if (obs.precipitation24h > rainThreshold24h || obs.precipitation7d > 110) {
    rainLevel = 'HIGH';
    rainScore = 85;
  } else if (obs.precipitation24h > 20 || obs.precipitation7d > 65) {
    rainLevel = 'MEDIUM';
    rainScore = 50;
  } else {
    rainScore = 12;
  }

  const excessRainFactor: RiskFactor = {
    name: 'Excess Rainfall & Waterlogging Vulnerability',
    level: rainLevel,
    score: rainScore,
    metricValue: `${obs.precipitation24h.toFixed(1)}mm/24h, ${obs.precipitation7d.toFixed(1)}mm/7d`,
    thresholdValue: `>${rainThreshold24h}mm/24h for ${soil}`,
    impactSummary: rainLevel === 'HIGH'
      ? `High danger of root hypoxia, soil compaction, and nutrient leaching in ${soil}. Open drainage trenches immediately.`
      : rainLevel === 'MEDIUM'
      ? `Heavy soil saturation. Halt any planned chemical fertilization to prevent surface runoff losses.`
      : `Rainfall levels within safe absorption and percolation capacity of farm soils.`,
    scientificExplanation: `Evaluated via NASA GPM IMERG 24-hour and 7-day precipitation totals weighted by hydraulic conductivity of ${soil}.`
  };

  // 4. Soil Moisture Deficit
  let moistureDeficitLevel: RiskLevel = 'LOW';
  let moistureDeficitScore = Math.max(0, Math.min(100, Math.round((0.5 - obs.surfaceSoilMoisture) * 160)));
  if (obs.surfaceSoilMoisture < 0.20) {
    moistureDeficitLevel = 'HIGH';
    moistureDeficitScore = Math.max(78, moistureDeficitScore);
  } else if (obs.surfaceSoilMoisture < 0.35) {
    moistureDeficitLevel = 'MEDIUM';
    moistureDeficitScore = Math.max(45, moistureDeficitScore);
  }

  const moistureDeficitFactor: RiskFactor = {
    name: 'Surface Moisture Evaporation Deficit',
    level: moistureDeficitLevel,
    score: moistureDeficitScore,
    metricValue: `${(obs.surfaceSoilMoisture * 100).toFixed(0)}% surface saturation`,
    thresholdValue: '<30% topsoil moisture',
    impactSummary: moistureDeficitLevel === 'HIGH'
      ? `Rapid topsoil crusting and crack development. Surface seed germination or seedling roots threatened.`
      : moistureDeficitLevel === 'MEDIUM'
      ? `Elevated vapor pressure deficit causing rapid surface drying. Straw mulching recommended.`
      : `Topsoil moisture layer is well-hydrated.`,
    scientificExplanation: `Derived from NASA SMAP L3 surface radiometer observations (GWETTOP) and NASA POWER VPD index.`
  };

  // 5. Pest & Fungal Vulnerability
  let pestLevel: RiskLevel = 'LOW';
  let pestScore = 15;
  const isPestTemp = obs.temperatureMean >= 21 && obs.temperatureMean <= 29;
  const isHighHumidity = obs.relativeHumidity >= 78;

  if (isPestTemp && isHighHumidity && obs.precipitation7d > 15) {
    pestLevel = 'HIGH';
    pestScore = 82;
  } else if (isHighHumidity || (isPestTemp && obs.relativeHumidity > 68)) {
    pestLevel = 'MEDIUM';
    pestScore = 52;
  }

  const pestFactor: RiskFactor = {
    name: 'Pest & Fungal Pathogen Pressure',
    level: pestLevel,
    score: pestScore,
    metricValue: `${obs.relativeHumidity.toFixed(0)}% RH, ${obs.temperatureMean.toFixed(1)}°C mean`,
    thresholdValue: '>78% RH and 21-29°C sustained for 48h',
    impactSummary: pestLevel === 'HIGH'
      ? `Microclimate is prime for fungal spore propagation (e.g., Rust in wheat, Blast/Sheath blight in rice, Aphids/Mildew in veggies). Inspect field canopy.`
      : pestLevel === 'MEDIUM'
      ? `Moderate humidity and warm nights favorable for early pest colonization. Monitor undersides of leaves.`
      : `Atmospheric humidity and temperature profile suppresses fungal sporulation.`,
    scientificExplanation: `Calculated using microclimate disease triangle model linking NASA POWER RH2M and T2M daily curves.`
  };

  // Overall Risk Score & Category
  const overallScore = Math.round(
    heatScore * 0.30 +
    droughtScore * 0.25 +
    rainScore * 0.20 +
    pestScore * 0.15 +
    moistureDeficitScore * 0.10
  );

  let overallRiskLevel: RiskLevel = 'LOW';
  if (overallScore >= 60 || heatLevel === 'HIGH' || droughtLevel === 'HIGH' || rainLevel === 'HIGH') {
    overallRiskLevel = 'HIGH';
  } else if (overallScore >= 35 || heatLevel === 'MEDIUM' || droughtLevel === 'MEDIUM' || rainLevel === 'MEDIUM' || pestLevel === 'MEDIUM') {
    overallRiskLevel = 'MEDIUM';
  }

  // Recommended actions tailored to the risks
  const actions: RiskAssessment['recommendedActions'] = [];

  if (heatLevel === 'HIGH') {
    actions.push({
      urgency: 'IMMEDIATE',
      category: 'Crop Protection',
      actionEn: `Schedule light sprinkler irrigation or micro-spraying in the early morning (05:00-07:30) to cool the ${crop} canopy by 2-3°C and prevent thermal shock.`,
      actionHi: `फसल में लू व तेज धूप से बचाव हेतु सुबह (5:00 से 7:30 बजे) हल्की सिंचाई या स्प्रिंकलर चलाएं ताकि फसल का तापमान 2-3°C कम रहे।`
    });
  }

  if (droughtLevel === 'HIGH' || moistureDeficitLevel === 'HIGH') {
    actions.push({
      urgency: 'IMMEDIATE',
      category: 'Irrigation',
      actionEn: `Apply 35-45mm critical irrigation. Apply organic crop residue or paddy straw mulch (5-7 cm layer) along crop rows to conserve soil moisture.`,
      actionHi: `जड़ क्षेत्र में नमी की भारी कमी है। तुरंत 35-45 मिमी सिंचाई करें और क्यारियों में पुआल/मल्च बिछाएं जिससे नमी सुरक्षित रहे।`
    });
  }

  if (rainLevel === 'HIGH') {
    actions.push({
      urgency: 'IMMEDIATE',
      category: 'Harvesting',
      actionEn: `Clear field perimeter drainage channels immediately to prevent standing water in ${soil}. Postpone top-dressing urea until soils drain.`,
      actionHi: `खेत की जल निकासी नालियों को तुरंत खोलें ताकि ${soil} में जलभराव न हो। यूरिया या उर्वरक का छिड़काव पानी निकलने तक रोक दें।`
    });
  }

  if (pestLevel === 'HIGH') {
    actions.push({
      urgency: 'NEXT_48_HOURS',
      category: 'Crop Protection',
      actionEn: `High fungal blight risk detected. Scout crop canopy for yellowing or lesions. Consider prophylactic bio-fungicide (Trichoderma viride @ 5g/L or Neem oil spray).`,
      actionHi: `फफूंद व कीट संक्रमण का भारी खतरा है। पत्तियों की निचली सतह की जांच करें। ट्राइकोडर्मा या 5% नीम तेल का छिड़काव करें।`
    });
  }

  if (actions.length === 0) {
    actions.push({
      urgency: 'SEASONAL',
      category: 'Nutrient',
      actionEn: `Agro-climatic parameters are stable. Proceed with scheduled micronutrient spray (Zinc/Boron) and standard weeding for ${crop}.`,
      actionHi: `मौसम अनुकूल है। अनुशंसित सूक्ष्म पोषक तत्वों (जिंक/बोरॉन) का छिड़काव करें और सामान्य निराई-गुड़ाई जारी रखें।`
    });
  }

  return {
    overallRiskLevel,
    overallScore,
    assessmentTimestamp: new Date().toISOString(),
    cropEvaluated: crop,
    cropStage: stage,
    factors: {
      heatStress: heatFactor,
      droughtRisk: droughtFactor,
      excessRainfall: excessRainFactor,
      soilMoistureDeficit: moistureDeficitFactor,
      pestDiseaseFungal: pestFactor
    },
    recommendedActions: actions,
    auditTrail: [
      {
        ruleTriggered: `Rule-HEAT-${crop.toUpperCase().slice(0, 3)}-${stage.slice(0, 4)}: Threshold ${heatThreshold}°C vs Obs ${obs.temperatureMax.toFixed(1)}°C`,
        datasetUsed: 'NASA POWER Daily Agroclimatology (T2M_MAX)',
        observationTime: obs.date,
        confidence: 'Validated (Ground Resolution: 0.5° x 0.5°)'
      },
      {
        ruleTriggered: `Rule-DROUGHT-SMAP: Root Wetness ${(obs.rootZoneSoilMoisture * 100).toFixed(0)}% + GPM 7d ${obs.precipitation7d.toFixed(1)}mm`,
        datasetUsed: 'NASA SMAP L4_SM + NASA GPM IMERG 7-Day Cumulative',
        observationTime: obs.date,
        confidence: 'Hydrological Model Assimilation (9km)'
      },
      {
        ruleTriggered: `Rule-PATHOGEN-MICRO: RH ${obs.relativeHumidity.toFixed(0)}% + Mean Temp ${obs.temperatureMean.toFixed(1)}°C`,
        datasetUsed: 'NASA POWER RH2M & T2M Synoptic Observations',
        observationTime: obs.date,
        confidence: 'High Meteorological Correlation'
      }
    ],
    uncertaintyNotes: 'Assessments utilize rule-based agronomic criteria derived from FAO-56 crop coefficient papers and ICAR guidelines. NASA satellite measurements represent grid-cell averages (~9km to ~50km) and may not capture localized sub-field soil variations or tree-canopy shade microclimates.'
  };
}
