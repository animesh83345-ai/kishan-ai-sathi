/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Globe2, 
  PhoneCall, 
  Radio, 
  MapPin, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  Users, 
  Languages, 
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { FarmerProfile, Language, RiskAssessment } from '../types';
import { getT } from '../services/i18n';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  activeFarmer: FarmerProfile;
  farmers: FarmerProfile[];
  onSelectFarmer: (farmer: FarmerProfile) => void;
  onOpenRegisterModal: () => void;
  onOpenCallingModal: () => void;
  activeAssessment?: RiskAssessment;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  activeFarmer,
  farmers,
  onSelectFarmer,
  onOpenRegisterModal,
  onOpenCallingModal,
  activeAssessment,
}) => {
  const t = getT(language);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const hasHighRisk = activeAssessment?.overallRiskLevel === 'HIGH';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1b3823]/80 bg-[#08110b]/90 backdrop-blur-md">
      {/* Emergency alert bar if High Risk detected */}
      {hasHighRisk && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium">
              {language === 'hi' 
                ? `चेतावनी: ${activeFarmer.name} (${activeFarmer.district}) के लिए नासा उपग्रह से गंभीर जलवायु जोखिम चिन्हित!`
                : `Active Alert: High Climate Risk identified for ${activeFarmer.name}'s ${activeFarmer.crop} in ${activeFarmer.district}!`}
            </span>
            <button
              onClick={onOpenCallingModal}
              className="ml-auto underline font-semibold text-amber-300 hover:text-amber-100 flex items-center gap-1 cursor-pointer"
            >
              <PhoneCall className="w-3 h-3" />
              {language === 'hi' ? 'कॉल सेंटर खोलें' : 'Open Call Center'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-800 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
                <div className="w-full h-full bg-[#0b1b11] rounded-[10px] flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors font-display">
                    KrishiSaathi <span className="text-emerald-400">AI</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">
                    NASA
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/60 hidden sm:block">
                  Your Smart Farming Companion
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => onSelectTab('home')}
              data-guide="nav-home"
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              {t.navHome}
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              data-guide="nav-dashboard"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t.navDashboard}
            </button>
            <button
              onClick={() => onSelectTab('map')}
              data-guide="nav-map"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'map'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {t.navMap}
            </button>
            <button
              onClick={() => onSelectTab('calling')}
              data-guide="nav-calling"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
                currentTab === 'calling'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.navVoiceCalling}</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={() => onSelectTab('advisor')}
              data-guide="nav-advisor"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'advisor'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t.navAdvisor}
            </button>
            <button
              onClick={() => onSelectTab('simulator')}
              data-guide="nav-climate-simulator"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'simulator'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {t.navSimulator}
            </button>
            <button
              onClick={() => onSelectTab('directory')}
              data-guide="nav-farmers"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'directory'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-stone-300 hover:text-white hover:bg-[#122316]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t.navFarmers}
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Farmer Pill & Selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                data-guide="active-farmer"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#112417] border border-[#1e4229] hover:border-emerald-500/50 transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-800/50 text-emerald-300 flex items-center justify-center text-[11px] font-bold">
                  {activeFarmer.name[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-semibold text-white leading-tight truncate max-w-[110px]">
                    {activeFarmer.name}
                  </div>
                  <div className="text-[9px] text-emerald-400/80 leading-tight">
                    {activeFarmer.crop} • {activeFarmer.district}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0e1d13] border border-[#1e4229] rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border-b border-[#1b3823]">
                    {language === 'hi' ? 'किसान चुनें' : 'Select Registered Farm'}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {farmers.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onSelectFarmer(f);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#172f1e] transition-colors cursor-pointer ${
                          f.id === activeFarmer.id ? 'bg-[#142a1b] text-emerald-300' : 'text-stone-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{f.name}</div>
                          <div className="text-[10px] text-stone-400">{f.crop} ({f.growthStage.split(' ')[0]}) • {f.district}, {f.state}</div>
                        </div>
                        {f.consentForCalls ? (
                          <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                            Consent ✓
                          </span>
                        ) : (
                          <span className="text-[9px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                            No Call
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#1b3823] pt-1 px-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenRegisterModal();
                      }}
                      className="w-full text-center py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                    >
                      + {t.registerFarmer}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Call Button */}
            <button
              onClick={onOpenCallingModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'hi' ? 'कॉल सेंटर' : 'Call Center'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              data-guide="language-toggle"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#112417] border border-[#1e4229] hover:border-emerald-500/50 text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
              title="Toggle Hindi / English"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-[#152a1b] gap-2 text-xs no-scrollbar">
          <button
            onClick={() => onSelectTab('home')}
            data-guide="nav-home"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'home' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            data-guide="nav-dashboard"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navDashboard}
          </button>
          <button
            onClick={() => onSelectTab('map')}
            data-guide="nav-map"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'map' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navMap}
          </button>
          <button
            onClick={() => onSelectTab('calling')}
            data-guide="nav-calling"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'calling' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navVoiceCalling}
          </button>
          <button
            onClick={() => onSelectTab('advisor')}
            data-guide="nav-advisor"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'advisor' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navAdvisor}
          </button>
          <button
            onClick={() => onSelectTab('simulator')}
            data-guide="nav-climate-simulator"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'simulator' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navSimulator}
          </button>
          <button
            onClick={() => onSelectTab('directory')}
            data-guide="nav-farmers"
            className={`px-3 py-1 rounded-md shrink-0 cursor-pointer ${
              currentTab === 'directory' ? 'bg-emerald-900 text-white' : 'text-stone-400'
            }`}
          >
            {t.navFarmers}
          </button>
        </div>
      </div>
    </header>
  );
};
