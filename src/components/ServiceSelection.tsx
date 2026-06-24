import { Moon, Hash, ArrowRight } from 'lucide-react';
import type { ServiceType } from '../types';

export default function ServiceSelection({
  onSelect,
}: {
  onSelect: (s: ServiceType) => void;
}) {
  const services: {
    id: ServiceType;
    icon: typeof Moon;
    title: string;
    desc: string;
    points: string[];
  }[] = [
    {
      id: 'astrology',
      icon: Moon,
      title: 'Vedic Astrology',
      desc: 'Upload your Kundli / birth-chart PDF for a complete reading.',
      points: ['Lagna & Moon sign', 'Doshas & Dashas', 'Career • Wealth • Love • Health', 'Remedies & Soulmate profile'],
    },
    {
      id: 'numerology',
      icon: Hash,
      title: 'Numerology Analysis',
      desc: 'Enter your name and date of birth — no upload needed.',
      points: ['Life Path Number', 'Destiny & Soul Urge', 'Personality & Birthday', 'Lucky numbers & colors'],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold gold-gradient text-glow">Choose Your Path</h1>
        <p className="mt-2 text-slate-400">Select the reading you’d like to begin with.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {services.map(({ id, icon: Icon, title, desc, points }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group glass rounded-2xl p-7 text-left transition-all duration-300 hover:border-gold/40 hover:shadow-glow animate-fade-in"
          >
            <div className="mb-4 inline-flex rounded-xl bg-gold/10 p-3 text-gold">
              <Icon size={26} />
            </div>
            <h3 className="text-2xl font-semibold text-slate-100">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{desc}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {p}
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-2 text-gold transition-transform group-hover:translate-x-1">
              Continue <ArrowRight size={18} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
