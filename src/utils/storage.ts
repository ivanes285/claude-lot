import type { Draw, DrawsState } from '../types';
import { db } from './firebase';
import { ref, set, onValue, off } from 'firebase/database';
import INITIAL_DRAWS from '../data/draws.json';

const STORAGE_KEY = 'lottoEcuador_draws_v2';
const FB_REF = 'lottoState';

export const initialDraws: Draw[] = INITIAL_DRAWS as Draw[];

export function getDefaultState(): DrawsState {
  return { draws: [...initialDraws], userAdded: [], disabled: [] };
}

// ── localStorage (fallback) ──
export function loadLocal(): DrawsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DrawsState;
      if (Array.isArray(parsed.draws) && parsed.draws.length > 0) {
        return { ...parsed, disabled: parsed.disabled || [] };
      }
    }
  } catch { /* corrupted */ }
  return getDefaultState();
}

export function saveLocal(state: DrawsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

// ── Firebase ──
export function saveToFirebase(state: DrawsState): void {
  try {
    set(ref(db, FB_REF), state);
  } catch (e) {
    console.warn('Firebase save failed:', e);
  }
}

export function subscribeFirebase(callback: (state: DrawsState) => void): () => void {
  const dbRef = ref(db, FB_REF);
  const handler = onValue(dbRef, (snapshot) => {
    const val = snapshot.val();
    if (val && Array.isArray(val.draws) && val.draws.length > 0) {
      callback({
        draws: val.draws,
        userAdded: val.userAdded || [],
        disabled: val.disabled || [],
      });
    }
  }, (error) => {
    console.warn('Firebase read failed:', error);
  });

  // Return unsubscribe function
  return () => off(dbRef, 'value', handler);
}

// ── Unified save (both) ──
export function saveState(state: DrawsState): void {
  saveLocal(state);
  saveToFirebase(state);
}

export function resetState(): DrawsState {
  const fresh = getDefaultState();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  saveToFirebase(fresh);
  return fresh;
}

// ── Export / Import ──
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
  } catch { /* not JSON */ }
  const lines = text.split(/[\s,\n]+/).map(s => s.trim()).filter(s => /^\d{6}$/.test(s));
  return lines.length > 0 ? lines : null;
}

export function isValidDraw(s: string): boolean {
  return /^\d{6}$/.test(s);
}
