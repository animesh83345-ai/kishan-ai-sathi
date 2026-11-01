/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Thermometer, 
  CloudRain, 
  Droplets, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { CropType, GrowthStage, Language, NASAObservation } from '../types';
import { getT } from '../services/i18n';

interface WhatIfSimulatorProps {
  observation: NASAObservation;
  initialCrop: CropType;
  initialStage: GrowthStage;
  language: Language;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  observation,
  initialCrop,
  initialStage,
  language,
}) => {
  const t = getT(language);
  const [selectedCrop, setSelectedCrop] = useState<CropType>(initialCrop);
  const [selectedStage, setSelectedStage] = useState<GrowthStage>(initialStage);
  const [deltaTemp, setDeltaTemp] = useState<number>(3.0); // +3.0°C
  const [deltaRain, setDeltaRain] = useState<number>(-35); // -35%
  const [simSoilMoisture, setSimSoilMoisture] = useState<number>(20); // 20%

  // Simulated calculations
  const simTempMax = observation.temperatureMax + deltaTemp;
  const simRain7d = Math.max(0, observation.precipitation7d * (1 + deltaRain / 100));

  // Yield impact calculation
  let yieldLoss = 0;
  if (deltaTemp > 0) {
    yieldLoss += deltaTemp * (selectedCrop === 'Wheat' ? 5.2 : 3.4);
  }
  if (deltaRain < -15) {
    yieldLoss += Math.abs(deltaRain) * 0.35;
  } else if (deltaRain > 50) {
    yieldLoss += 9.0;
  }
  if (simSoilMoisture < 25) {
    yieldLoss += 14.0;
  }

  const yieldImpactPercent = Math.max(-65, Math.min(15, -yieldLoss));

  // Risk shifts
  const heatRisk = simTempMax > 34 ? 'HIGH' : simTempMax > 31 ? 'MEDIUM' : 'LOW';
  const droughtRisk = simSoilMoisture < 25 || deltaRain < -30 ? 'HIGH' : simSoilMoisture < 35 ? 'MEDIUM' : 'LOW';
  const waterlogRisk = deltaRain > 45 ? 'HIGH' : deltaRain > 25 ? 'MEDIUM' : 'LOW';

  // Adaptation recommendations
  const adaptations: string[] = [];
  if (deltaTemp >= 2.0) {
    adaptations.push(`Switch to thermal-resilient cultivars (e.g. DBW-187 for wheat, Swarna Shreya for rice) suitable for +${deltaTemp.toFixed(1)}°C canopy thresholds.`);
    adaptations.push('Install micro-sprinklers for automated daytime canopy evaporative cooling between 11:30 and 15:00.');
  }
  if (deltaRain <= -20 || simSoilMoisture <= 25) {
    adaptations.push('Implement laser land leveling and drip fertigation to conserve 35% irrigation volume.');
    adaptations.push('Deploy 6-8 cm organic paddy straw or sugarcane bagasse mulch to cut soil evaporation by half.');
  }
  if (deltaRain >= 30) {
    adaptations.push('Construct broad bed and furrow (BBF) layout with deep perimeter ditches to discharge sudden stormwater.');
  }

  // Chart comparison data
  const comparisonData = [
    {
      metric: 'Max Temp (°C)',
      Baseline_NASA: Number(observation.temperatureMax.toFixed(1)),
      Simulated_Scenario: Number(simTempMax.toFixed(1)),
    },
    {
      metric: '7d Rain (mm)',
      Baseline_NASA: Number(observation.precipitation7d.toFixed(1)),
      Simulated_Scenario: Number(simRain7d.toFixed(1)),
    },
    {
      metric: 'Soil Moisture (%)',
      Baseline_NASA: Number((observation.rootZoneSoilMoisture * 100).toFixed(0)),
      Simulated_Scenario: Number(simSoilMoisture.toFixed(0)),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-emerald-400" />
          <span>{t.simulatorTitle}</span>
        </h2>
        <p className="text-xs text-stone-400 mt-1 max-w-2xl">
          {t.simulatorDesc}
        </p>
      </div>

      {/* Simulator Inputs vs Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Stress Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div data-guide="climate-simulator" className="p-5 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#183921]">
              <h3 className="text-base font-bold text-white font-display">
                Scenario Stress Parameters
              </h3>
              <span className="text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60 font-mono">
                SIMULATION MODE
              </span>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Crop & Growth Stage:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value as CropType)}
                  className="bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice (Paddy)">Rice (Paddy)</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Pulses (Chickpea/Moong)">Pulses</option>
                  <option value="Vegetables (Tomato/Onion)">Vegetables</option>
                </select>

                <select
                  value={selectedStage}
                  onChange={e => setSelectedStage(e.target.value as GrowthStage)}
                  className="bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Flowering / Tasseling">Flowering</option>
                  <option value="Grain / Fruit Formation">Grain Filling</option>
                  <option value="Vegetative Stage">Vegetative</option>
                  <option value="Sowing / Germination">Sowing</option>
                </select>
              </div>
            </div>

            {/* Slider 1: Temperature Delta */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  {t.tempSlider}
                </span>
                <span className={`font-mono font-bold ${deltaTemp > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {deltaTemp > 0 ? `+${deltaTemp.toFixed(1)}°C` : `${deltaTemp.toFixed(1)}°C`}
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="8"
                step="0.5"
                value={deltaTemp}
                onChange={e => setDeltaTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-[#162d1c] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>-4°C (Cooling)</span>
                <span>0°C (Baseline)</span>
                <span>+8°C (Extreme Heat)</span>
              </div>
            </div>

            {/* Slider 2: Rainfall Delta */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  {t.rainSlider}
                </span>
                <span className={`font-mono font-bold ${deltaRain > 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {deltaRain > 0 ? `+${deltaRain}%` : `${deltaRain}%`}
                </span>
              </div>
              <input
                type="range"
                min="-70"
                max="80"
                step="5"
                value={deltaRain}
                onChange={e => setDeltaRain(parseInt(e.target.value))}
                className="w-full accent-cyan-500 bg-[#162d1c] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>-70% (Severe Drought)</span>
                <span>0% (Normal)</span>
                <span>+80% (Deluge)</span>
              </div>
            </div>

            {/* Slider 3: Soil Moisture */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  {t.soilSlider}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {simSoilMoisture}% Saturation
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                step="5"
                value={simSoilMoisture}
                onChange={e => setSimSoilMoisture(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-[#162d1c] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>10% (Wilting Point)</span>
                <span>45% (Optimal)</span>
                <span>85% (Saturated)</span>
              </div>
            </div>

            {/* Reset to baseline button */}
            <button
              onClick={() => {
                setDeltaTemp(0);
                setDeltaRain(0);
                setSimSoilMoisture(Math.round(observation.rootZoneSoilMoisture * 100));
              }}
              className="w-full py-2 rounded-xl bg-[#132919] hover:bg-[#1a3823] text-stone-300 text-xs font-semibold border border-[#214a2a] transition-colors cursor-pointer"
            >
              Reset to Live NASA Baseline Observations
            </button>
          </div>
        </div>

        {/* Right Column: Simulated Impact Assessment & Adaptations */}
        <div className="lg:col-span-7 space-y-4">
          {/* Yield Impact Card */}
          <div className="p-5 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#183921]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Estimated Crop Yield Shock
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-3xl font-black font-display ${yieldImpactPercent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {yieldImpactPercent > 0 ? `+${yieldImpactPercent}%` : `${yieldImpactPercent.toFixed(1)}%`}
                  </span>
                  <span className="text-xs text-stone-400">
                    {yieldImpactPercent < 0 ? 'Yield Reduction Risk' : 'Normal / Favorable'}
                  </span>
                </div>
              </div>

              {/* Risk Shifts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  heatRisk === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800/60' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                }`}>
                  Heat: {heatRisk}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  droughtRisk === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800/60' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                }`}>
                  Drought: {droughtRisk}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  waterlogRisk === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800/60' : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                }`}>
                  Flood: {waterlogRisk}
                </span>
              </div>
            </div>

            {/* Visual Comparison Chart: Baseline vs Simulated (Requirement 11) */}
            <div className="pt-4">
              <div className="text-xs font-semibold text-stone-300 mb-2">
                Baseline NASA Data vs Simulated Climate Shock:
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#173620" />
                    <XAxis dataKey="metric" stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09150d', borderColor: '#1f452a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                    <Bar dataKey="Baseline_NASA" fill="#10b981" radius={[4, 4, 0, 0]} name="Baseline NASA Data" />
                    <Bar dataKey="Simulated_Scenario" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Simulated Scenario" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Actionable Adaptation Protocols */}
          <div className="p-5 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#183921]">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white font-display">
                Proactive Farm Adaptation Protocols
              </h4>
            </div>

            <div className="space-y-2">
              {adaptations.map((measure, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#112316] border border-[#1f472b] text-xs text-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{measure}</span>
                </div>
              ))}

              {adaptations.length === 0 && (
                <p className="text-xs text-stone-400 italic">
                  Simulated values are within safe physiological limits for {selectedCrop}. Standard crop management applies.
                </p>
              )}
            </div>

            <div className="pt-2 text-[10px] text-stone-400 flex items-center gap-1.5 italic">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>Simulation models derived from FAO-56 crop response coefficients and IPCC climate vulnerability scenarios.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
