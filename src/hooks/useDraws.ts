import { useCallback, useMemo, useState } from 'react';
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
        disabled: prev.disabled,
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
        disabled: prev.disabled.filter(d => d !== removed),
      };
      saveState(next);
      return next;
    });
  }, []);

  const toggleDraw = useCallback((index: number) => {
    setState(prev => {
      const draw = prev.draws[index];
      const isDisabled = prev.disabled.includes(draw);
      const next: DrawsState = {
        draws: prev.draws,
        userAdded: prev.userAdded,
        disabled: isDisabled
          ? prev.disabled.filter(d => d !== draw)
          : [...prev.disabled, draw],
      };
      saveState(next);
      return next;
    });
  }, []);

  const importDraws = useCallback((imported: Draw[]) => {
    const next: DrawsState = { draws: imported, userAdded: [...imported], disabled: [] };
    saveState(next);
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const fresh = resetStorage();
    setState(fresh);
  }, []);

  // Active draws = all draws minus disabled ones
  const activeDraws = useMemo(
    () => state.draws.filter(d => !state.disabled.includes(d)),
    [state.draws, state.disabled]
  );

  return {
    draws: state.draws,
    activeDraws,
    userAdded: state.userAdded,
    disabled: state.disabled,
    addDraw,
    removeDraw,
    toggleDraw,
    importDraws,
    reset,
  };
}
