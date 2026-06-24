import { useState } from 'react';
import { Heart, Sparkles, Loader2 } from 'lucide-react';
import type { KundliAnalysis, SoulmateProfile, Language } from '../types';
import { generateSoulmate } from '../services/claudeService';
import { GlassCard } from './ui/Primitives';

export default function SoulmateGenerator({
  kundli,
  lang,
}: {
  kundli: KundliAnalysis;
  lang: Language;
}) {
  const [profile, setProfile] = useState<SoulmateProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const reveal = async () => {
    setLoading(true);
    const { data } = await generateSoulmate(kundli, lang);
    setProfile(data);
    setLoading(false);
  };

  return (
    <GlassCard className="col-span-full">
      <div className="mb-4 flex items-center gap-3">
        <div className="inline-flex rounded-xl bg-pink-500/10 p-2.5 text-pink-300">
          <Heart size={20} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-100">Soulmate Profile</h3>
          <p className="text-xs text-slate-500">A descriptive, text-only portrait — no images.</p>
        </div>
      </div>

      {!profile && !loading && (
        <button onClick={reveal} className="btn-gold inline-flex items-center gap-2">
          <Sparkles size={18} /> Reveal their nature
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="animate-spin text-gold" size={22} />
          <span className="text-sm animate-pulse-glow">Reading the seventh house…</span>
        </div>
      )}

      {profile && (
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
          <Field title="Nature & Personality" body={profile.natureAndPersonality} />
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gold">Core Values</p>
            <div className="flex flex-wrap gap-2">
              {profile.coreValues.map((v) => (
                <span key={v} className="rounded-full bg-slate-800/70 px-3 py-1 text-sm text-slate-200">{v}</span>
              ))}
            </div>
          </div>
          <Field title="Likely Background" body={profile.likelyBackground} />
          <Field title="How You May Meet" body={profile.howYouMayMeet} />
          <Field title="Compatibility" body={profile.compatibilityNotes} />
          <Field title="Timing" body={profile.timingHint} />
        </div>
      )}
    </GlassCard>
  );
}

function Field({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wider text-gold">{title}</p>
      <p className="text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}
