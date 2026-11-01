/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CallRecord, FarmerProfile, Language, NASAObservation, RiskAssessment } from './types';
import { INITIAL_FARMERS, INITIAL_CALL_RECORDS } from './services/farmerStore';
import { fetchNASAObservations } from './services/nasaService';
import { assessClimateRisks } from './services/riskEngine';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { DashboardView } from './components/DashboardView';
import { SatelliteMap } from './components/SatelliteMap';
import { VoiceCallingModule } from './components/VoiceCallingModule';
import { AdvisorChat } from './components/AdvisorChat';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { FarmerDirectoryView } from './components/FarmerDirectoryView';
import { FarmerDirectoryModal } from './components/FarmerDirectoryModal';
import { KrishiSaathiGuide } from './components/KrishiSaathiGuide';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [farmers, setFarmers] = useState<FarmerProfile[]>(INITIAL_FARMERS);
  const [activeFarmer, setActiveFarmer] = useState<FarmerProfile>(INITIAL_FARMERS[0]);
  const [callRecords, setCallRecords] = useState<CallRecord[]>(INITIAL_CALL_RECORDS);

  const [observation, setObservation] = useState<NASAObservation | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<FarmerProfile | undefined>(undefined);

  // Load NASA telemetry and compute risks whenever active farmer changes
  const loadFarmerData = useCallback(async (farmer: FarmerProfile) => {
    setIsRefreshing(true);
    try {
      const obs = await fetchNASAObservations(farmer.latitude, farmer.longitude, farmer.crop);
      setObservation(obs);
      const risk = assessClimateRisks(farmer.crop, farmer.growthStage, farmer.soilType, obs);
      setAssessment(risk);
    } catch (err) {
      console.error('Error fetching NASA observations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFarmerData(activeFarmer);

    // Sync with backend API if available
    fetch('/api/farmers')
      .then(res => res.json())
      .then(data => {
        if (data.farmers && data.farmers.length > 0) {
          setFarmers(data.farmers);
        }
      })
      .catch(() => {});

  }, [loadFarmerData, activeFarmer]);

  // Handle switching active farmer
  const handleSelectFarmer = (farmer: FarmerProfile) => {
    setActiveFarmer(farmer);
    loadFarmerData(farmer);
  };

  // Handle save new or edited farmer
  const handleSaveFarmer = async (farmerData: Partial<FarmerProfile>) => {
    if (farmerData.id) {
      // Edit
      try {
        await fetch(`/api/farmers/${farmerData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmerData)
        });
      } catch (err) {}

      setFarmers(prev =>
        prev.map(f => (f.id === farmerData.id ? ({ ...f, ...farmerData } as FarmerProfile) : f))
      );
      if (activeFarmer.id === farmerData.id) {
        const updated = { ...activeFarmer, ...farmerData } as FarmerProfile;
        setActiveFarmer(updated);
        loadFarmerData(updated);
      }
    } else {
      // New
      const newFarmer: FarmerProfile = {
        ...farmerData,
        id: `farmer-${Date.now()}`,
        consentTimestamp: farmerData.consentForCalls ? new Date().toISOString() : '',
      } as FarmerProfile;

      try {
        await fetch('/api/farmers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFarmer)
        });
      } catch (err) {}

      setFarmers(prev => [newFarmer, ...prev]);
      setActiveFarmer(newFarmer);
      loadFarmerData(newFarmer);
    }
    setEditingFarmer(undefined);
  };

  // Dispatch call action
  const handleInitiateCall = async (input: {
    farmerId: string;
    phone: string;
    operatorToken: string;
    consentConfirmed: boolean;
  }): Promise<CallRecord> => {
    const res = await fetch('/api/calls/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.operatorToken}`,
      },
      body: JSON.stringify({
        farmerId: input.farmerId,
        phone: input.phone,
        consentConfirmed: input.consentConfirmed,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.callRecord) {
      setCallRecords(prev => [data.callRecord, ...prev.filter(record => record.id !== data.callRecord.id)]);
    }
    if (!res.ok || !data.callRecord) {
      throw new Error(data.message || data.error || 'Call request failed.');
    }
    return data.callRecord;
  };

  const handleCallCompleted = (completedRecord: CallRecord) => {
    setCallRecords(prev => [completedRecord, ...prev]);
  };

  const handleRefreshCallHistory = useCallback(async (operatorToken: string) => {
    const response = await fetch('/api/calls/history', {
      headers: { Authorization: `Bearer ${operatorToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Unable to load call history.');
    }
    if (!Array.isArray(data.calls)) {
      throw new Error('Call history response was invalid.');
    }
    setCallRecords(current => [
      ...data.calls,
      ...current.filter(record => record.isDemo),
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#070e09] text-[#e6f0e9] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={() => setLanguage(l => (l === 'en' ? 'hi' : 'en'))}
        activeFarmer={activeFarmer}
        farmers={farmers}
        onSelectFarmer={handleSelectFarmer}
        onOpenRegisterModal={() => {
          setEditingFarmer(undefined);
          setIsRegisterModalOpen(true);
        }}
        onOpenCallingModal={() => setCurrentTab('calling')}
        activeAssessment={assessment || undefined}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingHero
            farmer={activeFarmer}
            language={language}
            onNavigate={setCurrentTab}
            onOpenCallingModal={() => setCurrentTab('calling')}
          />
        )}

        {currentTab === 'dashboard' && observation && assessment && (
          <DashboardView
            farmer={activeFarmer}
            observation={observation}
            assessment={assessment}
            language={language}
            onRefreshData={() => loadFarmerData(activeFarmer)}
            isRefreshing={isRefreshing}
            onOpenCallingModal={() => setCurrentTab('calling')}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'map' && (
          <SatelliteMap
            farmers={farmers}
            activeFarmer={activeFarmer}
            onSelectFarmer={handleSelectFarmer}
            language={language}
          />
        )}

        {currentTab === 'calling' && (
          <VoiceCallingModule
            farmers={farmers}
            activeFarmer={activeFarmer}
            callRecords={callRecords}
            onInitiateCall={handleInitiateCall}
            onRefreshCallHistory={handleRefreshCallHistory}
            onCallCompleted={handleCallCompleted}
            language={language}
            activeAssessment={assessment || undefined}
          />
        )}

        {currentTab === 'advisor' && observation && assessment && (
          <AdvisorChat
            farmer={activeFarmer}
            observation={observation}
            assessment={assessment}
            language={language}
          />
        )}

        {currentTab === 'simulator' && observation && (
          <WhatIfSimulator
            observation={observation}
            initialCrop={activeFarmer.crop}
            initialStage={activeFarmer.growthStage}
            language={language}
          />
        )}

        {currentTab === 'directory' && (
          <FarmerDirectoryView
            farmers={farmers}
            activeFarmer={activeFarmer}
            onSelectFarmer={handleSelectFarmer}
            onOpenRegisterModal={() => {
              setEditingFarmer(undefined);
              setIsRegisterModalOpen(true);
            }}
            onEditFarmer={f => {
              setEditingFarmer(f);
              setIsRegisterModalOpen(true);
            }}
            onTriggerCall={f => {
              handleSelectFarmer(f);
              setCurrentTab('calling');
            }}
            language={language}
          />
        )}
      </main>

      {/* Farmer Registration / Edit Modal */}
      {isRegisterModalOpen && (
        <FarmerDirectoryModal
          isOpen={isRegisterModalOpen}
          onClose={() => {
            setIsRegisterModalOpen(false);
            setEditingFarmer(undefined);
          }}
          onSaveFarmer={handleSaveFarmer}
          existingFarmer={editingFarmer}
          language={language}
        />
      )}

      <KrishiSaathiGuide
        language={language}
        currentPage={currentTab}
        onNavigate={setCurrentTab}
      />
    </div>
  );
}
