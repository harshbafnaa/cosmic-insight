import { useState } from 'react';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/Primitives';

export default function NumerologyInput({
  onReady,
}: {
  onReady: (name: string, dob: string) => void;
}) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const proceed = () => {
    if (!name.trim()) return setError('Please enter your full name.');
    if (!dob) return setError('Please enter your date of birth.');
    setError('');
    onReady(name.trim(), dob);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold gold-gradient text-glow">Your Numbers</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter the full name and date of birth to calculate your core numerology.
        </p>
      </div>

      <GlassCard glow>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input-field pl-10"
                placeholder="As given at birth, ideally"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">Date of Birth</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="date"
                className="input-field pl-10 [color-scheme:dark]"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button onClick={proceed} className="btn-gold inline-flex w-full items-center justify-center gap-2">
            Continue to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
