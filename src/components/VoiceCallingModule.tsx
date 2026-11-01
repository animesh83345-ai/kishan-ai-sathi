/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  PhoneCall, 
  PhoneMissed, 
  PhoneForwarded, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  FileText, 
  Settings2,
  LockKeyhole
} from 'lucide-react';
import { CallRecord, FarmerProfile, Language, RiskAssessment } from '../types';
import { getT } from '../services/i18n';
import { CallSimulatorModal } from './CallSimulatorModal';
import { normalizeIndianPhoneNumber } from '../services/phoneNumber';

interface VoiceCallingModuleProps {
  farmers: FarmerProfile[];
  activeFarmer: FarmerProfile;
  callRecords: CallRecord[];
  onInitiateCall: (input: {
    farmerId: string;
    phone: string;
    operatorToken: string;
    consentConfirmed: boolean;
  }) => Promise<CallRecord>;
  onRefreshCallHistory: (operatorToken: string) => Promise<void>;
  onCallCompleted: (record: CallRecord) => void;
  language: Language;
  activeAssessment?: RiskAssessment;
}

export const VoiceCallingModule: React.FC<VoiceCallingModuleProps> = ({
  farmers,
  activeFarmer,
  callRecords,
  onInitiateCall,
  onRefreshCallHistory,
  onCallCompleted,
  language,
  activeAssessment,
}) => {
  const t = getT(language);
  const [selectedFarmerId, setSelectedFarmerId] = useState(activeFarmer.id);
  const [phone, setPhone] = useState(activeFarmer.phone);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [operatorToken, setOperatorToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'FAILED'>('ALL');
  const [activeCallModal, setActiveCallModal] = useState<FarmerProfile | null>(null);
  const [viewingTranscript, setViewingTranscript] = useState<CallRecord | null>(null);
  const [callingMode, setCallingMode] = useState<'DEMO' | 'REAL'>('DEMO');
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [callSetup, setCallSetup] = useState<{ configured: boolean; missing: string[] } | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const selectedFarmer = farmers.find(f => f.id === selectedFarmerId) || activeFarmer;

  useEffect(() => {
    setSelectedFarmerId(activeFarmer.id);
    setPhone(activeFarmer.phone);
    setConsentConfirmed(false);
  }, [activeFarmer.id, activeFarmer.phone]);

  useEffect(() => {
    fetch('/api/calls/config')
      .then(async response => {
        if (!response.ok) throw new Error('Unable to check Exotel setup.');
        return response.json();
      })
      .then(data => setCallSetup({ configured: data.configured, missing: data.missing || [] }))
      .catch(error => setHistoryError(error.message || 'Unable to check Exotel setup.'));
  }, []);

  useEffect(() => {
    if (callingMode !== 'REAL' || !operatorToken.trim()) return;
    let active = true;
    const refresh = async () => {
      try {
        await onRefreshCallHistory(operatorToken);
        if (active) setHistoryError(null);
      } catch (error) {
        if (active) setHistoryError(error instanceof Error ? error.message : 'Unable to load call history.');
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 5_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [callingMode, operatorToken, onRefreshCallHistory]);

  // Filtered call records
  const filteredRecords = callRecords.filter(rec => {
    const matchesSearch = 
      rec.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.phone.includes(searchQuery) ||
      rec.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' && ['QUEUED', 'RINGING', 'IN_PROGRESS', 'STATUS_UNKNOWN'].includes(rec.status))
      || (statusFilter === 'COMPLETED' && rec.status === 'COMPLETED')
      || (statusFilter === 'FAILED' && ['FAILED', 'BUSY', 'NO_ANSWER'].includes(rec.status));
    return matchesSearch && matchesStatus;
  });

  // Call Statistics
  const totalCalls = callRecords.length;
  const completedCalls = callRecords.filter(c => c.status === 'COMPLETED').length;
  const inProgressCalls = callRecords.filter(c => ['QUEUED', 'RINGING', 'IN_PROGRESS', 'STATUS_UNKNOWN'].includes(c.status)).length;
  const failedCalls = callRecords.filter(c => ['FAILED', 'BUSY', 'NO_ANSWER'].includes(c.status)).length;

  const handleRealCall = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDispatchError(null);
    setDispatchMessage(null);

    const normalizedPhone = normalizeIndianPhoneNumber(phone);
    if (!normalizedPhone) {
      setDispatchError('Enter a valid Indian mobile number (10 digits or +91 followed by 10 digits).');
      return;
    }
    if (!selectedFarmer.consentForCalls || !selectedFarmer.consentTimestamp) {
      setDispatchError('This farmer does not have timestamped call consent on file. Do not call until consent is obtained and recorded.');
      return;
    }
    if (!consentConfirmed) {
      setDispatchError('Confirm that the farmer agreed to receive this call before continuing.');
      return;
    }
    if (!operatorToken.trim()) {
      setDispatchError('Enter the authorized operator access token configured on the server.');
      return;
    }

    setIsDispatching(true);
    try {
      const callRecord = await onInitiateCall({
        farmerId: selectedFarmer.id,
        phone: normalizedPhone,
        operatorToken,
        consentConfirmed,
      });
      setDispatchMessage(`Exotel accepted the request. Current provider status: ${callRecord.status}. A queued request does not mean the farmer answered.`);
      setConsentConfirmed(false);
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : 'Call request failed.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Title & Telephony Mode Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-2.5">
            <PhoneCall className="w-7 h-7 text-emerald-400" />
            <span>{t.callingTitle}</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Make a single, operator-initiated Exotel call only after verifying the registered number and farmer consent. The local demo never places a phone call.
          </p>
        </div>

        {/* Calling Mode Toggle (Requirement 9.E) */}
        <div data-guide="calling" className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <button
            onClick={() => setCallingMode('DEMO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              callingMode === 'DEMO'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {t.simulatedModeBadge}
          </button>
          <button
            onClick={() => setCallingMode('REAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              callingMode === 'REAL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {t.realTelephonyBadge}
          </button>
        </div>
      </div>

      {/* Real Telephony Setup Notice */}
      {callingMode === 'REAL' && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
          <Settings2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">Exotel AgentStream: account setup and live-call testing required</div>
            <p className="text-stone-300 mt-0.5 leading-relaxed">
              This app bridges Exotel bidirectional audio to Gemini Live. No real call will be shown as successful unless Exotel returns a call ID; final outcomes come from Exotel status callbacks. Verify Exotel account region, caller ID, public HTTPS/WSS endpoints, and local calling rules before testing.
            </p>
            {callSetup && !callSetup.configured && (
              <p className="mt-2 text-amber-100">Not configured. Missing server settings: {callSetup.missing.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Summary KPI Cards (Requirement 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Total Calls</span>
            <PhoneForwarded className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-display">{totalCalls}</div>
          <div className="text-[10px] text-stone-400 mt-1">Individual real calls and marked demos</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display">{completedCalls}</div>
          <div className="text-[10px] text-stone-400 mt-1">
            Includes local demo records
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>In-Progress / Ringing</span>
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-display">{inProgressCalls}</div>
          <div className="text-[10px] text-stone-400 mt-1">Queued, ringing, or active</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1a11] border border-[#1b3d24]">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Missed / Failed</span>
            <PhoneMissed className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-display">{failedCalls}</div>
          <div className="text-[10px] text-stone-400 mt-1">Busy, no answer, or failed</div>
        </div>
      </div>

      {/* Outbound Dispatcher Panel & Farmer Consent Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Controller */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#183921]">
              <h3 className="text-base font-bold text-white font-display">
                {callingMode === 'DEMO' ? 'Local Call Simulator' : 'Call One Farmer'}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                callingMode === 'DEMO'
                  ? 'text-emerald-400 bg-emerald-950 border-emerald-800/60'
                  : 'text-amber-300 bg-amber-950/70 border-amber-700/60'
              }`}>
                {callingMode === 'DEMO' ? 'NO PHONE CALL' : 'EXOTEL'}
              </span>
            </div>

            {/* Farmer Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Target Farmer Recipient:
              </label>
              <select
                value={selectedFarmerId}
                onChange={e => {
                  const farmer = farmers.find(item => item.id === e.target.value);
                  setSelectedFarmerId(e.target.value);
                  setPhone(farmer?.phone || '');
                  setConsentConfirmed(false);
                  setDispatchError(null);
                  setDispatchMessage(null);
                }}
                className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {farmers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.phone} ({f.crop}, {f.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Details & Compliance Verification */}
            <div className="p-3.5 rounded-xl bg-[#112316] border border-[#1f472b] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Consent Verification:</span>
                {selectedFarmer.consentForCalls && selectedFarmer.consentTimestamp ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t.consentGranted}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t.consentRequired}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Preferred Language:</span>
                <span className="font-semibold text-white">
                  {selectedFarmer.preferredLanguage === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Calling Window:</span>
                <span className="font-semibold text-white">
                  {selectedFarmer.preferredCallingWindow}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Current Crop Stage:</span>
                <span className="font-semibold text-amber-300">
                  {selectedFarmer.crop} ({selectedFarmer.growthStage})
                </span>
              </div>
              <div className="text-[10px] text-stone-400">
                Consent record: {selectedFarmer.consentForCalls && selectedFarmer.consentTimestamp ? selectedFarmer.consentTimestamp : 'Not recorded'}
              </div>
            </div>

            {callingMode === 'DEMO' ? (
              <div data-guide="call-demo" className="space-y-3">
                <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-3 text-xs text-emerald-100">
                  This runs the browser simulator only. It does not dial a phone, and its status is labeled DEMO.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCallModal(selectedFarmer)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/70 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  Run local demo — no phone call
                </button>
              </div>
            ) : (
              <form data-guide="exotel-call" onSubmit={handleRealCall} className="space-y-3">
                <div>
                  <label htmlFor="farmer-phone" className="block text-xs font-medium text-stone-300 mb-1.5">
                    Farmer phone number (India)
                  </label>
                  <input
                    id="farmer-phone"
                    type="tel"
                    autoComplete="off"
                    value={phone}
                    onChange={event => {
                      setPhone(event.target.value);
                      setConsentConfirmed(false);
                    }}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#112316] border border-[#1f472b] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <p className="mt-1 text-[10px] text-stone-400">Must match the selected farmer’s registered number. Only Indian mobile numbers are accepted.</p>
                </div>

                <div>
                  <label htmlFor="operator-token" className="block text-xs font-medium text-stone-300 mb-1.5">
                    Authorized operator access token
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
                    <input
                      id="operator-token"
                      type="password"
                      autoComplete="current-password"
                      value={operatorToken}
                      onChange={event => setOperatorToken(event.target.value)}
                      placeholder="Set CALL_OPERATOR_TOKEN on the server"
                      className="w-full bg-[#112316] border border-[#1f472b] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-stone-400">Kept only in this page’s memory; sent to your backend over HTTPS, never to Exotel.</p>
                </div>

                <label className="flex items-start gap-2 rounded-xl border border-[#234d2c] bg-[#09150d] p-3 text-xs text-stone-200">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={event => setConsentConfirmed(event.target.checked)}
                    disabled={!selectedFarmer.consentForCalls || !selectedFarmer.consentTimestamp}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <span>I confirm that this farmer agreed to receive this automated call now. I am authorized to contact this registered number.</span>
                </label>

                {callSetup && !callSetup.configured && (
                  <div className="rounded-xl border border-amber-600/40 bg-amber-950/30 p-3 text-xs text-amber-200">
                    No call can be placed until the server setup is complete. Missing: {callSetup.missing.join(', ')}
                  </div>
                )}
                {historyError && (
                  <div role="alert" className="rounded-xl border border-amber-600/40 bg-amber-950/30 p-3 text-xs text-amber-200">
                    {historyError}
                  </div>
                )}
                {dispatchError && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/50 text-xs text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p>{dispatchError}</p>
                  </div>
                )}
                {dispatchMessage && (
                  <div role="status" className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-3 text-xs text-emerald-200">
                    {dispatchMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isDispatching
                    || !callSetup?.configured
                    || !selectedFarmer.consentForCalls
                    || !selectedFarmer.consentTimestamp
                    || !consentConfirmed
                  }
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-950/70 flex items-center justify-center gap-2 transition-all"
                >
                  {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                  {isDispatching ? 'Contacting Exotel…' : `Call ${selectedFarmer.name}`}
                </button>
                <p className="text-[10px] text-stone-400 text-center">One farmer per request. There is no bulk or automatic dialing.</p>
              </form>
            )}

          </div>
        </div>

        {/* Right: Call Records & Transcripts Table (Requirement 10) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#183921]">
              <h3 className="text-base font-bold text-white font-display">
                {t.callHistory}
              </h3>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08120a] border border-[#183921] text-[11px]">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  All ({callRecords.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'ACTIVE' ? 'bg-cyan-700 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Active ({inProgressCalls})
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'COMPLETED' ? 'bg-green-700 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setStatusFilter('FAILED')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'FAILED' ? 'bg-rose-700 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Failed
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="pt-3 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by farmer name, district, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#112316] border border-[#1f472b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Table of Records */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-[#09150d] text-stone-400 font-semibold border-b border-[#183921]">
                  <tr>
                    <th className="py-2.5 px-3">Farmer</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152e1c]">
                  {filteredRecords.map(call => (
                    <tr key={call.id} className="hover:bg-[#112417] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{call.farmerName}</div>
                        <div className="text-[10px] text-stone-400">{call.district} • {call.phone}</div>
                        {call.providerCallId && <div className="text-[10px] font-mono text-stone-500">Exotel ID: {call.providerCallId}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <div className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border ${
                          call.isDemo
                            ? 'bg-stone-900 text-stone-300 border-stone-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        }`}>
                          {call.isDemo ? 'DEMO' : 'EXOTEL'}
                        </div>
                        <div className="mt-1 text-[10px] text-stone-400">{call.callType.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          call.status === 'COMPLETED'
                            ? 'text-green-400 bg-green-950/80 border border-green-800/50'
                            : ['QUEUED', 'RINGING', 'IN_PROGRESS'].includes(call.status)
                            ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-800/50'
                            : call.status === 'STATUS_UNKNOWN'
                            ? 'text-amber-300 bg-amber-950/80 border border-amber-700/50'
                            : 'text-rose-400 bg-rose-950/80 border border-rose-800/50'
                        }`}>
                          {call.status}
                        </span>
                        {call.failureReason && <div className="mt-1 max-w-48 text-[10px] text-amber-200">{call.failureReason}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {call.durationSeconds > 0 ? `${call.durationSeconds}s` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setViewingTranscript(call)}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View ({call.transcript.length})</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="py-8 text-center text-stone-500 text-xs">
                  No call records match the search filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Inspection Modal */}
      {viewingTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1a11] border border-[#1b3d24] shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#183921] shrink-0">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Call Transcript: {viewingTranscript.farmerName}
                </h3>
                <p className="text-xs text-stone-400">
                  {viewingTranscript.district} • {viewingTranscript.startTime?.slice(0, 10)} • {viewingTranscript.durationSeconds}s duration
                </p>
              </div>
              <button
                onClick={() => setViewingTranscript(null)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-[#132819] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#112417] text-xs text-stone-300 border border-[#1d4727] shrink-0">
              <strong className="text-emerald-400">AI Trigger Reason: </strong>
              {viewingTranscript.triggerReason}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
              {viewingTranscript.transcript.map((t, idx) => (
                <div key={idx} className={`p-3 rounded-xl ${t.speaker === 'AI' ? 'bg-[#0f2315] border border-[#1e4629]' : 'bg-[#142e37] border border-[#214a58]'}`}>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                    <span className="font-bold text-white">{t.speaker === 'AI' ? 'KrishiSaathi AI Agent' : viewingTranscript.farmerName}</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p className="text-stone-100">{t.textHi || t.textEn}</p>
                  {t.textHi && t.textEn && t.textEn !== t.textHi && (
                    <p className="text-[10px] text-stone-400 mt-1 italic border-t border-white/5 pt-1">
                      EN: {t.textEn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive In-Call Smartphone Simulator Modal */}
      {activeCallModal && (
        <CallSimulatorModal
          isOpen={Boolean(activeCallModal)}
          onClose={() => setActiveCallModal(null)}
          farmer={activeCallModal}
          assessment={activeAssessment}
          language={language}
          onCallCompleted={onCallCompleted}
        />
      )}
    </div>
  );
};
