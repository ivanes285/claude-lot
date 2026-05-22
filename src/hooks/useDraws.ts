import { useCallback, useState } from 'react';
import type { Draw, DrawsState } from '../types';
import { isValidDraw, loadState, saveState, resetState as resetStorage } from '../utils/storage';

export function useDraws() {
  const [state, setState] = useState<DrawsState>(loadState);

  const addDraw = useCallback((raw: string): { ok: boolean; msg: string } => {
    let val = raw.trim().replace(/\D/g, '');
    if (!val) return { ok: false, msg: 'Ingresa un número de 6 dígitos' };
    if (val.length < 6) val = val.padStart(6, '0');
    if (val.length > 6) return { ok: false, msg: 'Máximo 6 dígitos' };
    if (!isValidDraw(val)) return { ok: false, msg: 'Solo dígitos 0–9' };

    setState(prev => {
      const next: DrawsState = {
        draws: [val, ...prev.draws],
        userAdded: [val, ...prev.userAdded],
      };
      saveState(next);
      return next;
    });
    return { ok: true, msg: `✓ Sorteo ${val} agregado` };
  }, []);

  const removeDraw = useCallback((index: number) => {
    setState(prev => {
      const removed = prev.draws[index];
      const next: DrawsState = {
        draws: prev.draws.filter((_, i) => i !== index),
        userAdded: prev.userAdded.filter(d => d !== removed),
      };
      saveState(next);
      return next;
    });
  }, []);

  const importDraws = useCallback((imported: Draw[]) => {
    const next: DrawsState = { draws: imported, userAdded: [...imported] };
    saveState(next);
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const fresh = resetStorage();
    setState(fresh);
  }, []);

  return {
    draws: state.draws,
    userAdded: state.userAdded,
    addDraw,
    removeDraw,
    importDraws,
    reset,
  };
}
