import { useState } from 'react';
import { ShieldCheck, Sparkles, CreditCard, Check, Loader2 } from 'lucide-react';
import { GlassCard } from './ui/Primitives';
import Turnstile, { turnstileEnabled } from './Turnstile';

export default function Billing({
  onSuccess,
}: {
  onSuccess: (turnstileToken?: string) => void;
}) {
  const [stage, setStage] = useState<'idle' | 'processing' | 'done'>('idle');
  const [token, setToken] = useState('');

  // If Turnstile is configured, require a token before unlocking.
  const blocked = turnstileEnabled && !token;

  const pay = () => {
    if (blocked) return;
    setStage('processing');
    setTimeout(() => {
      setStage('done');
      setTimeout(() => onSuccess(token || undefined), 900);
    }, 1900);
  };

  const features = [
    'Full AI-interpreted reading',
    'Personalized remedies',
    'Soulmate profile (text)',
    'Unlimited follow-up chat',
    'Saved to this device',
  ];

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold gold-gradient text-glow">Unlock Your Reading</h1>
        <p className="mt-2 text-sm text-slate-400">Start your free trial — no real charge in this prototype.</p>
      </div>

      <GlassCard glow>
        <div className="flex items-baseline justify-between border-b border-white/5 pb-5">
          <div>
            <p className="text-sm text-slate-400">CosmicInsight Premium</p>
            <p className="mt-1 text-3xl font-semibold text-slate-100">
              ₹0 <span className="text-base font-normal text-slate-500">/ 7-day trial</span>
            </p>
          </div>
          <span className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold">Best value</span>
        </div>

        <ul className="space-y-2.5 py-5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
              <Check size={16} className="text-gold" /> {f}
            </li>
          ))}
        </ul>

        {/* Proof-of-human check (only renders if configured) */}
        <Turnstile onToken={setToken} />

        <button
          onClick={pay}
          disabled={stage !== 'idle' || blocked}
          className="btn-gold inline-flex w-full items-center justify-center gap-2"
        >
          {stage === 'idle' && (<><Sparkles size={18} /> Start Free Trial</>)}
          {stage === 'processing' && (<><Loader2 size={18} className="animate-spin" /> Contacting payment gateway…</>)}
          {stage === 'done' && (<><Check size={18} /> Payment successful</>)}
        </button>

        <button
          onClick={pay}
          disabled={stage !== 'idle' || blocked}
          className="btn-ghost mt-3 inline-flex w-full items-center justify-center gap-2"
        >
          <CreditCard size={18} /> Simulated Success (skip trial)
        </button>

        {blocked && (
          <p className="mt-3 text-center text-xs text-amber-300">
            Please complete the verification above to continue.
          </p>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck size={14} /> No real payment is processed in this prototype.
        </p>
      </GlassCard>
    </div>
  );
}
