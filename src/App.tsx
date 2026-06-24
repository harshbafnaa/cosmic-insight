import { useState, useCallback } from 'react';
import { Star, Languages, History as HistoryIcon } from 'lucide-react';
import type {
  View, ServiceType, Language, KundliAnalysis, NumerologyAnalysis, SavedReport,
} from './types';
import { analyzeKundli, analyzeNumerology } from './services/claudeService';
import { saveReport } from './services/reports';

import LandingPage from './components/LandingPage';
import ServiceSelection from './components/ServiceSelection';
import FileUpload from './components/FileUpload';
import NumerologyInput from './components/NumerologyInput';
import Billing from './components/Billing';
import Dashboard from './components/Dashboard';
import NumerologyDashboard from './components/NumerologyDashboard';
import History from './components/History';
import ChatInterface from './components/ChatInterface';
import { Spinner } from './components/ui/Primitives';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [lang, setLang] = useState<Language>('en');
  const [service, setService] = useState<ServiceType>('astrology');

  const [pendingPdf, setPendingPdf] = useState<{ base64: string; name: string } | null>(null);
  const [pendingNum, setPendingNum] = useState<{ name: string; dob: string } | null>(null);

  const [kundli, setKundli] = useState<{ data: KundliAnalysis; simulated: boolean } | null>(null);
  const [numerology, setNumerology] = useState<{ data: NumerologyAnalysis; simulated: boolean } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const go = useCallback((v: View) => setView(v), []);

  const startService = (s: ServiceType) => {
    setService(s);
    go(s === 'astrology' ? 'upload' : 'numerology-input');
  };

  const runAnalysis = async (turnstileToken?: string) => {
    setAnalyzing(true);
    try {
      if (service === 'astrology' && pendingPdf) {
        const res = await analyzeKundli(pendingPdf.base64, lang, turnstileToken);
        setKundli(res);
        await saveReport({
          type: 'astrology', title: res.data.basicDetails.name || pendingPdf.name,
          createdAt: Date.now(), kundli: res.data, simulated: res.simulated,
        });
        go('dashboard');
      } else if (service === 'numerology' && pendingNum) {
        const res = await analyzeNumerology(pendingNum.name, pendingNum.dob, lang, turnstileToken);
        setNumerology(res);
        await saveReport({
          type: 'numerology', title: pendingNum.name,
          createdAt: Date.now(), numerology: res.data, simulated: res.simulated,
        });
        go('numerology');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const openSaved = (r: SavedReport) => {
    if (r.type === 'astrology' && r.kundli) {
      setKundli({ data: r.kundli, simulated: r.simulated });
      go('dashboard');
    } else if (r.type === 'numerology' && r.numerology) {
      setNumerology({ data: r.numerology, simulated: r.simulated });
      go('numerology');
    }
  };

  const chatContext =
    view === 'dashboard' && kundli
      ? JSON.stringify(kundli.data)
      : view === 'numerology' && numerology
      ? JSON.stringify(numerology.data)
      : '';

  const renderView = () => {
    if (analyzing) {
      return (
        <Spinner
          label={
            service === 'astrology'
              ? 'Reading your chart and aligning the planets…'
              : 'Calculating your numbers…'
          }
        />
      );
    }
    switch (view) {
      case 'landing':
        return <LandingPage onStart={() => go('select')} />;
      case 'select':
        return <ServiceSelection onSelect={startService} />;
      case 'upload':
        return <FileUpload onReady={(base64, name) => { setPendingPdf({ base64, name }); go('billing'); }} />;
      case 'numerology-input':
        return <NumerologyInput onReady={(name, dob) => { setPendingNum({ name, dob }); go('billing'); }} />;
      case 'billing':
        return <Billing onSuccess={runAnalysis} />;
      case 'dashboard':
        return kundli ? <Dashboard analysis={kundli.data} simulated={kundli.simulated} lang={lang} /> : null;
      case 'numerology':
        return numerology ? <NumerologyDashboard analysis={numerology.data} simulated={numerology.simulated} lang={lang} /> : null;
      case 'history':
        return <History onOpen={openSaved} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-void/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <button onClick={() => go('landing')} className="flex items-center gap-2">
            <Star className="text-gold" size={22} />
            <span className="font-serif text-lg">
              <span className="gold-gradient">Cosmic</span>Insight
            </span>
          </button>

          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:text-gold"
              title="Toggle language"
            >
              <Languages size={18} /> {lang === 'en' ? 'EN' : 'हिं'}
            </button>
            <button onClick={() => go('history')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:text-gold" title="History">
              <HistoryIcon size={18} /> History
            </button>
          </nav>
        </div>
      </header>

      <main className="min-h-[80vh]">{renderView()}</main>

      {(view === 'dashboard' || view === 'numerology') && chatContext && (
        <ChatInterface context={chatContext} lang={lang} />
      )}

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        CosmicInsight • For reflection &amp; entertainment — not a substitute for professional advice.
      </footer>
    </div>
  );
}
