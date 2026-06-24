import { Hash, Sparkles, Palette, Quote } from 'lucide-react';
import type { NumerologyAnalysis, Language } from '../types';
import { GlassCard, SectionTitle, SimulatedBanner } from './ui/Primitives';

export default function NumerologyDashboard({
  analysis,
  simulated,
  lang,
}: {
  analysis: NumerologyAnalysis;
  simulated: boolean;
  lang: Language;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6">
        <SectionTitle>Your Numerology</SectionTitle>
        <p className="text-sm text-slate-400">{analysis.fullName} • {analysis.dateOfBirth}</p>
      </div>

      {simulated && <div className="mb-6"><SimulatedBanner lang={lang} /></div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {analysis.numbers.map((n) => (
          <GlassCard key={n.key} glow={n.isMaster}>
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                <Hash size={14} className="text-gold" /> {n.label}
              </span>
              {n.isMaster && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase text-gold">Master</span>
              )}
            </div>
            <div className="flex items-end gap-3">
              <span className="font-serif text-5xl gold-gradient text-glow leading-none">{n.value}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{n.meaning}</p>
          </GlassCard>
        ))}

        {/* Lucky numbers */}
        <GlassCard>
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Sparkles size={16} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Lucky Numbers</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.luckyNumbers.map((n, i) => (
              <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 font-serif text-lg text-gold">
                {n}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Colors */}
        <GlassCard>
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Palette size={16} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Favorable Colors</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.favorableColors.map((c) => (
              <span key={c} className="rounded-full bg-slate-800/70 px-3 py-1 text-sm text-slate-200">{c}</span>
            ))}
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard glow className="sm:col-span-2 lg:col-span-3">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Quote size={16} />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Overall Summary</h3>
          </div>
          <p className="text-sm italic leading-relaxed text-slate-300">{analysis.summary}</p>
        </GlassCard>
      </div>
    </div>
  );
}
