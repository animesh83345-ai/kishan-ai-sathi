/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Sprout, 
  Calendar, 
  CheckSquare, 
  ShieldCheck, 
  AlertCircle, 
  Save,
  Languages,
  Clock
} from 'lucide-react';
import { 
  CallingWindow, 
  CropType, 
  FarmerProfile, 
  GrowthStage, 
  IrrigationMethod, 
  Language, 
  SoilType 
} from '../types';

interface FarmerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFarmer: (farmer: Partial<FarmerProfile>) => void;
  existingFarmer?: FarmerProfile;
  language: Language;
}

export const FarmerDirectoryModal: React.FC<FarmerDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSaveFarmer,
  existingFarmer,
  language,
}) => {
  const [name, setName] = useState(existingFarmer?.name || '');
  const [phone, setPhone] = useState(existingFarmer?.phone || '+91 ');
  const [village, setVillage] = useState(existingFarmer?.village || '');
  const [district, setDistrict] = useState(existingFarmer?.district || '');
  const [state, setState] = useState(existingFarmer?.state || 'Punjab');
  const [lat, setLat] = useState(existingFarmer?.latitude || 30.6667);
  const [lon, setLon] = useState(existingFarmer?.longitude || 76.2999);
  const [crop, setCrop] = useState<CropType>(existingFarmer?.crop || 'Wheat');
  const [growthStage, setGrowthStage] = useState<GrowthStage>(existingFarmer?.growthStage || 'Flowering / Tasseling');
  const [farmArea, setFarmArea] = useState(existingFarmer?.farmArea || 5.0);
  const [areaUnit, setAreaUnit] = useState<'Acres' | 'Hectares' | 'Bigha'>(existingFarmer?.areaUnit || 'Acres');
  const [soilType, setSoilType] = useState<SoilType>(existingFarmer?.soilType || 'Alluvial Soil');
  const [sowingDate, setSowingDate] = useState(existingFarmer?.sowingDate || '2025-11-15');
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(existingFarmer?.irrigationMethod || 'Tube Well / Borewell');
  const [prefLang, setPrefLang] = useState<Language>(existingFarmer?.preferredLanguage || 'hi');
  const [callingWindow, setCallingWindow] = useState<CallingWindow>(existingFarmer?.preferredCallingWindow || 'Morning (07:00 - 09:00)');
  const [consent, setConsent] = useState(existingFarmer?.consentForCalls ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Farmer name is required';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid phone number is required for emergency alerts';
    if (!village.trim()) errs.village = 'Village name is required';
    if (!district.trim()) errs.district = 'District name is required';
    if (lat < 8 || lat > 37) errs.lat = 'Latitude must be within India (8°N - 37°N)';
    if (lon < 68 || lon > 98) errs.lon = 'Longitude must be within India (68°E - 98°E)';
    if (farmArea <= 0) errs.farmArea = 'Farm area must be greater than 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSaveFarmer({
      id: existingFarmer?.id,
      name,
      phone,
      village,
      district,
      state,
      latitude: Number(lat),
      longitude: Number(lon),
      crop,
      growthStage,
      farmArea: Number(farmArea),
      areaUnit,
      soilType,
      sowingDate,
      irrigationMethod,
      preferredLanguage: prefLang,
      preferredCallingWindow: callingWindow,
      consentForCalls: consent,
      consentTimestamp: !consent
        ? ''
        : existingFarmer?.consentForCalls && existingFarmer.consentTimestamp
          ? existingFarmer.consentTimestamp
          : new Date().toISOString(),
    });

    onClose();
  };

  // Quick preset locations for popular farming belts in India
  const setQuickLocation = (locName: string, newLat: number, newLon: number, newDistrict: string, newState: string, newSoil: SoilType) => {
    setLat(newLat);
    setLon(newLon);
    setDistrict(newDistrict);
    setState(newState);
    setSoilType(newSoil);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#183921] flex items-center justify-between shrink-0 bg-[#09150d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {existingFarmer ? 'Edit Farm Profile' : 'Register New Farmer & Field'}
              </h3>
              <p className="text-xs text-stone-400">
                Onboard farm for NASA satellite climate monitoring & automated voice call advisories.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-[#142d1b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-stone-200">
          {/* Section 1: Farmer Personal Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Farmer Identity & Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                {errors.name && <p className="text-rose-400 text-[10px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Mobile Number (with country code) *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                {errors.phone && <p className="text-rose-400 text-[10px] mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Location & Geospatial Coordinates */}
          <div className="pt-2 border-t border-[#183921]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Farm Location & NASA Coordinates
              </h4>
              <div className="text-[10px] text-stone-400">
                Quick Preset:
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => setQuickLocation('Punjab', 30.6667, 76.2999, 'Fatehgarh Sahib', 'Punjab', 'Alluvial Soil')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] border border-[#20492c] cursor-pointer"
              >
                Punjab (Wheat Belt)
              </button>
              <button
                type="button"
                onClick={() => setQuickLocation('Bihar', 25.2017, 84.2567, 'Rohtas', 'Bihar', 'Clayey Soil')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] border border-[#20492c] cursor-pointer"
              >
                Bihar (Paddy Belt)
              </button>
              <button
                type="button"
                onClick={() => setQuickLocation('Telangana', 18.1018, 78.8520, 'Siddipet', 'Telangana', 'Black Cotton Soil (Regur)')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] border border-[#20492c] cursor-pointer"
              >
                Telangana (Cotton/Pulses)
              </button>
              <button
                type="button"
                onClick={() => setQuickLocation('Maharashtra', 18.1517, 74.5771, 'Pune', 'Maharashtra', 'Black Cotton Soil (Regur)')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] border border-[#20492c] cursor-pointer"
              >
                Maharashtra (Cane/Onion)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  placeholder="e.g. Mandi Gobindgarh"
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Rohtas"
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Bihar"
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-300 font-medium mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value))}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Crop & Agronomic Parameters */}
          <div className="pt-2 border-t border-[#183921]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" />
              Crop Type, Stage & Soil Characteristics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Crop Type *</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value as CropType)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Rice (Paddy)">Rice / Paddy (धान)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Pulses (Chickpea/Moong)">Pulses (दालें - चना/मूंग)</option>
                  <option value="Sugarcane">Sugarcane (गन्ना)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Vegetables (Tomato/Onion)">Vegetables (टमाटर/प्याज)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Groundnut">Groundnut (मूंगफली)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Growth Stage *</label>
                <select
                  value={growthStage}
                  onChange={e => setGrowthStage(e.target.value as GrowthStage)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Sowing / Germination">Sowing / Germination</option>
                  <option value="Vegetative Stage">Vegetative Stage</option>
                  <option value="Flowering / Tasseling">Flowering / Tasseling</option>
                  <option value="Grain / Fruit Formation">Grain / Fruit Formation</option>
                  <option value="Ripening / Maturity">Ripening / Maturity</option>
                  <option value="Harvesting Ready">Harvesting Ready</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={e => setSoilType(e.target.value as SoilType)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Alluvial Soil">Alluvial Soil (जलोढ़ मिट्टी)</option>
                  <option value="Black Cotton Soil (Regur)">Black Cotton Soil (काली मिट्टी)</option>
                  <option value="Red and Yellow Soil">Red and Yellow Soil (लाल मिट्टी)</option>
                  <option value="Sandy Loam Soil">Sandy Loam Soil (बलुई दोमट)</option>
                  <option value="Clayey Soil">Clayey Soil (चिकनी मिट्टी)</option>
                  <option value="Laterite Soil">Laterite Soil (लेटराइट)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Farm Area</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={farmArea}
                    onChange={e => setFarmArea(parseFloat(e.target.value))}
                    className="w-2/3 bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <select
                    value={areaUnit}
                    onChange={e => setAreaUnit(e.target.value as any)}
                    className="w-1/3 bg-[#112316] border border-[#1f472b] rounded-xl px-2 py-2 text-white focus:outline-none text-[11px]"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Bigha">Bigha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Irrigation Method</label>
                <select
                  value={irrigationMethod}
                  onChange={e => setIrrigationMethod(e.target.value as IrrigationMethod)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                  <option value="Canal / Flood Irrigation">Canal / Flood Irrigation</option>
                  <option value="Tube Well / Borewell">Tube Well / Borewell</option>
                  <option value="Rainfed (No Irrigation)">Rainfed (No Irrigation)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Sowing Date</label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={e => setSowingDate(e.target.value)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Communication Preferences & Mandatory Calling Consent (Requirement 3 & 9) */}
          <div className="pt-2 border-t border-[#183921] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Communication & Voice Call Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Preferred Language</label>
                <select
                  value={prefLang}
                  onChange={e => setPrefLang(e.target.value as Language)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Preferred Calling Time Window</label>
                <select
                  value={callingWindow}
                  onChange={e => setCallingWindow(e.target.value as CallingWindow)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Morning (07:00 - 09:00)">Morning (07:00 - 09:00)</option>
                  <option value="Afternoon (12:00 - 14:00)">Afternoon (12:00 - 14:00)</option>
                  <option value="Evening (17:00 - 19:30)">Evening (17:00 - 19:30)</option>
                </select>
              </div>
            </div>

            {/* Explicit Consent Checkbox (MANDATORY REQUIREMENT) */}
            <div className="p-4 rounded-xl bg-[#112316] border border-[#235031] space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  data-guide="register-farmer"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-emerald-600 text-emerald-600 focus:ring-emerald-500 bg-[#08150c]"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">
                    Farmer opt-in for automated AI phone calls
                  </span>
                  <p className="text-stone-300 mt-0.5 leading-relaxed">
                    Check this only after the farmer has explicitly agreed to receive automated voice calls from KrishiSaathi AI. Do not infer consent from registration. The opt-in timestamp is kept when editing other profile details.
                  </p>
                </div>
              </label>

              {!consent && (
                <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-[11px] text-rose-300 flex items-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Notice: Without explicit consent, automated phone calls and emergency voice dispatches will be strictly blocked.</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#183921] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#142d1b] hover:bg-[#1b3d25] text-stone-300 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{existingFarmer ? 'Update Profile' : 'Save & Register Farm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
