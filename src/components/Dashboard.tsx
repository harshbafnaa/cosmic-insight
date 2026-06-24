import {
  User, Sunrise, Moon, Sun, ShieldAlert, Clock, Gem, Quote,
} from 'lucide-react';
import type { KundliAnalysis, Language } from '../types';
import { GlassCard, SectionTitle, SeverityBadge, RatingStars, SimulatedBanner } from './ui/Primitives';
import SoulmateGenerator from './SoulmateGenerator';

const domainIcon: Record<string, string> = {
  Career: '💼', Wealth: '💰', Love: '❤️', Health: '🌿',
};

export default function Dashboard({
  analysis,
  simulated,
  lang,
}: {
  analysis: KundliAnalysis;
  simulated: boolean;
  lang: Language;
}) {
  const { basicDetails: b } = analysis;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6">
        <SectionTitle>Your Kundli Reading</SectionTitle>
        <p className="text-sm text-slate-400">{b.name} • {b.placeOfBirth}</p>
      </div>

      {simulated && <div className="mb-6"><SimulatedBanner lang={lang} /></div>}

      <div className="grid auto-rows-min grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Basic details */}
        <GlassCard className="lg:col-span-2">
          <Header icon={User} title="Birth Details" />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Detail k="Name" v={b.name} />
            <Detail k="Date" v={b.dateOfBirth} />
            <Detail k="Time" v={b.timeOfBirth} />
            <Detail k="Place" v={b.placeOfBirth} />
          </dl>
        </GlassCard>

        {/* Signs */}
        <GlassCard glow>
          <Header icon={Sunrise} title="Ascendant" />
          <p className="text-2xl font-serif text-gold">{analysis.ascendant}</p>
          <p className="mt-1 text-xs text-slate-500">Nakshatra: {analysis.nakshatra}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex gap-4">
            <div className="flex-1">
              <Header icon={Moon} title="Moon" />
              <p className="text-lg text-slate-100">{analysis.moonSign}</p>
            </div>
            <div className="flex-1">
              <Header icon={Sun} title="Sun" />
              <p className="text-lg text-slate-100">{analysis.sunSign}</p>
            </div>
          </div>
        </GlassCard>

        {/* Current Dasha */}
        <GlassCard className="lg:col-span-2">
          <Header icon={Clock} title="Current Planetary Period" />
          <div className="flex flex-wrap items-center gap-3">
            <Pill label="Mahadasha" value={analysis.currentDasha.mahadasha} />
            <Pill label="Antardasha" value={analysis.currentDasha.antardasha} />
            <span className="text-xs text-slate-500">
              {analysis.currentDasha.startDate} – {analysis.currentDasha.endDate}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">{analysis.currentDasha.summary}</p>
        </GlassCard>

        {/* Doshas */}
        <GlassCard className="lg:col-span-2">
          <Header icon={ShieldAlert} title="Doshas" />
          <div className="space-y-3">
            {analysis.doshas.map((d) => (
              <div key={d.name} className="rounded-xl bg-slate-800/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-100">{d.name}</p>
                  <SeverityBadge severity={d.severity} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{d.description}</p>
                {d.present && <p className="mt-1 text-xs text-gold">Remedy: {d.remedy}</p>}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Predictions */}
        {analysis.predictions.map((p) => (
          <GlassCard key={p.domain}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">
                {domainIcon[p.domain]} {p.domain}
              </span>
              <RatingStars rating={p.rating} />
            </div>
            <p className="text-xs leading-relaxed text-slate-400">{p.outlook}</p>
          </GlassCard>
        ))}

        {/* Remedies */}
        <GlassCard className="lg:col-span-2">
          <Header icon={Gem} title="Personalized Remedies" />
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.remedies.map((r) => (
              <div key={r.title} className="rounded-xl bg-slate-800/40 p-3">
                <p className="text-sm font-medium text-gold">{r.title}</p>
                <p className="text-xs text-slate-500">{r.category}</p>
                <p className="mt-1 text-xs text-slate-300">{r.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard glow className="lg:col-span-2">
          <Header icon={Quote} title="Overall Reading" />
          <p className="text-sm italic leading-relaxed text-slate-300">{analysis.summary}</p>
        </GlassCard>

        {/* Soulmate */}
        <div className="lg:col-span-4">
          <SoulmateGenerator kundli={analysis} lang={lang} />
        </div>
      </div>
    </div>
  );
}

function Header({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-gold">
      <Icon size={18} />
      <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
    </div>
  );
}
function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{k}</dt>
      <dd className="text-slate-100">{v}</dd>
    </div>
  );
}
function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-gold/10 px-3 py-1 text-sm text-gold">
      <span className="text-xs text-gold/60">{label}: </span>{value}
    </span>
  );
}
