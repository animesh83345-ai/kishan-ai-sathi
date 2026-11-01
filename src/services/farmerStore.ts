/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CallRecord, FarmerProfile } from '../types';

export const INITIAL_FARMERS: FarmerProfile[] = [
  {
    id: 'farmer-punjab-01',
    name: 'Sardar Gurpreet Singh',
    phone: '+91 98721 44520',
    village: 'Mandi Gobindgarh',
    district: 'Fatehgarh Sahib',
    state: 'Punjab',
    latitude: 30.6667,
    longitude: 76.2999,
    crop: 'Wheat',
    growthStage: 'Grain / Fruit Formation',
    farmArea: 14,
    areaUnit: 'Acres',
    soilType: 'Alluvial Soil',
    sowingDate: '2025-11-12',
    irrigationMethod: 'Tube Well / Borewell',
    preferredLanguage: 'hi',
    preferredCallingWindow: 'Morning (07:00 - 09:00)',
    consentForCalls: false,
    consentTimestamp: '',
    avatarSeed: 'gurpreet',
  },
  {
    id: 'farmer-bihar-02',
    name: 'Sunita Devi',
    phone: '+91 94310 88219',
    village: 'Bikramganj',
    district: 'Rohtas',
    state: 'Bihar',
    latitude: 25.2017,
    longitude: 84.2567,
    crop: 'Rice (Paddy)',
    growthStage: 'Flowering / Tasseling',
    farmArea: 4.5,
    areaUnit: 'Acres',
    soilType: 'Clayey Soil',
    sowingDate: '2026-06-28',
    irrigationMethod: 'Canal / Flood Irrigation',
    preferredLanguage: 'hi',
    preferredCallingWindow: 'Evening (17:00 - 19:30)',
    consentForCalls: false,
    consentTimestamp: '',
    avatarSeed: 'sunita',
  },
  {
    id: 'farmer-telangana-03',
    name: 'K. Mallesh Goud',
    phone: '+91 99480 32190',
    village: 'Siddipet Rural',
    district: 'Siddipet',
    state: 'Telangana',
    latitude: 18.1018,
    longitude: 78.8520,
    crop: 'Cotton',
    growthStage: 'Vegetative Stage',
    farmArea: 8.0,
    areaUnit: 'Acres',
    soilType: 'Black Cotton Soil (Regur)',
    sowingDate: '2026-07-10',
    irrigationMethod: 'Drip Irrigation',
    preferredLanguage: 'en',
    preferredCallingWindow: 'Morning (07:00 - 09:00)',
    consentForCalls: false,
    consentTimestamp: '',
    avatarSeed: 'mallesh'
  },
  {
    id: 'farmer-up-04',
    name: 'Harish Chandra Sharma',
    phone: '+91 97190 65431',
    village: 'Chandausi',
    district: 'Sambhal',
    state: 'Uttar Pradesh',
    latitude: 28.4554,
    longitude: 78.7758,
    crop: 'Vegetables (Tomato/Onion)',
    growthStage: 'Flowering / Tasseling',
    farmArea: 3.2,
    areaUnit: 'Acres',
    soilType: 'Sandy Loam Soil',
    sowingDate: '2026-08-15',
    irrigationMethod: 'Sprinkler Irrigation',
    preferredLanguage: 'hi',
    preferredCallingWindow: 'Afternoon (12:00 - 14:00)',
    consentForCalls: false,
    consentTimestamp: '',
    avatarSeed: 'harish'
  },
  {
    id: 'farmer-mh-05',
    name: 'Balasaheb Shinde',
    phone: '+91 98220 11984',
    village: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    latitude: 18.1517,
    longitude: 74.5771,
    crop: 'Sugarcane',
    growthStage: 'Grain / Fruit Formation',
    farmArea: 12.0,
    areaUnit: 'Acres',
    soilType: 'Black Cotton Soil (Regur)',
    sowingDate: '2025-10-05',
    irrigationMethod: 'Drip Irrigation',
    preferredLanguage: 'en',
    preferredCallingWindow: 'Evening (17:00 - 19:30)',
    consentForCalls: false,
    consentTimestamp: '',
    avatarSeed: 'balasaheb'
  }
];

