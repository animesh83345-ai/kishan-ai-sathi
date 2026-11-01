/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Sprout, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  PhoneCall, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { FarmerProfile, Language } from '../types';
import { getT } from '../services/i18n';

interface FarmerDirectoryViewProps {
  farmers: FarmerProfile[];
  activeFarmer: FarmerProfile;
  onSelectFarmer: (farmer: FarmerProfile) => void;
  onOpenRegisterModal: () => void;
  onEditFarmer: (farmer: FarmerProfile) => void;
  onTriggerCall: (farmer: FarmerProfile) => void;
  language: Language;
}

export const FarmerDirectoryView: React.FC<FarmerDirectoryViewProps> = ({
  farmers,
  activeFarmer,
  onSelectFarmer,
  onOpenRegisterModal,
  onEditFarmer,
  onTriggerCall,
  language,
}) => {
  const t = getT(language);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');

  const filtered = farmers.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm);
    
    const matchesCrop = cropFilter === 'ALL' || f.crop === cropFilter;
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Registered Farmers & Fields Directory</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Manage farmer profiles, soil characteristics, geospatial coordinates, and automated AI phone call permissions.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          data-guide="register-farmer"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.registerFarmer}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div data-guide="farmers" className="p-4 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, village, or district..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#112316] border border-[#1f472b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
            className="bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice (Paddy)">Rice (Paddy)</option>
            <option value="Cotton">Cotton</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Vegetables (Tomato/Onion)">Vegetables</option>
          </select>
        </div>
      </div>

      {/* Farmer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(farmer => {
          const isActive = farmer.id === activeFarmer.id;

          return (
            <div
              key={farmer.id}
              className={`rounded-2xl bg-[#0c1a11] border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-500 shadow-xl shadow-emerald-950/50 ring-1 ring-emerald-500'
                  : 'border-[#1b3d24] hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-800/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-base">
                      {farmer.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-display">{farmer.name}</h4>
                      <p className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        {farmer.village}, {farmer.district}, {farmer.state}
                      </p>
                    </div>
                  </div>

                  {farmer.consentForCalls ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Consent ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/60 flex items-center gap-1 shrink-0">
                      <ShieldAlert className="w-3 h-3" />
                      No Consent
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#112316] border border-[#1a3a22] space-y-1.5 text-xs text-stone-300 mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Crop:</span>
                    <span className="font-semibold text-emerald-300">{farmer.crop} ({farmer.farmArea} {farmer.areaUnit})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Growth Stage:</span>
                    <span className="font-semibold text-amber-300">{farmer.growthStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Soil:</span>
                    <span className="font-semibold text-white">{farmer.soilType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Phone:</span>
                    <span className="font-mono text-white">{farmer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Preferred Window:</span>
                    <span className="text-white text-[11px]">{farmer.preferredCallingWindow}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#173320]">
                <button
                  onClick={() => onSelectFarmer(farmer)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                    isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-[#142d1b] text-stone-300 hover:text-white'
                  }`}
                >
                  {isActive ? 'Active Field ✓' : 'Set Active'}
                </button>

                <button
                  onClick={() => onEditFarmer(farmer)}
                  className="p-2 rounded-lg bg-[#142d1b] hover:bg-[#1b3d25] text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onTriggerCall(farmer)}
                  disabled={!farmer.consentForCalls}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white transition-colors cursor-pointer"
                  title={farmer.consentForCalls ? 'Trigger AI Call' : 'Consent Required'}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
