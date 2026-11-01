/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  HelpCircle, 
  RefreshCw,
  Sprout,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { FarmerProfile, Language, NASAObservation, RiskAssessment } from '../types';
import { getT } from '../services/i18n';

interface AdvisorChatProps {
  farmer: FarmerProfile;
  observation: NASAObservation;
  assessment: RiskAssessment;
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  farmer,
  observation,
  assessment,
  language,
}) => {
  const t = getT(language);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: language === 'hi'
        ? `नमस्ते ${farmer.name} जी! मैं कृषिसाथी एआई कृषि सहायक हूँ। आपके ${farmer.district} स्थित ${farmer.crop} (अवस्था: ${farmer.growthStage}) के लिए नासा उपग्रह डेटा मेरे पास उपलब्ध है। आप मुझसे मौसम, सिंचाई, ताप-तनाव या कीट नियंत्रण संबंधी कोई भी प्रश्न हिंदी, अंग्रेजी या हिंग्लिश में पूछ सकते हैं।`
        : `Namaste ${farmer.name} ji! I am your KrishiSaathi AI Farming Assistant. I have the latest NASA satellite observations for your ${farmer.crop} in ${farmer.district} (Stage: ${farmer.growthStage}). Feel free to ask about irrigation timing, heatwaves, fertilizer schedules, or disease prevention in English or Hindi.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'KrishiSaathi AI Farming Assistant'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Suggested prompt questions
  const suggestedPrompts = language === 'hi' ? [
    `कल अधिकतम तापमान ${observation.temperatureMax.toFixed(1)}°C रहेगा, क्या मुझे अभी सिंचाई करनी चाहिए?`,
    `गेहूं/धान की फसल को गर्म हवा (Heat Stress) से कैसे बचाएं?`,
    `क्या वर्तमान नमी और तापमान में फफूंद लगने का खतरा है?`,
    `नासा के उपग्रह डेटा की सटीकता और सीमाएं क्या हैं?`
  ] : [
    `With max temp at ${observation.temperatureMax.toFixed(1)}°C, when should I irrigate my ${farmer.crop}?`,
    `How do I protect my crop against terminal heat stress during ${farmer.growthStage}?`,
    `What bio-fungicide or precautions should I take for high humidity?`,
    `Explain the scientific reasoning behind today's risk assessment.`
  ];

  // Send message to server-side Gemini endpoint
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          farmerProfile: farmer,
          environmentalContext: {
            tempMax: observation.temperatureMax,
            tempMin: observation.temperatureMin,
            rain24h: observation.precipitation24h,
            rain7d: observation.precipitation7d,
            soilMoistureRoot: observation.rootZoneSoilMoisture,
            soilMoistureTop: observation.surfaceSoilMoisture,
            rh: observation.relativeHumidity,
            ndvi: observation.ndvi,
            overallRisk: assessment.overallRiskLevel,
            factors: assessment.factors
          },
          language
        })
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || 'Guidance formulated based on NASA satellite readings.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || 'gemini-3.8-flash'
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Advisor chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: language === 'hi' 
            ? 'सर्वर से संपर्क करने में त्रुटि हुई। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
            : 'Error communicating with AI service. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Offline Fallback'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Input (Microphone via SpeechRecognition)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setInput(spoken);
          handleSendMessage(spoken);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Microphone error:', e);
      setIsListening(false);
    }
  };

  // Voice Output (SpeechSynthesis TTS)
  const toggleSpeechSynthesis = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div data-guide="advisor" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b3d24]">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>{t.advisorTitle}</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Grounded with active telemetry: {farmer.name} • {farmer.crop} ({farmer.growthStage}) in {farmer.district}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
            Powered by Gemini 3.8 Flash
          </span>
        </div>
      </div>

      {/* Suggested Inquiries Pills */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-stone-400">
          {t.suggestedQuestions}:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-left px-3 py-1.5 rounded-xl bg-[#0c1a11] hover:bg-[#132c1b] border border-[#1b3d24] text-xs text-stone-300 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="rounded-2xl bg-[#0a150e] border border-[#1b3d24] shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-sm'
                    : 'bg-[#0f2315] border border-[#1e4629] text-stone-200 rounded-tl-sm'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1.5">
                  <span className="font-semibold text-emerald-400">
                    {msg.sender === 'user' ? 'You' : msg.modelUsed || 'KrishiSaathi AI Farming Assistant'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => toggleSpeechSynthesis(msg.id, msg.text)}
                        className="text-stone-400 hover:text-white cursor-pointer ml-1"
                        title="Listen via Voice"
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-line text-stone-100">
                  {msg.text}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-[#0f2315] border border-[#1e4629] text-xs text-stone-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>KrishiSaathi AI is analyzing NASA telemetry & crop physiology...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Mic button */}
        <div className="p-3 sm:p-4 bg-[#08120a] border-t border-[#183921] flex items-center gap-2">
          <button
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isListening 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-[#122818] text-emerald-400 hover:bg-[#1a3823] border border-[#20492c]'
            }`}
            title={isListening ? 'Stop Mic' : 'Ask Question via Microphone'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(input)}
            placeholder={isListening ? t.advisorListening : t.advisorPlaceholder}
            className="flex-1 bg-[#0f2416] border border-[#1f472b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/70 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{t.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
