import { useEffect, useState } from 'react';
import { Moon, Hash, Clock, FileQuestion, Trash2 } from 'lucide-react';
import type { SavedReport } from '../types';
import { fetchReports, clearReports } from '../services/reports';
import { GlassCard, SectionTitle, Spinner } from './ui/Primitives';

export default function History({
  onOpen,
}: {
  onOpen: (report: SavedReport) => void;
}) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchReports()
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const clear = async () => {
    await clearReports();
    load();
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <SectionTitle>Saved Reports</SectionTitle>
          <p className="text-sm text-slate-400">Stored on this device.</p>
        </div>
        {reports.length > 0 && (
          <button onClick={clear} className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-rose-400">
            <Trash2 size={15} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading your history…" />
      ) : reports.length === 0 ? (
        <GlassCard className="text-center">
          <FileQuestion className="mx-auto mb-3 text-slate-500" size={36} />
          <p className="text-slate-300">No reports yet.</p>
          <p className="text-sm text-slate-500">Generate a reading and it will appear here.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => onOpen(r)}
              className="glass rounded-2xl p-5 text-left transition-all hover:border-gold/40 hover:shadow-glow animate-fade-in"
            >
              <div className="mb-2 flex items-center gap-2 text-gold">
                {r.type === 'astrology' ? <Moon size={18} /> : <Hash size={18} />}
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {r.type === 'astrology' ? 'Astrology' : 'Numerology'}
                </span>
                {r.simulated && (
                  <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
                    Simulated
                  </span>
                )}
              </div>
              <p className="text-slate-100">{r.title}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} /> {new Date(r.createdAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
