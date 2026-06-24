import { Sparkles, Moon, Hash, ArrowRight, Star } from 'lucide-react';

export default function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative overflow-hidden">
      {/* decorative stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <Star
            key={i}
            size={Math.random() * 8 + 4}
            className="absolute text-gold/20 animate-pulse-glow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass-gold px-4 py-1.5 text-sm text-gold animate-fade-in">
          <Sparkles size={15} /> AI-powered Vedic guidance
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold leading-tight animate-fade-in">
          <span className="gold-gradient text-glow">Cosmic</span>
          <span className="text-slate-100">Insight</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 animate-fade-in">
          Read your Kundli, decode your numbers, and explore what the stars whisper —
          interpreted by an expert AI astrologer, written for the modern seeker.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in">
          <button onClick={onStart} className="btn-gold inline-flex items-center gap-2">
            Begin Your Reading <ArrowRight size={18} />
          </button>
          <span className="text-xs text-slate-500">No payment required to explore</span>
        </div>
      </section>

      {/* Services */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Moon, title: 'Vedic Astrology', desc: 'Upload your Kundli PDF for a full chart reading: Lagna, dashas, doshas and life predictions.' },
            { icon: Hash, title: 'Numerology', desc: 'Discover your Life Path, Destiny and Soul Urge numbers and what they reveal about you.' },
            { icon: Sparkles, title: 'Soulmate Profile', desc: 'A descriptive, text-only portrait of your soulmate’s nature, values and how you may meet.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-glow animate-fade-in">
              <div className="mb-4 inline-flex rounded-xl bg-gold/10 p-3 text-gold">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
