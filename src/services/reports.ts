// ============================================================================
// Saved-report persistence — browser localStorage (no backend, no auth).
// Reports live on the user's own device. Keeps the same async API so callers
// don't care where the data lives.
// ============================================================================
import type { SavedReport } from '../types';

const KEY = 'cosmicinsight:reports';
const MAX = 100;

function read(): SavedReport[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as SavedReport[];
  } catch {
    return [];
  }
}

function write(reports: SavedReport[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(reports.slice(0, MAX)));
  } catch {
    /* quota / unavailable — ignore */
  }
}

export async function saveReport(report: Omit<SavedReport, 'id'>): Promise<string> {
  const id = `r-${Date.now()}`;
  const all = read();
  all.unshift({ ...report, id });
  write(all);
  return id;
}

export async function fetchReports(): Promise<SavedReport[]> {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export async function clearReports(): Promise<void> {
  write([]);
}
