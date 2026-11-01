/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export const translations = {
  en: {
    appName: 'KrishiSaathi AI',
    tagline: 'Your Smart Farming Companion',
    heroSub: 'Empowering smallholder farmers across India with NASA-powered climate intelligence, real-time crop monitoring, and AI-guided advisories that support resilient farming decisions.',
    exploreDashboard: 'Explore Farm Dashboard',
    talkToAdvisor: 'Talk to AI Farming Advisor',
    startVoiceCall: 'Launch AI Voice Calling',
    simulatedModeBadge: 'Demo Calling Mode Available',
    realTelephonyBadge: 'Production Telephony Ready',
    
    // Nav
    navHome: 'Overview',
    navDashboard: 'Farm Dashboard',
    navMap: 'Satellite Map',
    navVoiceCalling: 'AI Voice Calling',
    navAdvisor: 'AI Advisor',
    navSimulator: 'Climate Simulator',
    navFarmers: 'Farmer Directory',
    
    // Dashboard Stats
    activeFarmer: 'Active Farm',
    switchFarmer: 'Switch Farmer',
    registerFarmer: 'Register New Farm',
    crop: 'Crop',
    stage: 'Growth Stage',
    soil: 'Soil Type',
    area: 'Area',
    location: 'Coordinates',
    
    // Environmental
    envTitle: 'NASA Earth Observation Telemetry',
    tempMax: 'Max Temp',
    tempMin: 'Min Temp',
    precipitation: 'Rainfall (24h)',
    precipitation7d: '7-Day Cumulative',
    soilMoistureRoot: 'Root-Zone Moisture',
    surfaceMoisture: 'Surface Wetness',
    solarRad: 'Solar Insolation',
    ndvi: 'Vegetation Index (NDVI)',
    dataSource: 'NASA Data Provenance',
    updatedAt: 'Observation Timestamp',
    
    // Risks
    riskTitle: 'Agrometeorological Risk Assessment',
    heatStress: 'Heat Stress Risk',
    droughtRisk: 'Drought & Moisture Stress',
    excessRain: 'Excess Rain / Waterlogging',
    pestRisk: 'Pest & Fungal Vulnerability',
    overallRisk: 'Overall Agro-Climate Risk',
    
    // Advisor
    advisorTitle: 'KrishiSaathi AI Farming Assistant',
    advisorPlaceholder: 'Ask a question in English, Hindi, or Hinglish...',
    advisorListening: 'Listening to your voice...',
    send: 'Ask Advisor',
    suggestedQuestions: 'Suggested Inquiries',
    
    // Calling
    callingTitle: 'Two-Way AI Voice Calling Dispatch',
    callNow: 'Initiate Outgoing Call',
    callQueue: 'Climate Alert Queue',
    callHistory: 'Call Records & Transcripts',
    callingConsent: 'Automated Calling Consent',
    consentGranted: 'Consent Verified',
    consentRequired: 'Consent Required',
    triggerAlertBroadcast: 'Dispatch Climate Warning Broadcast',
    
    // What If Simulator
    simulatorTitle: 'What-If Climate Scenario Simulator',
    simulatorDesc: 'Stress-test your farm against hypothetical climate shocks to generate proactive adaptation protocols.',
    tempSlider: 'Temperature Anomaly (°C)',
    rainSlider: 'Rainfall Anomaly (%)',
    soilSlider: 'Soil Moisture Level (%)',
    runSimulation: 'Calculate Climate Stress Impact',
    
    // Status
    low: 'LOW RISK',
    medium: 'MODERATE RISK',
    high: 'HIGH SEVERITY',
  },
  hi: {
    appName: 'कृषिसाथी एआई (KrishiSaathi AI)',
    tagline: 'आपका स्मार्ट खेती साथी',
    heroSub: 'नासा (NASA) के उपग्रह डेटा, जलवायु जोखिम विश्लेषण और कृषि सहायक एआई के माध्यम से किसानों को समय पर, सटीक और सरल मार्गदर्शन देता है।',
    exploreDashboard: 'फार्म डैशबोर्ड देखें',
    talkToAdvisor: 'एआई कृषि सलाहकार से बात करें',
    startVoiceCall: 'एआई फोन कॉल शुरू करें',
    simulatedModeBadge: 'डेमो वॉइस कॉलिंग मोड',
    realTelephonyBadge: 'टेलीफोनी प्रोडक्शन तैयार',
    
    // Nav
    navHome: 'होम',
    navDashboard: 'फार्म डैशबोर्ड',
    navMap: 'उपग्रह मानचित्र',
    navVoiceCalling: 'एआई वॉइस कॉलिंग',
    navAdvisor: 'एआई कृषि सलाहकार',
    navSimulator: 'जलवायु सिमुलेटर',
    navFarmers: 'किसान सूची',
    
    // Dashboard Stats
    activeFarmer: 'चयनित किसान',
    switchFarmer: 'किसान बदलें',
    registerFarmer: 'नया खेत जोड़ें',
    crop: 'फसल',
    stage: 'फसल की अवस्था',
    soil: 'मिट्टी का प्रकार',
    area: 'क्षेत्रफल',
    location: 'स्थान / निर्देशांक',
    
    // Environmental
    envTitle: 'नासा (NASA) उपग्रह मौसम एवं पर्यावरण डेटा',
    tempMax: 'अधिकतम तापमान',
    tempMin: 'न्यूनतम तापमान',
    precipitation: 'वर्षा (24 घंटे)',
    precipitation7d: '7-दिवसीय कुल वर्षा',
    soilMoistureRoot: 'जड़ क्षेत्र की नमी',
    surfaceMoisture: 'सतह की नमी',
    solarRad: 'सौर विकिरण',
    ndvi: 'वनस्पति स्वास्थ्य सूचकांक (NDVI)',
    dataSource: 'नासा डेटा स्रोत',
    updatedAt: 'अंतिम उपग्रह अवलोकन',
    
    // Risks
    riskTitle: 'कृषि-मौसम जोखिम मूल्यांकन',
    heatStress: 'ताप तनाव जोखिम (Heat Stress)',
    droughtRisk: 'सूखा और नमी संकट',
    excessRain: 'अत्यधिक बारिश / जलभराव',
    pestRisk: 'कीट एवं फफूंद रोग का खतरा',
    overallRisk: 'समग्र जलवायु जोखिम',
    
    // Advisor
    advisorTitle: 'कृषिसाथी एआई कृषि सहायक',
    advisorPlaceholder: 'हिंदी, हिंग्लिश या अंग्रेजी में अपना सवाल पूछें...',
    advisorListening: 'आपकी आवाज सुनी जा रही है...',
    send: 'सलाह लें',
    suggestedQuestions: 'सुझाए गए प्रश्न',
    
    // Calling
    callingTitle: 'दोतरफा एआई फोन कॉलिंग प्रणाली',
    callNow: 'किसान को कॉल करें',
    callQueue: 'जलवायु चेतावनी कॉल कतार',
    callHistory: 'कॉल इतिहास एवं प्रतिलेख',
    callingConsent: 'कॉलिंग सहमति स्थिति',
    consentGranted: 'सहमति प्राप्त',
    consentRequired: 'सहमति आवश्यक',
    triggerAlertBroadcast: 'आपातकालीन मौसम चेतावनी प्रसारित करें',
    
    // What If Simulator
    simulatorTitle: 'जलवायु परिदृश्य सिमुलेटर (What-If)',
    simulatorDesc: 'जलवायु परिवर्तन या चरम मौसम के प्रभावों का पहले से परीक्षण करें और बचाव के उपाय जानें।',
    tempSlider: 'तापमान में बदलाव (°C)',
    rainSlider: 'वर्षा में बदलाव (%)',
    soilSlider: 'मिट्टी की नमी स्तर (%)',
    runSimulation: 'प्रभाव का विश्लेषण करें',
    
    // Status
    low: 'कम जोखिम (सामान्य)',
    medium: 'मध्यम चेतावनी',
    high: 'उच्च जोखिम (गंभीर)',
  }
};

export function getT(lang: Language) {
  return translations[lang] || translations.en;
}
