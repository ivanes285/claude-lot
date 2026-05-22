import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Draw, DrawsState } from '../types';
import {
  isValidDraw, loadLocal, saveState, resetState as resetStorage,
  subscribeFirebase, getDefaultState,
} from '../utils/storage';

export function useDraws() {
  const [state, setState] = useState<DrawsState>(loadLocal);
  const isLocalUpdate = useRef(false);

  // Subscribe to Firebase realtime updates
  useEffect(() => {
    const unsubscribe = subscribeFirebase((firebaseState) => {
      // Skip if this was our own update
      if (isLocalUpdate.current) {
        isLocalUpdate.current = false;
        return;
      }
      setState(firebaseState);
    });
    return unsubscribe;
  }, []);

  const updateState = useCallback((updater: (prev: DrawsState) => DrawsState) => {
    setState(prev => {
      const next = updater(prev);
      isLocalUpdate.current = true;
      saveState(next);
      return next;
    });
  }, []);

  const addDraw = useCallback((raw: string): { ok: boolean; msg: string } => {
    let val = raw.trim().replace(/\D/g, '');
    if (!val) return { ok: false, msg: 'Ingresa un número de 6 dígitos' };
    if (val.length < 6) val = val.padStart(6, '0');
    if (val.length > 6) return { ok: false, msg: 'Máximo 6 dígitos' };
    if (!isValidDraw(val)) return { ok: false, msg: 'Solo dígitos 0–9' };

    updateState(prev => ({
      draws: [val, ...prev.draws],
      userAdded: [val, ...prev.userAdded],
      disabled: prev.disabled,
    }));
    return { ok: true, msg: `✓ Sorteo ${val} agregado` };
  }, [updateState]);

  const removeDraw = useCallback((index: number) => {
    updateState(prev => {
      const removed = prev.draws[index];
      return {
        draws: prev.draws.filter((_, i) => i !== index),
        userAdded: prev.userAdded.filter(d => d !== removed),
        disabled: prev.disabled.filter(d => d !== removed),
      };
    });
  }, [updateState]);

  const toggleDraw = useCallback((index: number) => {
    updateState(prev => {
      const draw = prev.draws[index];
      const isDisabled = prev.disabled.includes(draw);
      return {
        draws: prev.draws,
        userAdded: prev.userAdded,
        disabled: isDisabled
          ? prev.disabled.filter(d => d !== draw)
          : [...prev.disabled, draw],
      };
    });
  }, [updateState]);

  const importDraws = useCallback((imported: Draw[]) => {
    const next: DrawsState = { draws: imported, userAdded: [...imported], disabled: [] };
    isLocalUpdate.current = true;
    saveState(next);
    setState(next);
  }, []);

  const reset = useCallback(() => {
    isLocalUpdate.current = true;
    const fresh = resetStorage();
    setState(fresh);
  }, []);

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
