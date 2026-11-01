import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Leaf,
  Maximize2,
  Mic,
  Minimize2,
  MousePointerClick,
  Pause,
  Play,
  Route,
  Search,
  Send,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type { Language } from '../types';
import {
  findGuideFeature,
  GUIDE_FEATURES,
  GUIDE_FEATURE_BY_ID,
  GUIDE_TOUR_FEATURE_IDS,
  type GuideFeature,
  type GuidePage,
} from '../services/guideFeatures';

interface KrishiSaathiGuideProps {
  language: Language;
  currentPage: string;
  onNavigate: (page: GuidePage) => void;
}

function findFeatureForTarget(targetId: string): GuideFeature | undefined {
  return GUIDE_FEATURE_BY_ID.get(targetId)
    || GUIDE_FEATURES.find(feature => feature.guideTarget === targetId)
    || (targetId.startsWith('nav-') ? GUIDE_FEATURE_BY_ID.get(targetId.slice(4)) : undefined);
}

interface GuideMessage {
  id: number;
  role: 'guide' | 'user';
  text: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

function isHindiQuestion(text: string): boolean {
  return /[\u0900-\u097f]|\b(kya|kaise|kahan|kholo|kholiye|dikhao|dikhaiye|samjha|hai|ka|ki|ke|mujhe|batao|chalo)\b/i.test(text);
}

function isNavigationRequest(text: string): boolean {
  return /\b(open|show|go to|navigate|take me|kholo|kholiye|dikhao|dikhaiye|chalo|le chalo)\b/i.test(text)
    || /जाओ|खोलो|खोलिए|दिखाओ|दिखाइए|चलो/.test(text);
}

function getModeLabel(mode: GuideFeature['mode'], language: Language): string {
  const labels = {
    en: { live: 'Available', mixed: 'Live + rule-based', simulated: 'Scenario simulation', demo: 'Local demo', optional: 'Optional integration' },
    hi: { live: 'उपलब्ध', mixed: 'लाइव + नियम-आधारित', simulated: 'परिदृश्य सिमुलेशन', demo: 'स्थानीय डेमो', optional: 'वैकल्पिक इंटीग्रेशन' },
  };
  return labels[language][mode];
}

function getFeatureText(feature: GuideFeature, language: Language): string {
  const status = language === 'hi'
    ? `स्थिति: ${getModeLabel(feature.mode, language)}`
    : `Availability: ${getModeLabel(feature.mode, language)}`;
  if (language === 'hi') {
    return `${status}\n\n${feature.descriptionHi}\n\n${feature.purposeHi}\n\n${feature.instructionsHi}\n\n${feature.inputsHi}\n\n${feature.resultsHi}`;
  }
  return `${status}\n\n${feature.description}\n\n${feature.purpose}\n\n${feature.instructions}\n\n${feature.inputs}\n\n${feature.results}`;
}

function getSectionTitle(language: Language, section: 'purpose' | 'instructions' | 'inputs' | 'results'): string {
  const titles = {
    en: { purpose: 'Purpose', instructions: 'How to use it', inputs: 'What you need', results: 'What you will see' },
    hi: { purpose: 'उद्देश्य', instructions: 'इस्तेमाल कैसे करें', inputs: 'क्या चाहिए', results: 'क्या दिखेगा' },
  };
  return titles[language][section];
}

function findVisibleTarget(feature: GuideFeature): HTMLElement | null {
  const targets = document.querySelectorAll<HTMLElement>(`[data-guide="${feature.guideTarget}"]`);
  return Array.from(targets).find(target => target.getClientRects().length > 0) || null;
}

function scrollToTarget(target: HTMLElement): void {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  target.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
}

const TOUR_IDS = [...GUIDE_TOUR_FEATURE_IDS];

export const KrishiSaathiGuide: React.FC<KrishiSaathiGuideProps> = ({
  language,
  currentPage,
  onNavigate,
}) => {
  const isHindi = language === 'hi';
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<GuideFeature | null>(null);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [isSelectingOnPage, setIsSelectingOnPage] = useState(false);
  const [tourIndex, setTourIndex] = useState(-1);
  const [tourNotice, setTourNotice] = useState('');
  const [tourTarget, setTourTarget] = useState<HTMLElement | null>(null);
  const [tourComplete, setTourComplete] = useState(false);
  const [robotMotion, setRobotMotion] = useState<'idle' | 'walking' | 'pointing' | 'talking'>('idle');
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const messageId = useRef(0);
  const tourRunId = useRef(0);
  const speechRecognition = useRef<SpeechRecognitionLike | null>(null);
  const latestSpeechText = useRef('');

  const filteredFeatures = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return GUIDE_FEATURES;
    return GUIDE_FEATURES.filter(feature => [
      feature.title,
      feature.titleHi,
      feature.description,
      feature.descriptionHi,
      ...feature.keywords,
    ].some(value => value.toLocaleLowerCase().includes(term)));
  }, [query]);

  const addMessage = useCallback((role: GuideMessage['role'], text: string) => {
    messageId.current += 1;
    if (role === 'guide') latestSpeechText.current = text;
    setMessages(current => [...current, { id: messageId.current, role, text }]);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      setVoiceNotice(isHindi ? 'इस ब्राउज़र में आवाज़ पढ़ने की सुविधा नहीं है। जवाब टेक्स्ट में उपलब्ध है।' : 'Read-aloud is unavailable in this browser. The answer is available as text.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097f]/.test(text) || isHindiQuestion(text) ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setSpeechState('idle');
    utterance.onerror = () => {
      setSpeechState('idle');
      setVoiceNotice(isHindi ? 'आवाज़ नहीं चल सकी; जवाब टेक्स्ट में उपलब्ध है।' : 'Audio playback failed; the answer is available as text.');
    };
    latestSpeechText.current = text;
    setVoiceNotice('');
    setSpeechState('speaking');
    window.speechSynthesis.speak(utterance);
  }, [isHindi]);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeechState('idle');
  }, []);

  const startListening = useCallback(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceNotice(isHindi ? 'माइक्रोफ़ोन से लिखने की सुविधा इस ब्राउज़र में उपलब्ध नहीं है। सवाल नीचे टाइप करें।' : 'Speech input is unavailable in this browser. Type your question below instead.');
      return;
    }

    speechRecognition.current?.stop();
    const recognition = new Recognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = event => {
      const transcript = Array.from(event.results)
        .filter(result => result.isFinal)
        .map(result => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (transcript) setQuestion(current => `${current}${current ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = () => {
      setVoiceNotice(isHindi ? 'माइक्रोफ़ोन इनपुट उपलब्ध नहीं हुआ। सवाल टाइप करके पूछें।' : 'Microphone input was unavailable. Type your question instead.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    speechRecognition.current = recognition;
    setVoiceNotice(isHindi ? 'अब अपना सवाल बोलें।' : 'Listening—speak your question now.');
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNotice(isHindi ? 'माइक्रोफ़ोन शुरू नहीं हो सका। सवाल टाइप करके पूछें।' : 'The microphone could not start. Type your question instead.');
    }
  }, [isHindi]);

  useEffect(() => () => {
    speechRecognition.current?.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const explainFeature = useCallback((feature: GuideFeature) => {
    setSelectedFeature(feature);
    setAnswerError('');
    addMessage('guide', `${isHindi ? feature.titleHi : feature.title}\n${getFeatureText(feature, language)}`);
  }, [addMessage, isHindi, language]);

  const waitForTarget = useCallback(async (feature: GuideFeature, runId: number) => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (tourRunId.current !== runId) return null;
      const target = findVisibleTarget(feature);
      if (target) return target;
      await new Promise(resolve => window.setTimeout(resolve, 100));
    }
    return null;
  }, []);

  const moveTourTo = useCallback(async (startIndex: number, direction: 1 | -1 = 1) => {
    const runId = ++tourRunId.current;
    const count = TOUR_IDS.length;
    let index = startIndex;
    let missingTitle = '';
    setTourComplete(false);
    setRobotMotion('walking');

    while (index >= 0 && index < count) {
      const feature = GUIDE_FEATURE_BY_ID.get(TOUR_IDS[index]);
      if (!feature) {
        index += direction;
        continue;
      }

      if (currentPage !== feature.page) onNavigate(feature.page);
      const target = await waitForTarget(feature, runId);
      if (tourRunId.current !== runId) return;
      if (target) {
        scrollToTarget(target);
        await new Promise(resolve => window.setTimeout(resolve, 300));
        if (tourRunId.current !== runId) return;
        setTourIndex(index);
        setTourTarget(target);
        setRobotMotion('pointing');
        setTourNotice(missingTitle
          ? (isHindi ? `कुछ हिस्सा उपलब्ध नहीं था, उसे छोड़ दिया: ${missingTitle}` : `A section was unavailable and was skipped: ${missingTitle}`)
          : '');
        return;
      }

      missingTitle = isHindi ? feature.titleHi : feature.title;
      index += direction;
    }

    if (missingTitle) {
      setTourNotice(isHindi
        ? `यह हिस्सा अभी नहीं दिख रहा: ${missingTitle}। बाकी टूर जारी रखें या समाप्त करें।`
        : `This section is not currently available: ${missingTitle}. Continue or finish the tour.`);
    } else if (direction === 1) {
      setTourComplete(true);
      setTourNotice(isHindi
        ? `टूर पूरा हुआ! हमने ऐप के ${count} मुख्य चरण देखे। अब नीचे कोई फीचर चुनें या चैट में पूछें—आप किस हिस्से को और समझना चाहेंगे?`
        : `Tour complete! We explored ${count} main steps in the app. Choose a feature below or ask in chat—which part would you like to explore next?`);
    }
    setTourTarget(null);
    setTourIndex(direction === 1 ? count : -1);
    setRobotMotion('idle');
  }, [currentPage, isHindi, onNavigate, waitForTarget]);

  const startTour = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsSelectingOnPage(false);
    setTourIndex(-1);
    setTourComplete(false);
    setTourNotice('');
    addMessage('guide', isHindi
      ? 'नमस्ते! मैं KrishiSaathi Guide हूँ। चलिए उपलब्ध पेज और मुख्य टूल देखते हैं। हर चरण में अगला/पिछला चुनें, टूर छोड़ें या समाप्त करें।'
      : 'Namaste! I’m KrishiSaathi Guide. Let’s explore the pages and main tools available in this app. Use Next or Previous, or skip/finish whenever you like.');
    void moveTourTo(0);
  }, [addMessage, isHindi, moveTourTo]);

  const stopTour = useCallback(() => {
    tourRunId.current += 1;
    setTourIndex(-1);
    setTourTarget(null);
    setTourNotice('');
    setTourComplete(false);
    setRobotMotion('idle');
  }, []);

  const openFeature = useCallback((feature: GuideFeature) => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsSelectingOnPage(false);
    setSelectedFeature(feature);
    onNavigate(feature.page);
    addMessage('guide', `${isHindi ? feature.titleHi : feature.title}\n${getFeatureText(feature, language)}`);
    const runId = ++tourRunId.current;
    setRobotMotion('walking');
    void waitForTarget(feature, runId).then(target => {
      if (!target || tourRunId.current !== runId) return;
      scrollToTarget(target);
      target.setAttribute('data-guide-highlight', 'true');
      setRobotMotion('pointing');
      window.setTimeout(() => target.removeAttribute('data-guide-highlight'), 2200);
    }).finally(() => {
      if (tourRunId.current === runId) setRobotMotion('idle');
    });
  }, [addMessage, isHindi, language, onNavigate, waitForTarget]);

  const handleAsk = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || isAnswering) return;

    const matchedFeature = /\bclimate\b/i.test(text) && !/\b(weather|forecast)\b/i.test(text)
      ? GUIDE_FEATURE_BY_ID.get('climate-simulator') || selectedFeature
      : findGuideFeature(text) || selectedFeature;
    const responseLanguage = isHindiQuestion(text) ? 'hi' : language;
    setQuestion('');
    setAnswerError('');
    setVoiceNotice('');
    addMessage('user', text);

    if (matchedFeature && isNavigationRequest(text)) {
      stopTour();
      openFeature(matchedFeature);
      return;
    }

    setIsAnswering(true);
    setRobotMotion('talking');

    try {
      const response = await fetch('/api/guide/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          featureId: matchedFeature?.id || '',
          language: responseLanguage,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.reply !== 'string') throw new Error('AI guide is unavailable.');
      addMessage('guide', payload.reply);
    } catch {
      const fallbackFeature = matchedFeature;
      const unavailableFeature = /\b(crop doctor|mandi prices?|mandi bhav|मंडी|फसल डॉक्टर)\b/i.test(text);
      const fallback = unavailableFeature
        ? (responseLanguage === 'hi'
          ? 'Crop Doctor और Mandi Prices इस ऐप में उपलब्ध नहीं हैं। मैं केवल यहाँ मौजूद सुविधाओं की जानकारी दे सकती हूँ।'
          : 'Crop Doctor and Mandi Prices are not available in this app. I can explain only the features that are present.')
        : fallbackFeature
        ? getFeatureText(fallbackFeature, responseLanguage)
        : (responseLanguage === 'hi'
          ? `मैं इस ऐप के उपलब्ध विकल्प बता सकती हूँ: फार्म डैशबोर्ड, मौसम, उपग्रह मानचित्र, किसान सूची, AI सलाहकार, जलवायु सिम्युलेटर और कॉल सेंटर। जिस विकल्प के बारे में जानना है, उसे खोजें या उसका नाम लिखें।`
          : `I can explain the features present here: Farm Dashboard, Weather, Satellite Map, Farmer Directory, AI Advisor, Climate Simulator, and Calling Center. Search for a feature or name the option you want to understand.`);
      addMessage('guide', fallback);
      setAnswerError(isHindi ? 'AI जवाब अभी उपलब्ध नहीं; ऐप की जानकारी से उत्तर दिया।' : 'AI answers are unavailable; this answer uses the built-in feature guide.');
    } finally {
      setIsAnswering(false);
      setRobotMotion(tourIndex >= 0 ? 'pointing' : 'idle');
    }
  }, [addMessage, isAnswering, isHindi, language, openFeature, question, selectedFeature, stopTour, tourIndex]);

  useEffect(() => {
    if (!isSelectingOnPage) return;
    const capturePageClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || panelRef.current?.contains(target)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const markedElement = target.closest<HTMLElement>('[data-guide]');
      const guideId = markedElement?.dataset.guide;
      const feature = guideId ? findFeatureForTarget(guideId) : undefined;
      setIsSelectingOnPage(false);
      if (feature) {
        explainFeature(feature);
      } else {
        addMessage('guide', isHindi
          ? 'इस विकल्प के लिए अभी विवरण नहीं है। सूची में से कोई मुख्य फीचर चुनें।'
          : 'This control does not have a guide entry yet. Choose a feature from the list instead.');
      }
    };
    document.addEventListener('click', capturePageClick, true);
    return () => document.removeEventListener('click', capturePageClick, true);
  }, [addMessage, explainFeature, isHindi, isSelectingOnPage]);

  useEffect(() => {
    if (tourTarget && !tourTarget.isConnected) setTourTarget(null);
  }, [currentPage, tourTarget]);

  useEffect(() => {
    if (!tourTarget) return;
    tourTarget.setAttribute('data-guide-active', 'true');
    const updateTargetPosition = () => {
      if (!tourTarget.isConnected) setTourTarget(null);
    };
    window.addEventListener('resize', updateTargetPosition);
    return () => {
      tourTarget.removeAttribute('data-guide-active');
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [tourTarget]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSelectingOnPage) setIsSelectingOnPage(false);
        else if (tourIndex >= 0) stopTour();
        else if (isOpen) {
          speechRecognition.current?.stop();
          setIsListening(false);
          stopSpeech();
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSelectingOnPage, stopSpeech, stopTour, tourIndex]);

  const currentTourFeature = tourIndex >= 0 && tourIndex < TOUR_IDS.length
    ? GUIDE_FEATURE_BY_ID.get(TOUR_IDS[tourIndex])
    : undefined;

  const tourPosition = useMemo(() => {
    if (!tourTarget) return undefined;
    const rect = tourTarget.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const top = rect.bottom + 12 + 190 < window.innerHeight
      ? rect.bottom + 12
      : Math.max(12, rect.top - 210);
    return { left, top, width };
  }, [tourTarget, tourIndex]);

  return (
    <>
      {isSelectingOnPage && (
        <div className="fixed bottom-24 right-4 z-[69] rounded-xl border border-emerald-500/60 bg-[#0b1c11] px-4 py-3 text-xs text-emerald-100 shadow-xl">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-emerald-400" />
            <span>{isHindi ? 'समझाने के लिए किसी फीचर पर क्लिक करें।' : 'Click a feature to see its explanation.'}</span>
            <button type="button" onClick={() => setIsSelectingOnPage(false)} aria-label={isHindi ? 'चयन रद्द करें' : 'Cancel selection'} className="rounded p-1 hover:bg-white/10">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {((currentTourFeature && tourTarget && tourPosition) || (tourNotice && tourIndex >= 0)) && (
        <div
          className="guide-tour-card fixed z-[68] rounded-2xl border border-emerald-400/50 bg-[#0b1a10] p-4 text-xs text-stone-200 shadow-2xl"
          style={tourPosition
            ? { left: tourPosition.left, top: tourPosition.top, width: tourPosition.width }
            : { right: 24, bottom: 24, width: 'min(360px, calc(100vw - 24px))' }}
          role="region"
          aria-label={isHindi ? 'वेबसाइट गाइड टूर' : 'Website guide tour'}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-emerald-300">
              {currentTourFeature
                ? (isHindi ? currentTourFeature.titleHi : currentTourFeature.title)
                : (tourComplete ? (isHindi ? 'टूर पूरा हुआ' : 'Tour complete') : (isHindi ? 'टूर की जानकारी' : 'Tour update'))}
              <span className="ml-2 text-[10px] font-medium text-stone-400">
                {tourComplete ? TOUR_IDS.length : Math.min(tourIndex + 1, TOUR_IDS.length)}/{TOUR_IDS.length}
              </span>
            </div>
            <button type="button" onClick={stopTour} aria-label={isHindi ? 'टूर बंद करें' : 'Close tour'} className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          {tourComplete
            ? <p className="mt-2 leading-relaxed">{tourNotice}</p>
            : currentTourFeature && <p className="mt-2 leading-relaxed">{isHindi ? currentTourFeature.descriptionHi : currentTourFeature.description}</p>}
          {tourNotice && <p role="status" className="mt-2 text-amber-200">{tourNotice}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => void moveTourTo(tourIndex - 1, -1)} disabled={tourIndex <= 0} className="inline-flex items-center gap-1 rounded-lg border border-[#31543a] px-2.5 py-1.5 disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" />{isHindi ? 'पिछला' : 'Previous'}
              </button>
              <button type="button" onClick={() => void moveTourTo(tourIndex + 1)} disabled={tourIndex >= TOUR_IDS.length - 1} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 hover:bg-emerald-600 disabled:opacity-40">
                {isHindi ? 'अगला' : 'Next'}<ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void moveTourTo(tourIndex + 1)} disabled={tourIndex >= TOUR_IDS.length - 1} className="rounded-lg px-2 py-1.5 text-stone-300 hover:bg-white/10 disabled:opacity-40">{isHindi ? 'छोड़ें' : 'Skip'}</button>
              <button type="button" onClick={stopTour} className="rounded-lg px-2 py-1.5 font-semibold text-emerald-300 hover:bg-white/10">{isHindi ? 'समाप्त' : 'Finish'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {isOpen && (
          <section
            ref={panelRef}
            className={`guide-panel flex w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-emerald-700/60 bg-[#09140c]/[.98] shadow-[0_24px_80px_rgba(0,0,0,.65)] backdrop-blur-xl ${isMinimized ? 'h-auto' : 'h-[min(640px,calc(100dvh-8rem))]'}`}
            aria-label={isHindi ? 'KrishiSaathi Guide मदद' : 'KrishiSaathi Guide help'}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-900/80 bg-gradient-to-r from-[#102b19] to-[#0b1a10] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`guide-avatar guide-robot guide-robot--${robotMotion} relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500/30 to-lime-500/10 text-emerald-200 shadow-lg shadow-emerald-950`} data-motion={robotMotion} aria-hidden="true">
                  <Bot className="guide-robot__body h-6 w-6" />
                  <span className="guide-robot__arm guide-robot__arm--left" />
                  <span className="guide-robot__arm guide-robot__arm--right" />
                  <span className="guide-robot__leg guide-robot__leg--left" />
                  <span className="guide-robot__leg guide-robot__leg--right" />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b1a10] bg-lime-300" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">KrishiSaathi Guide</div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    {isHindi ? 'आपका खेती ऐप सहायक' : 'Your farming app companion'}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => setIsMinimized(value => !value)} className="rounded-lg p-2 text-stone-300 hover:bg-white/10 hover:text-white" aria-label={isMinimized ? (isHindi ? 'बड़ा करें' : 'Expand guide') : (isHindi ? 'छोटा करें' : 'Minimize guide')} title={isMinimized ? 'Expand' : 'Minimize'}>
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => { stopTour(); setIsSelectingOnPage(false); speechRecognition.current?.stop(); setIsListening(false); stopSpeech(); setIsOpen(false); }} className="rounded-lg p-2 text-stone-300 hover:bg-rose-500/15 hover:text-rose-200" aria-label={isHindi ? 'गाइड बंद करें' : 'Close guide'}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                <div className="flex shrink-0 gap-2 border-b border-[#1a3420] p-3">
                  <button type="button" onClick={startTour} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-2 py-2 text-[11px] font-semibold text-white hover:bg-emerald-600">
                    <Route className="h-3.5 w-3.5" />{isHindi ? 'मुझे वेबसाइट दिखाएँ' : 'Guide Me Through This Website'}
                  </button>
                  <button type="button" onClick={() => { stopTour(); setIsSelectingOnPage(true); }} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-semibold ${isSelectingOnPage ? 'border-amber-400/60 bg-amber-950/60 text-amber-200' : 'border-[#31543a] text-emerald-200 hover:bg-white/5'}`}>
                    <MousePointerClick className="h-3.5 w-3.5" />{isHindi ? 'विकल्प समझें' : 'Explain an option'}
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  {messages.length > 0 && (
                    <div className="mb-4 space-y-3" aria-live="polite">
                      {messages.slice(-8).map(message => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-emerald-800 text-white' : 'rounded-bl-sm border border-[#24472d] bg-[#102116] text-stone-200'}`}>
                            {message.text}
                            {message.role === 'guide' && (
                              <button type="button" onClick={() => speakText(message.text)} className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-emerald-300 hover:bg-emerald-950/60" aria-label={isHindi ? 'जवाब आवाज़ में सुनें' : 'Read answer aloud'}>
                                <Volume2 className="h-3 w-3" />{isHindi ? 'सुनें' : 'Read aloud'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {isAnswering && <div className="text-xs text-emerald-300">{isHindi ? 'गाइड जवाब बना रहा है…' : 'The guide is preparing an answer…'}</div>}
                    </div>
                  )}

                  {selectedFeature && (
                    <article className="mb-4 rounded-2xl border border-emerald-800/60 bg-[#0e1e13] p-3.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                        <Leaf className="h-4 w-4" />
                        {isHindi ? selectedFeature.titleHi : selectedFeature.title}
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-lime-300">{getModeLabel(selectedFeature.mode, language)}</p>
                      <p className="mt-2 text-xs leading-relaxed text-stone-300">
                        {isHindi ? selectedFeature.descriptionHi : selectedFeature.description}
                      </p>
                      <dl className="mt-3 space-y-2 text-[11px] leading-relaxed">
                        {(['purpose', 'instructions', 'inputs', 'results'] as const).map(section => (
                          <div key={section}>
                            <dt className="font-bold text-emerald-300">{getSectionTitle(language, section)}</dt>
                            <dd className="text-stone-300">{isHindi ? selectedFeature[`${section}Hi`] : selectedFeature[section]}</dd>
                          </div>
                        ))}
                      </dl>
                      <button type="button" onClick={() => openFeature(selectedFeature)} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-emerald-700/60 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/40">
                        {isHindi ? 'यह सेक्शन खोलें' : 'Open this section'}<ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </article>
                  )}

                  <form onSubmit={handleAsk} className="mb-4 flex gap-2">
                    <label className="sr-only" htmlFor="guide-question">{isHindi ? 'गाइड से सवाल पूछें' : 'Ask the guide'}</label>
                    <input
                      id="guide-question"
                      value={question}
                      onChange={event => setQuestion(event.target.value)}
                      maxLength={500}
                      placeholder={isHindi ? 'जैसे: मौसम कैसे देखें?' : 'Ask about any website option…'}
                      className="min-w-0 flex-1 rounded-xl border border-[#294b32] bg-[#07110a] px-3 py-2.5 text-xs text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none"
                      disabled={isAnswering}
                    />
                    <button type="submit" disabled={!question.trim() || isAnswering} aria-label={isHindi ? 'सवाल भेजें' : 'Send question'} className="rounded-xl bg-emerald-700 px-3 text-white hover:bg-emerald-600 disabled:opacity-40">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={isListening ? () => speechRecognition.current?.stop() : startListening} className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] ${isListening ? 'border-amber-500/60 bg-amber-950/50 text-amber-200' : 'border-[#31543a] text-emerald-200 hover:bg-white/5'}`} aria-pressed={isListening}>
                      <Mic className="h-3.5 w-3.5" />{isListening ? (isHindi ? 'सुनना रोकें' : 'Stop listening') : (isHindi ? 'बोलकर पूछें' : 'Speak question')}
                    </button>
                    <button type="button" onClick={() => speakText(latestSpeechText.current || (selectedFeature ? getFeatureText(selectedFeature, language) : ''))} disabled={!messages.some(message => message.role === 'guide') && !selectedFeature} className="inline-flex items-center gap-1 rounded-lg border border-[#31543a] px-2 py-1.5 text-[10px] text-emerald-200 hover:bg-white/5 disabled:opacity-40">
                      <Volume2 className="h-3.5 w-3.5" />{isHindi ? 'शुरू करें' : 'Start reading'}
                    </button>
                    <button type="button" onClick={() => { window.speechSynthesis.pause(); setSpeechState('paused'); }} disabled={speechState !== 'speaking'} className="rounded-lg border border-[#31543a] p-1.5 text-emerald-200 hover:bg-white/5 disabled:opacity-40" aria-label={isHindi ? 'आवाज़ रोकें' : 'Pause speech'}>
                      <Pause className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => { window.speechSynthesis.resume(); setSpeechState('speaking'); }} disabled={speechState !== 'paused'} className="rounded-lg border border-[#31543a] p-1.5 text-emerald-200 hover:bg-white/5 disabled:opacity-40" aria-label={isHindi ? 'आवाज़ फिर चलाएँ' : 'Resume speech'}>
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={stopSpeech} disabled={speechState === 'idle'} className="rounded-lg border border-[#31543a] p-1.5 text-emerald-200 hover:bg-white/5 disabled:opacity-40" aria-label={isHindi ? 'आवाज़ बंद करें' : 'Stop speech'}>
                      <Square className="h-3 w-3" />
                    </button>
                  </div>
                  {voiceNotice && <p role="status" className="mb-3 text-[10px] text-amber-200">{voiceNotice}</p>}
                  {answerError && <p role="status" className="mb-3 text-[10px] text-amber-200">{answerError}</p>}

                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-500" />
                    <label className="sr-only" htmlFor="guide-feature-search">{isHindi ? 'फीचर खोजें' : 'Search features'}</label>
                    <input
                      id="guide-feature-search"
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      placeholder={isHindi ? 'फीचर खोजें…' : 'Search features…'}
                      className="w-full rounded-xl border border-[#223d29] bg-[#07110a] py-2 pl-9 pr-3 text-xs text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    {filteredFeatures.map(feature => (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => explainFeature(feature)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-[#14281a] ${selectedFeature?.id === feature.id ? 'bg-[#14281a] text-emerald-200' : 'text-stone-300'}`}
                      >
                        <span>{isHindi ? feature.titleHi : feature.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />
                      </button>
                    ))}
                    {filteredFeatures.length === 0 && <p className="px-3 py-3 text-xs text-stone-400">{isHindi ? 'यह फीचर उपलब्ध सूची में नहीं है।' : 'No matching feature found.'}</p>}
                  </div>
                  <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-stone-500">
                    <CircleHelp className="mt-0.5 h-3 w-3 shrink-0" />
                    {isHindi ? 'यह गाइड ऐप के मौजूद फीचर समझाती है; यह फ़ॉर्म जमा या कॉल शुरू नहीं करती।' : 'This guide explains existing app features; it does not submit forms or start calls.'}
                  </p>
                </div>
              </>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              stopTour();
              setIsSelectingOnPage(false);
              speechRecognition.current?.stop();
              setIsListening(false);
              stopSpeech();
              setIsOpen(false);
            } else {
              setIsOpen(true);
            }
            setIsMinimized(false);
          }}
          aria-label={isOpen ? (isHindi ? 'गाइड पैनल बंद करें' : 'Close guide panel') : (isHindi ? 'KrishiSaathi Guide खोलें' : 'Open KrishiSaathi Guide')}
          aria-expanded={isOpen}
          className={`guide-launcher group flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/50 bg-gradient-to-br from-emerald-500 via-emerald-700 to-[#12331b] text-white shadow-[0_10px_36px_rgba(16,185,129,.3)] transition hover:scale-105 hover:shadow-[0_12px_42px_rgba(16,185,129,.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 ${isOpen ? 'rotate-0' : ''}`}
        >
          {isOpen ? <ChevronDown className="h-6 w-6" /> : <span className={`guide-launcher-robot guide-robot--${robotMotion} relative`} aria-hidden="true"><Bot className="guide-robot__body h-7 w-7" /><span className="guide-robot__arm guide-robot__arm--left" /><span className="guide-robot__arm guide-robot__arm--right" /><span className="guide-robot__leg guide-robot__leg--left" /><span className="guide-robot__leg guide-robot__leg--right" /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-lime-300 ring-2 ring-emerald-800" /></span>}
        </button>
      </div>
    </>
  );
};