export const INITIAL_CALL_RECORDS: CallRecord[] = [
  {
    id: 'call-20261030-01',
    farmerId: 'farmer-punjab-01',
    farmerName: 'Sardar Gurpreet Singh',
    phone: '+91 98721 44520',
    district: 'Fatehgarh Sahib',
    state: 'Punjab',
    crop: 'Wheat',
    callType: 'CRITICAL_ALERT',
    status: 'COMPLETED',
    startTime: '2026-10-30T07:12:00Z',
    endTime: '2026-10-30T07:14:18Z',
    durationSeconds: 138,
    isDemo: true,
    triggerReason: 'NASA POWER detected consecutive days >34.5°C during sensitive grain-filling stage (Terminal Heat Stress Alert).',
    aiBriefingEn: 'Automated briefing delivered warning of 3.8°C thermal anomaly. Recommended immediate light sprinkler run at dawn and postponing nitrogen top-dressing.',
    aiBriefingHi: 'नासा उपग्रह द्वारा 34.5°C से अधिक तापमान की चेतावनी दी गई। सुबह के समय हल्की स्प्रिंकलर सिंचाई करने की सलाह दी गई।',
    telephonyProvider: 'Demo Voice Synthesizer',
    transcript: [
      {
        speaker: 'AI',
        textEn: 'Namaste Gurpreet ji, this is KrishiSaathi AI calling with an urgent satellite climate update for your wheat crop in Fatehgarh Sahib.',
        textHi: 'नमस्ते गुरप्रीत जी, यह फतेहगढ़ साहिब में आपकी गेहूं की फसल के लिए नासा उपग्रह जलवायु अपडेट के साथ कृषिसाथी एआई का फोन है।',
        timestamp: '00:03'
      },
      {
        speaker: 'FARMER',
        textEn: 'Sat Sri Akal. Yes tell me, is it going to get hotter? My wheat is already forming grain.',
        textHi: 'सत श्री अकाल जी। हां बताइए, क्या मौसम और गर्म होने वाला है? गेहूं में दाना बन रहा है।',
        timestamp: '00:15'
      },
      {
        speaker: 'AI',
        textEn: 'Yes Gurpreet ji. NASA observation shows daytime temperatures will touch 35°C tomorrow. This can cause early forced grain shrinking. Please run your borewell or sprinkler for a light 2-hour irrigation before 7 AM tomorrow to cool the crop canopy.',
        textHi: 'जी गुरप्रीत जी। नासा के डेटा अनुसार कल तापमान 35 डिग्री तक जा सकता है जिससे दाना सिकुड़ सकता है। कृपया कल सुबह 7 बजे से पहले हल्का पानी दें ताकि खेत ठंडा रहे।',
        timestamp: '00:32'
      },
      {
        speaker: 'FARMER',
        textEn: 'Understood. Should I also spray potash or any tonic right now?',
        textHi: 'ठीक है। क्या मैं अभी पोटाश या कोई टॉनिक स्प्रे कर दूं?',
        timestamp: '00:54'
      },
      {
        speaker: 'AI',
        textEn: 'Do not spray during mid-day heat. You can spray 0.5% potassium nitrate in the cool evening (after 5 PM) to help wheat cells retain moisture against heat stress.',
        textHi: 'दोपहर की धूप में स्प्रे न करें। शाम को 5 बजे के बाद 0.5% पोटेशियम नाइट्रेट का हल्का छिड़काव कर सकते हैं, इससे फसल को गर्मी सहने की शक्ति मिलेगी।',
        timestamp: '01:08'
      },
      {
        speaker: 'FARMER',
        textEn: 'Very helpful, thank you for timely call.',
        textHi: 'बहुत धन्यवाद, सही समय पर जानकारी दी।',
        timestamp: '01:25'
      },
      {
        speaker: 'AI',
        textEn: 'You are welcome Gurpreet ji. KrishiSaathi AI will keep watching NASA satellites for your field. Have a prosperous harvest. Pranam.',
        textHi: 'आपका स्वागत है गुरप्रीत जी। हम नासा उपग्रहों से आपके खेत पर नजर रखेंगे। शुभ फसल के लिए शुभकामनाएँ।',
        timestamp: '01:32'
      }
    ]
  },
  {
    id: 'call-20261029-02',
    farmerId: 'farmer-bihar-02',
    farmerName: 'Sunita Devi',
    phone: '+91 94310 88219',
    district: 'Rohtas',
    state: 'Bihar',
    crop: 'Rice (Paddy)',
    callType: 'WEEKLY_ADVISORY',
    status: 'COMPLETED',
    startTime: '2026-10-29T17:30:00Z',
    endTime: '2026-10-29T17:31:45Z',
    durationSeconds: 105,
    isDemo: true,
    triggerReason: 'Routine agrometeorological advisory: NASA SMAP showed optimal root moisture (42%), NASA GPM forecasted 25mm rain in 48h.',
    aiBriefingEn: 'Advised pausing canal irrigation due to incoming GPM forecasted rain. Advised cleaning field drainage ridges.',
    aiBriefingHi: 'नासा उपग्रह द्वारा 48 घंटों में बारिश के अनुमान के कारण नहरी सिंचाई रोकने और मेड़ों की नालियां साफ करने की सलाह दी गई।',
    telephonyProvider: 'Demo Voice Synthesizer',
    transcript: [
      {
        speaker: 'AI',
        textEn: 'Pranam Sunita ji, KrishiSaathi AI calling with your weekly paddy advisory in Rohtas.',
        textHi: 'प्रणाम सुनीता जी, रोहतास में आपके धान के खेत के लिए फील्डशिफ्ट एआई का साप्ताहिक परामर्श।',
        timestamp: '00:02'
      },
      {
        speaker: 'FARMER',
        textEn: 'Pranam, should I release canal water into my paddy field today?',
        textHi: 'प्रणाम, क्या आज धान में नहर का पानी छोड़ दूं?',
        timestamp: '00:12'
      },
      {
        speaker: 'AI',
        textEn: 'Sunita ji, NASA GPM satellite shows rain clouds approaching Rohtas, with 25 to 30mm rainfall expected in the next 48 hours. Please do not flood your field today. Let the natural rain water the crop to save diesel and prevent waterlogging.',
        textHi: 'सुनीता जी, नासा उपग्रह बादलों की गतिविधि दर्शा रहा है। अगले 48 घंटों में 25 से 30 मिमी बारिश का अनुमान है। आज पानी न लगाएं, बारिश का इंतजार करें।',
        timestamp: '00:26'
      }
    ]
  }
];
