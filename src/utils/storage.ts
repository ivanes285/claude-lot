import type { Draw, DrawsState } from '../types';
import INITIAL_DRAWS from '../data/draws.json';

const STORAGE_KEY = 'lottoEcuador_draws_v2';

export const initialDraws: Draw[] = INITIAL_DRAWS as Draw[];

export function loadState(): DrawsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DrawsState;
      if (Array.isArray(parsed.draws) && parsed.draws.length > 0) {
        return parsed;
      }
    }
  } catch { /* corrupted, ignore */ }
  return { draws: [...initialDraws], userAdded: [] };
}

export function saveState(state: DrawsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded or disabled */ }
}

export function resetState(): DrawsState {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  return { draws: [...initialDraws], userAdded: [] };
}

export function exportJSON(state: DrawsState): void {
  const data = {
    exported: new Date().toISOString(),
    total: state.draws.length,
    userAdded: state.userAdded.length,
    draws: state.draws,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lotto_ecuador_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImport(text: string): Draw[] | null {
  try {
    const data = JSON.parse(text);
    const arr: string[] = Array.isArray(data) ? data : data.draws;
    if (Array.isArray(arr) && arr.every(d => /^\d{6}$/.test(d))) return arr;
  } catch { /* not JSON, try plain text */ }
  const lines = text.split(/[\s,\n]+/).map(s => s.trim()).filter(s => /^\d{6}$/.test(s));
  return lines.length > 0 ? lines : null;
}

export function isValidDraw(s: string): boolean {
  return /^\d{6}$/.test(s);
}
