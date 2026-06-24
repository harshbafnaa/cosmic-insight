import type { ReactNode } from 'react';
import { Star, AlertTriangle, Loader2 } from 'lucide-react';
import type { Severity } from '../../types';

export function GlassCard({
  children,
  className = '',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 animate-fade-in ${
        glow ? 'glass-gold shadow-glow' : 'glass'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-semibold text-glow gold-gradient mb-1">
      {children}
    </h2>
  );
}

const severityStyles: Record<Severity, string> = {
  none: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
  low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  moderate: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'fill-gold text-gold' : 'text-slate-600'}
        />
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-300">
      <Loader2 className="animate-spin text-gold" size={40} />
      {label && <p className="text-sm tracking-wide animate-pulse-glow">{label}</p>}
    </div>
  );
}

export function SimulatedBanner({ lang }: { lang: 'en' | 'hi' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 animate-fade-in">
      <AlertTriangle size={18} className="shrink-0" />
      <span>
        {lang === 'hi'
          ? 'सिमुलेटेड डेटा दिखाया जा रहा है (कोई API कुंजी नहीं या त्रुटि)। वास्तविक विश्लेषण हेतु ANTHROPIC_API_KEY जोड़ें।'
          : 'Showing simulated data (no API key or an error occurred). Add ANTHROPIC_API_KEY for live AI analysis.'}
      </span>
    </div>
  );
}
