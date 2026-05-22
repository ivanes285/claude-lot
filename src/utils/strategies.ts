import type { Draw, Strategy, StrategyName } from '../types';

export const strategies: Record<StrategyName, Strategy> = {
  hot: {
    label: 'HOT',
    icon: '🔥',
    explain: 'Toma el dígito que más veces ha salido en cada posición. Apuesta a que los sesgos históricos persisten.',
    logic: 'argmax(freq) por posición',
    compute: (draws: Draw[]) => {
      const num: number[] = [];
      const detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const counts = Array(10).fill(0) as number[];
        draws.forEach(d => counts[+d[p]]++);
        let max = -1, idx = 0;
        counts.forEach((c, i) => { if (c > max) { max = c; idx = i; } });
        num.push(idx);
        detail.push(`${max}/${draws.length}`);
      }
      return { num, detail };
    },
  },

  cold: {
    label: 'COLD',
    icon: '❄️',
    explain: 'Elige los dígitos casi nunca vistos. Apuesta a regresión a la media — lo atrasado debe aparecer.',
    logic: 'argmin(freq) por posición',
    compute: (draws: Draw[]) => {
      const num: number[] = [];
      const detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const counts = Array(10).fill(0) as number[];
        draws.forEach(d => counts[+d[p]]++);
        let min = Infinity, idx = 0;
        counts.forEach((c, i) => { if (c < min) { min = c; idx = i; } });
        num.push(idx);
        detail.push(`${min}/${draws.length}`);
      }
      return { num, detail };
    },
  },

  markov: {
    label: 'MARKOV',
    icon: '⛓',
    explain: 'Analiza qué dígito tiende a seguir a otro en cada posición. Dado el último sorteo, predice el siguiente.',
    logic: 'P(X_{n+1} | X_n) por posición',
    compute: (draws: Draw[]) => {
      if (draws.length < 2) return { num: [0, 0, 0, 0, 0, 0], detail: Array(6).fill('sin data') };
      const last = draws[0];
      const num: number[] = [];
      const detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const transitions: Record<string, number> = {};
        for (let i = draws.length - 1; i > 0; i--) {
          const curr = draws[i][p];
          const nxt = draws[i - 1][p];
          const key = `${curr}->${nxt}`;
          transitions[key] = (transitions[key] || 0) + 1;
        }
        const lastD = last[p];
        const candidates: Record<string, number> = {};
        for (const key in transitions) {
          if (key.startsWith(lastD + '->')) {
            candidates[key.split('->')[1]] = transitions[key];
          }
        }
        let best = -1, idx = (+lastD + 1) % 10;
        for (const d in candidates) {
          if (candidates[d] > best) { best = candidates[d]; idx = +d; }
        }
        num.push(idx);
        detail.push(best > 0 ? `tras ${lastD}: ${best}×` : 'sin data');
      }
      return { num, detail };
    },
  },

  mean: {
    label: 'MEDIA',
    icon: '📊',
    explain: 'Calcula el dígito promedio histórico en cada posición y lo redondea. Apuesta al valor esperado.',
    logic: 'round(mean) por posición',
    compute: (draws: Draw[]) => {
      const num: number[] = [];
      const detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const sum = draws.reduce((a, d) => a + (+d[p]), 0);
        const mean = sum / Math.max(draws.length, 1);
        num.push(Math.round(mean));
        detail.push(`μ=${mean.toFixed(1)}`);
      }
      return { num, detail };
    },
  },

  gap: {
    label: 'GAP',
    icon: '⏱',
    explain: 'Identifica qué dígito lleva más tiempo sin aparecer en cada posición. La "falacia del jugador" cuantificada.',
    logic: 'argmax(last_seen_age) por posición',
    compute: (draws: Draw[]) => {
      const num: number[] = [];
      const detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const lastSeen: Record<number, number> = {};
        for (let i = 0; i < draws.length; i++) {
          const d = +draws[i][p];
          if (!(d in lastSeen)) lastSeen[d] = i;
        }
        for (let di = 0; di < 10; di++) {
          if (!(di in lastSeen)) lastSeen[di] = 9999;
        }
        let maxAge = -1, idx = 0;
        for (const d in lastSeen) {
          if (lastSeen[+d] > maxAge) { maxAge = lastSeen[+d]; idx = +d; }
        }
        num.push(idx);
        detail.push(maxAge >= 9999 ? 'nunca visto' : `hace ${maxAge}`);
      }
      return { num, detail };
    },
  },

  hybrid: {
    label: 'HÍBRIDO',
    icon: '🧬',
    explain: 'Combina HOT (40%), MARKOV (30%), GAP (20%) y MEDIA (10%). El score más alto por posición gana.',
    logic: 'Σ pesos × score por dígito',
    compute: (draws: Draw[]) => {
      const num: number[] = [];
      const detail: string[] = [];
      const last = draws.length ? draws[0] : '000000';
      const w = { hot: 0.4, markov: 0.3, gap: 0.2, mean: 0.1 };

      for (let p = 0; p < 6; p++) {
        const scores = Array(10).fill(0) as number[];

        // HOT
        const counts = Array(10).fill(0) as number[];
        draws.forEach(d => counts[+d[p]]++);
        const maxC = Math.max(...counts, 1);
        counts.forEach((c, i) => (scores[i] += w.hot * (c / maxC)));

        // MARKOV
        if (draws.length >= 2) {
          const lastD = last[p];
          const trans = Array(10).fill(0) as number[];
          for (let i = draws.length - 1; i > 0; i--) {
            if (draws[i][p] === lastD) trans[+draws[i - 1][p]]++;
          }
          const maxT = Math.max(...trans, 1);
          trans.forEach((t, i) => (scores[i] += w.markov * (t / maxT)));
        }

        // GAP
        const lastSeen = Array(10).fill(9999) as number[];
        for (let i = 0; i < draws.length; i++) {
          const d = +draws[i][p];
          if (lastSeen[d] === 9999) lastSeen[d] = i;
        }
        const maxG = Math.max(...lastSeen.filter(x => x < 9999), 1);
        lastSeen.forEach((g, i) => {
          scores[i] += w.gap * (g === 9999 ? 1 : g / maxG);
        });

        // MEDIA
        const meanD = Math.round(
          draws.reduce((a, d) => a + (+d[p]), 0) / Math.max(draws.length, 1)
        );
        scores[meanD] += w.mean;

        let maxS = -1, idx = 0;
        scores.forEach((s, i) => { if (s > maxS) { maxS = s; idx = i; } });
        num.push(idx);
        detail.push(`score ${maxS.toFixed(2)}`);
      }
      return { num, detail };
    },
  },
};

export function computeConsensus(draws: Draw[]): { num: number[]; agreement: number[] } {
  const allPreds = Object.values(strategies).map(s => s.compute(draws).num);
  const num: number[] = [];
  const agreement: number[] = [];
  for (let p = 0; p < 6; p++) {
    const counts = Array(10).fill(0) as number[];
    allPreds.forEach(pred => counts[pred[p]]++);
    let max = -1, idx = 0;
    counts.forEach((c, i) => { if (c > max) { max = c; idx = i; } });
    num.push(idx);
    agreement.push(max);
  }
  return { num, agreement };
}
