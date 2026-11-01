/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  RefreshCw,
  User,
  Bot,
  MessageSquare
} from 'lucide-react';
import { CallRecord, FarmerProfile, Language, RiskAssessment } from '../types';

interface CallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: FarmerProfile;
  assessment?: RiskAssessment;
  language: Language;
  onCallCompleted: (record: CallRecord) => void;
}

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  isOpen,
  onClose,
  farmer,
  assessment,
  language,
  onCallCompleted,
}) => {
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [transcripts, setTranscripts] = useState<CallRecord['transcript']>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speechRecognitionRef = useRef<any>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const ringAudioRef = useRef<number | null>(null);

  // Initialize call when opened
  useEffect(() => {
    if (!isOpen) {
      setCallState('RINGING');
      setDuration(0);
      setTranscripts([]);
      setIsAiSpeaking(false);
      return;
    }

    // 1. Simulate Ringing phase for 2.5 seconds, then auto-connect
    setCallState('RINGING');
    const ringTimer = setTimeout(() => {
      setCallState('CONNECTED');
      initiateAiGreeting();
    }, 2400);

    return () => clearTimeout(ringTimer);
  }, [isOpen, farmer]);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (callState === 'CONNECTED') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, isAiSpeaking]);

  // AI Speech Synthesis helper
  const speakWithVoice = (text: string, lang: 'hi' | 'en') => {
    if (!('speechSynthesis' in window) || !isSpeakerOn) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Initial greeting from AI
  const initiateAiGreeting = () => {
    const isHi = farmer.preferredLanguage === 'hi';
    const greetHi = 'Namaste! Main KrishiSaathi AI ka automated farming assistant hoon. Kya aap abhi kheti se judi jaankari ke liye baat kar sakte hain?';
    const greetEn = 'Namaste! I am KrishiSaathi AI, an automated farming assistant. Would you like to talk about farming now?';

    const greetingText = isHi ? greetHi : greetEn;

    setTranscripts([
      {
        speaker: 'AI',
        textHi: greetHi,
        textEn: greetEn,
        timestamp: '00:02'
      }
    ]);

    speakWithVoice(greetingText, isHi ? 'hi' : 'en');
  };

  // Process user's speech or typed response and get Gemini AI reply
  const handleUserReply = async (textToSend: string) => {
    if (!textToSend.trim() || callState !== 'CONNECTED') return;

    const currentTimestamp = formatDuration(duration);
    const newTranscripts: CallRecord['transcript'] = [
      ...transcripts,
      {
        speaker: 'FARMER',
        textEn: textToSend,
        textHi: textToSend,
        timestamp: currentTimestamp
      }
    ];
    setTranscripts(newTranscripts);
    setUserInput('');
    setIsAiSpeaking(true);

    try {
      const res = await fetch('/api/calls/simulate-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: farmer.name,
          crop: farmer.crop,
          stage: farmer.growthStage,
          district: farmer.district,
          userSpeech: textToSend,
          language: farmer.preferredLanguage || 'hi',
          history: newTranscripts
        })
      });

      const data = await res.json();
      const spoken = data.spokenText || data.textHi || data.textEn;

      setTranscripts(prev => [
        ...prev,
        {
          speaker: 'AI',
          textEn: data.textEn || spoken,
          textHi: data.textHi || spoken,
          timestamp: formatDuration(duration + 1)
        }
      ]);

      speakWithVoice(spoken, farmer.preferredLanguage === 'hi' ? 'hi' : 'en');
    } catch (err) {
      console.error('Call simulate turn error:', err);
      setIsAiSpeaking(false);
    }
  };

  // Web Speech API Voice Recognition (Microphone)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use the quick response buttons or text input.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = farmer.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          handleUserReply(spoken);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setIsListening(false);
    }
  };

  // End Call & record in history
  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ENDED');

    const completedRecord: CallRecord = {
      id: `call-${Date.now()}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      phone: farmer.phone,
      district: farmer.district,
      state: farmer.state,
      crop: farmer.crop,
      callType: 'CRITICAL_ALERT',
      status: 'COMPLETED',
      startTime: new Date(Date.now() - duration * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: duration,
      isDemo: true,
      triggerReason: 'Browser-based call simulation. No phone call was placed.',
      aiBriefingEn: `Local browser voice simulation with ${farmer.name}.`,
      aiBriefingHi: `${farmer.name} के साथ स्थानीय ब्राउज़र कॉल सिमुलेशन।`,
      telephonyProvider: 'Demo Voice Synthesizer',
      transcript: transcripts
    };

    onCallCompleted(completedRecord);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Smartphone Frame UI */}
      <div className="w-full max-w-sm rounded-[36px] bg-[#061109] border-4 border-[#1c3e27] shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        {/* Phone Speaker Notch */}
        <div className="w-full pt-3 pb-1 flex justify-center bg-[#061109] shrink-0">
          <div className="w-20 h-3 rounded-full bg-[#162f1e] flex items-center justify-center">
            <div className="w-8 h-1 rounded-full bg-[#0a180e]"></div>
          </div>
        </div>

        {/* Top Caller Header */}
        <div className="text-center pt-3 pb-2 px-4 shrink-0 bg-gradient-to-b from-[#091a0e] to-transparent">
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-600/50 bg-amber-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            Simulation only — no phone call
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 mx-auto mb-2 shadow-lg shadow-emerald-950/80">
            <div className="w-full h-full bg-[#08150c] rounded-full flex items-center justify-center text-emerald-300 font-bold text-xl">
              {farmer.name[0]}
            </div>
          </div>

          <h3 className="text-base font-bold text-white font-display leading-tight">{farmer.name}</h3>
          <p className="text-xs text-emerald-400">{farmer.phone} • {farmer.district}</p>

          <div className="mt-1 flex items-center justify-center gap-2">
            {callState === 'RINGING' && (
              <span className="text-xs text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Ringing / डायल हो रहा है...
              </span>
            )}
            {callState === 'CONNECTED' && (
              <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected • {formatDuration(duration)}
              </span>
            )}
            {callState === 'ENDED' && (
              <span className="text-xs text-stone-400 font-semibold">Call Ended / कॉल समाप्त</span>
            )}
          </div>

          {/* Audio Visualizer Waveforms when AI speaks */}
          {callState === 'CONNECTED' && isAiSpeaking && (
            <div className="flex items-center justify-center gap-1 h-6 mt-2">
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-1"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-2"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-3"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-4"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-5"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-2"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-soundwave-4"></span>
              <span className="text-[10px] text-emerald-300 ml-2 font-mono">KrishiSaathi AI Speaking...</span>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs bg-[#07130a]/60">
          {transcripts.map((turn, i) => (
            <div
              key={i}
              className={`flex flex-col ${turn.speaker === 'AI' ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1 text-[9px] text-stone-500 mb-0.5">
                {turn.speaker === 'AI' ? <Bot className="w-3 h-3 text-emerald-400" /> : <User className="w-3 h-3 text-cyan-400" />}
                <span>{turn.speaker === 'AI' ? 'KrishiSaathi AI' : farmer.name}</span>
                <span>• {turn.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] p-2.5 rounded-2xl ${
                  turn.speaker === 'AI'
                    ? 'bg-[#112717] border border-[#1e4629] text-stone-100 rounded-tl-sm'
                    : 'bg-[#173a46] border border-[#23586b] text-cyan-100 rounded-tr-sm'
                }`}
              >
                <p className="leading-relaxed">
                  {farmer.preferredLanguage === 'hi' ? turn.textHi : turn.textEn}
                </p>
                {farmer.preferredLanguage === 'hi' && (
                  <p className="text-[9px] text-stone-400 mt-1 italic border-t border-white/10 pt-1">
                    EN: {turn.textEn}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div ref={transcriptBottomRef} />
        </div>

        {/* Quick Farmer Spoken Reply Shortcuts */}
        {callState === 'CONNECTED' && (
          <div className="px-3 py-1.5 bg-[#0a1b0f] border-t border-[#16361e] shrink-0">
            <div className="text-[10px] text-stone-400 mb-1 flex items-center justify-between">
              <span>Quick Spoken Replies:</span>
              <span className="text-emerald-400 text-[9px]">Tap or Speak</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => handleUserReply('हाँ मैं सुन रहा हूँ, कृपया बताएं क्या करना है?')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] whitespace-nowrap shrink-0 border border-[#20492c] cursor-pointer"
              >
                "हाँ सुन रहा हूँ, क्या करूँ?"
              </button>
              <button
                onClick={() => handleUserReply('क्या मैं अभी दोपहर में सिंचाई कर सकता हूँ?')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] whitespace-nowrap shrink-0 border border-[#20492c] cursor-pointer"
              >
                "क्या दोपहर में पानी दूँ?"
              </button>
              <button
                onClick={() => handleUserReply('फफूंद या कीट से बचाव के लिए कौन सी दवा स्प्रे करूँ?')}
                className="px-2 py-1 rounded bg-[#132c1b] hover:bg-[#1a3824] text-emerald-300 text-[10px] whitespace-nowrap shrink-0 border border-[#20492c] cursor-pointer"
              >
                "कीट से बचाव हेतु दवा?"
              </button>
            </div>
          </div>
        )}

        {/* Interactive Speech Input & Hangup Controls */}
        <div className="p-3 bg-[#08150c] border-t border-[#183921] shrink-0 space-y-2">
          {callState === 'CONNECTED' && (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUserReply(userInput)}
                placeholder={isListening ? 'Listening via microphone...' : 'Type spoken answer...'}
                className="flex-1 bg-[#0f2416] border border-[#1f472b] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleUserReply(userInput)}
                disabled={!userInput.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* In-Call Keypad Control Buttons */}
          <div className="flex items-center justify-around pt-1">
            <button
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#152e1c] text-emerald-300 hover:bg-[#1e4228]'
              }`}
              title={isListening ? 'Stop Mic' : 'Speak into Microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                !isSpeakerOn ? 'bg-amber-800 text-white' : 'bg-[#152e1c] text-emerald-300 hover:bg-[#1e4228]'
              }`}
              title={isSpeakerOn ? 'Mute AI Voice' : 'Unmute AI Voice'}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Red End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 flex items-center justify-center transition-all cursor-pointer"
              title="Hang Up Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
