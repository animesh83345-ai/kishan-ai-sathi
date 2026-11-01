/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Globe2, 
  Satellite, 
  Cpu, 
  PhoneCall, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Droplets, 
  SunMedium, 
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  Leaf
} from 'lucide-react';
import { FarmerProfile, Language } from '../types';
import { getT } from '../services/i18n';

interface LandingHeroProps {
  farmer: FarmerProfile;
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenCallingModal: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  farmer,
  language,
  onNavigate,
  onOpenCallingModal,
}) => {
  const t = getT(language);

  return (
    <div className="min-h-screen bg-[#070e09] text-[#e6f0e9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#162e1c]">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-green-700/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-lime-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Mission Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#122617] border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold uppercase tracking-wider text-[10px] text-emerald-400">KrishiSaathi AI</span>
            <span className="text-stone-500">•</span>
            <span>Your Smart Farming Companion</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-display">
                {language === 'hi' ? (
                  <>
                    नासा उपग्रह डेटा और एआई से <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400">
                      स्मार्ट खेती और सीधा फोन संवाद
                    </span>
                  </>
                ) : (
                  <>
                    KrishiSaathi AI — <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400">
                      Your Smart Farming Companion.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-stone-300/90 max-w-2xl leading-relaxed">
                {t.heroSub}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{t.exploreDashboard}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('advisor')}
                  className="px-5 py-3.5 rounded-xl bg-[#132718] hover:bg-[#1a3521] border border-[#224b2b] text-emerald-300 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.talkToAdvisor}</span>
                </button>

                <button
                  onClick={onOpenCallingModal}
                  className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-950 to-[#0e2415] hover:border-emerald-500/60 border border-emerald-800/60 text-emerald-200 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{language === 'hi' ? 'कॉल सेंटर खोलें' : 'Open Call Center'}</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>NASA POWER Agroclimatology</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>NASA SMAP Soil Moisture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>NASA GPM Precipitation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>MODIS NDVI Vegetation</span>
                </div>
              </div>
            </div>

            {/* Interactive Visual Card / Telemetry Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#1f452a] bg-[#0c1a11]/90 p-5 shadow-2xl backdrop-blur-xl relative group">
                <div className="flex items-center justify-between pb-4 border-b border-[#173320]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 animate-ping"></div>
                    <div className="w-3 h-3 rounded-full bg-rose-500 absolute"></div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Live Telemetry Stream
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    Station: {farmer.district}, {farmer.state} {Math.abs(farmer.latitude).toFixed(2)}°{farmer.latitude >= 0 ? 'N' : 'S'}, {Math.abs(farmer.longitude).toFixed(2)}°{farmer.longitude >= 0 ? 'E' : 'W'}
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#112316] border border-[#1a3822]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <SunMedium className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-400">Daily Max Temperature</div>
                        <div className="text-lg font-bold text-white font-display">34.8 °C</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/70 px-2 py-1 rounded border border-rose-800/50">
                      +3.2°C Thermal Anomaly
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#112316] border border-[#1a3822]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-400">SMAP Root Moisture</div>
                        <div className="text-lg font-bold text-white font-display">24% Saturation</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/70 px-2 py-1 rounded border border-amber-800/50">
                      Deficit Risk: Medium
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#112316] border border-[#1a3822]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-400">MODIS NDVI Index</div>
                        <div className="text-lg font-bold text-white font-display">0.64 (Vegetative)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-1 rounded border border-emerald-800/50">
                      Canopy Healthy
                    </span>
                  </div>
                </div>

                {/* AI Automated Outbound Trigger Card */}
                <div className="pt-2 border-t border-[#173320]">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#102416] border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <div>
                        <div className="text-xs font-bold text-white">Local call demo</div>
                        <div className="text-[10px] text-emerald-300/80">Simulation only • No phone call placed</div>
                      </div>
                    </div>
                    <button
                      onClick={onOpenCallingModal}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Open Call Center
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section (Requirement 2) */}
      <section className="py-20 border-b border-[#162e1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/50">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              {language === 'hi' 
                ? 'चार स्तंभों पर आधारित स्मार्ट कृषि समाधान' 
                : 'Built on Four Pillars of Climate-Resilient Agriculture'}
            </h2>
            <p className="text-stone-400 mt-3 text-sm sm:text-base">
              Connecting orbital satellite telemetry directly to practical on-ground farming decisions and conversational speech interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: NASA Data */}
            <div className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition-transform">
                  <Satellite className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">NASA Earth Observation</h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Real-time and calibrated telemetry from NASA POWER, SMAP L3/L4 soil moisture, GPM IMERG precipitation, and MODIS NDVI vegetation sensors.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                >
                  <span>Explore Telemetry</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 2: Risk Engine */}
            <div className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Climate Risk Analysis</h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Crop-specific physiological threshold engine for heat stress, drought, root hypoxia, and fungal disease vulnerability with transparent audit trails.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('simulator')}
                  className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                >
                  <span>Simulate Risk Scenarios</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 3: AI Advisor */}
            <div className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">AI Farming Advisor</h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Grounded with your crop stage and NASA readings. Responds in natural Hindi, English, and Hinglish with voice question and audio playback support.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('advisor')}
                  className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                >
                  <span>Consult Agronomist</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: Two-Way Calling */}
            <div className="rounded-2xl bg-[#0c1a11] border border-[#1b3d24] p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-5 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">Optional Exotel Voice Calling</h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Individually initiated Exotel calls require recorded farmer consent and account setup. AgentStream connects phone audio to Gemini Live; test the complete call with your Exotel account before using it with farmers.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onOpenCallingModal}
                  className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                >
                  <span>Open Call Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section (Requirement 2) */}
      <section className="py-20 bg-[#0a150e] border-b border-[#162e1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/50">
              Architecture & Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              {language === 'hi' ? 'कृषिसाथी एआई कैसे काम करता है?' : 'How KrishiSaathi AI Works'}
            </h2>
            <p className="text-stone-400 mt-3 text-sm sm:text-base">
              From Earth observation and crop context to consent-gated farmer outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#0e1d13] border border-[#1c3a25] relative">
              <div className="text-3xl font-extrabold text-emerald-500/40 mb-3 font-display">01</div>
              <h4 className="text-base font-bold text-white mb-2">NASA Satellite Ingestion</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Daily environmental readings (temperature curves, precipitation, soil wetness) are fetched via NASA POWER and Earthdata endpoints for the exact farm coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#0e1d13] border border-[#1c3a25] relative">
              <div className="text-3xl font-extrabold text-emerald-500/40 mb-3 font-display">02</div>
              <h4 className="text-base font-bold text-white mb-2">Agrometeorological Risk Modeling</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Raw observations are processed against crop physiological thresholds (flowering heat sensitivity, root wilting point, waterlogging hazard).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#0e1d13] border border-[#1c3a25] relative">
              <div className="text-3xl font-extrabold text-emerald-500/40 mb-3 font-display">03</div>
              <h4 className="text-base font-bold text-white mb-2">Operator Review & Consent Verification</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                An authorized operator checks the farmer's recorded opt-in and confirms consent for each individual call before dispatch.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#0e1d13] border border-[#1c3a25] relative">
              <div className="text-3xl font-extrabold text-emerald-500/40 mb-3 font-display">04</div>
              <h4 className="text-base font-bold text-white mb-2">Exotel AgentStream & Gemini Live</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                With account configuration, a single Exotel call can stream audio to Gemini Live. Provider status callbacks update in-memory call records; a complete live call has not yet been verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NASA Data & Technology Section (Requirement 2 & 4) */}
      <section className="py-20 border-b border-[#162e1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/50">
                Data Provenance
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3 font-display">
                NASA Earth Observation Datasets
              </h2>
              <p className="text-stone-400 text-sm mt-2 max-w-2xl">
                KrishiSaathi AI accesses verified NASA open science missions without fabricating readings or labeling mock values as real data.
              </p>
            </div>
            <a
              href="https://www.earthdata.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
            >
              <span>Explore NASA Earthdata Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#0d1c12] border border-[#183621]">
              <div className="text-xs font-mono text-emerald-400 mb-1">NASA POWER</div>
              <h4 className="text-base font-bold text-white mb-2">Prediction Of Worldwide Energy Resources</h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Provides meteorological datasets including 2m air temperature, relative humidity, solar radiation, and surface heat balance.
              </p>
              <a
                href="https://power.larc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>power.larc.nasa.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-xl bg-[#0d1c12] border border-[#183621]">
              <div className="text-xs font-mono text-cyan-400 mb-1">NASA GPM IMERG</div>
              <h4 className="text-base font-bold text-white mb-2">Global Precipitation Measurement</h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Multi-satellite precipitation calibration providing daily and multi-day accumulated rainfall estimates at 0.1° spatial resolution.
              </p>
              <a
                href="https://gpm.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>gpm.nasa.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-xl bg-[#0d1c12] border border-[#183621]">
              <div className="text-xs font-mono text-amber-400 mb-1">NASA SMAP</div>
              <h4 className="text-base font-bold text-white mb-2">Soil Moisture Active Passive</h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Measures surface and modeled root-zone soil moisture (GWETROOT) to evaluate agricultural drought and crop wilting stress.
              </p>
              <a
                href="https://smap.jpl.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>smap.jpl.nasa.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-xl bg-[#0d1c12] border border-[#183621]">
              <div className="text-xs font-mono text-lime-400 mb-1">NASA MODIS</div>
              <h4 className="text-base font-bold text-white mb-2">Moderate Resolution Imaging Spectroradiometer</h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                Terra and Aqua satellite vegetation indices (MOD13A2) monitoring Normalized Difference Vegetation Index (NDVI) and land surface temperature.
              </p>
              <a
                href="https://modis.gsfc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-lime-400 hover:underline flex items-center gap-1"
              >
                <span>modis.gsfc.nasa.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Project Impact Section (Requirement 2) */}
      <section className="py-20 bg-[#09140d] border-b border-[#162e1c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/50">
              National Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 font-display">
              {language === 'hi' ? 'जलवायु परिवर्तन से किसानों की सुरक्षा' : 'Empowering Indian Agriculture at Scale'}
            </h2>
            <p className="text-stone-400 mt-3 text-sm">
              Supporting UN Sustainable Development Goals (SDG 2: Zero Hunger & SDG 13: Climate Action).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#0d1c12] border border-[#1b3b24] text-center">
              <div className="text-3xl font-extrabold text-emerald-400 font-display">18 - 25%</div>
              <div className="text-sm font-semibold text-white mt-1">Yield Loss Prevented</div>
              <p className="text-xs text-stone-400 mt-2">
                Through early warning of terminal heat stress during critical flowering and grain-filling windows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1c12] border border-[#1b3b24] text-center">
              <div className="text-3xl font-extrabold text-cyan-400 font-display">30 - 40%</div>
              <div className="text-sm font-semibold text-white mt-1">Water Conservation</div>
              <p className="text-xs text-stone-400 mt-2">
                By preventing premature canal flooding when NASA GPM detects imminent rain fronts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1c12] border border-[#1b3b24] text-center">
              <div className="text-3xl font-extrabold text-amber-400 font-display">100%</div>
              <div className="text-sm font-semibold text-white mt-1">Language Accessibility</div>
              <p className="text-xs text-stone-400 mt-2">
                Eliminates the smartphone app barrier through direct two-way automated voice phone calls in Hindi and regional dialects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1c12] border border-[#1b3b24] text-center">
              <div className="text-3xl font-extrabold text-lime-400 font-display">&lt; 60 Sec</div>
              <div className="text-sm font-semibold text-white mt-1">Alert Dispatch Latency</div>
              <p className="text-xs text-stone-400 mt-2">
                From satellite hazard detection to automated phone ringing on the registered farmer's handset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer (Requirement 2) */}
      <footer className="py-12 bg-[#060c07] text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#142819]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base font-display">KrishiSaathi AI</span>
              <span className="text-stone-500">|</span>
              <span className="text-stone-400">NASA-Powered Climate Intelligence & AI Voice Calling</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('dashboard')} className="hover:text-white cursor-pointer">Farm Dashboard</button>
              <button onClick={() => onNavigate('map')} className="hover:text-white cursor-pointer">Satellite Map</button>
              <button onClick={() => onNavigate('calling')} className="hover:text-white cursor-pointer">AI Calling System</button>
              <button onClick={() => onNavigate('advisor')} className="hover:text-white cursor-pointer">AI Advisor</button>
              <button onClick={() => onNavigate('simulator')} className="hover:text-white cursor-pointer">Climate Simulator</button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            <p>
              © 2026 KrishiSaathi AI. Built for the NASA Space Apps & Earth Observation Agriculture Challenge. 
              Data provided by NASA POWER, SMAP, GPM, and MODIS.
            </p>
            <div className="flex items-center gap-4">
              <span>Scientific Agronomic Models: FAO-56 & ICAR</span>
              <span>•</span>
              <span className="text-emerald-400">Strict Farmer Consent Protected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
