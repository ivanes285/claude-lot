import type { Draw, Strategy, StrategyName } from '../types';

export const strategies: Record<StrategyName, Strategy> = {
  hot: {
    label: 'HOT',
    icon: '🔥',
    explain: 'Dígito más frecuente en cada posición. Apuesta a que los sesgos persisten.',
    logic: 'argmax(freq)',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const c = Array(10).fill(0) as number[];
        draws.forEach(d => c[+d[p]]++);
        let max = -1, idx = 0;
        c.forEach((v, i) => { if (v > max) { max = v; idx = i; } });
        num.push(idx); detail.push(`${max}/${draws.length}`);
      }
      return { num, detail };
    },
  },

  cold: {
    label: 'COLD',
    icon: '❄️',
    explain: 'Dígito menos frecuente en cada posición. Apuesta a regresión a la media.',
    logic: 'argmin(freq)',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const c = Array(10).fill(0) as number[];
        draws.forEach(d => c[+d[p]]++);
        let min = Infinity, idx = 0;
        c.forEach((v, i) => { if (v < min) { min = v; idx = i; } });
        num.push(idx); detail.push(`${min}/${draws.length}`);
      }
      return { num, detail };
    },
  },

  markov: {
    label: 'MARKOV',
    icon: '⛓',
    explain: 'Qué dígito tiende a seguir a otro en cada posición. Dado el último sorteo, predice el siguiente.',
    logic: 'P(X_{n+1}|X_n)',
    compute: (draws: Draw[]) => {
      if (draws.length < 2) return { num: [0,0,0,0,0,0], detail: Array(6).fill('sin data') };
      const last = draws[0];
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const trans: Record<string, number> = {};
        for (let i = draws.length - 1; i > 0; i--) {
          const key = `${draws[i][p]}->${draws[i-1][p]}`;
          trans[key] = (trans[key] || 0) + 1;
        }
        const lastD = last[p];
        const cands: Record<string, number> = {};
        for (const k in trans) {
          if (k.startsWith(lastD + '->')) cands[k.split('->')[1]] = trans[k];
        }
        let best = -1, idx = (+lastD + 1) % 10;
        for (const d in cands) { if (cands[d] > best) { best = cands[d]; idx = +d; } }
        num.push(idx);
        detail.push(best > 0 ? `tras ${lastD}: ${best}×` : 'sin data');
      }
      return { num, detail };
    },
  },

  mean: {
    label: 'MEDIA',
    icon: '📊',
    explain: 'Promedio histórico simple en cada posición, redondeado. Apuesta al valor esperado.',
    logic: 'round(mean)',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
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
    explain: 'Dígito que lleva más tiempo sin aparecer en cada posición. Falacia del jugador cuantificada.',
    logic: 'argmax(edad)',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const lastSeen: Record<number, number> = {};
        for (let i = 0; i < draws.length; i++) {
          const d = +draws[i][p];
          if (!(d in lastSeen)) lastSeen[d] = i;
        }
        for (let di = 0; di < 10; di++) { if (!(di in lastSeen)) lastSeen[di] = 9999; }
        let maxAge = -1, idx = 0;
        for (const d in lastSeen) { if (lastSeen[+d] > maxAge) { maxAge = lastSeen[+d]; idx = +d; } }
        num.push(idx);
        detail.push(maxAge >= 9999 ? 'nunca' : `hace ${maxAge}`);
      }
      return { num, detail };
    },
  },

  hybrid: {
    label: 'HÍBRIDO',
    icon: '🧬',
    explain: 'Combina todas las estrategias con pesos: HOT, MARKOV, INERCIA, MOMENTUM, VECINOS, GAP y TENDENCIA.',
    logic: 'Σ pesos × score',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      const preds = [
        { r: strategies.hot.compute(draws).num, w: 0.15 },
        { r: strategies.markov.compute(draws).num, w: 0.15 },
        { r: strategies.inercia.compute(draws).num, w: 0.15 },
        { r: strategies.momentum.compute(draws).num, w: 0.15 },
        { r: strategies.vecinos.compute(draws).num, w: 0.15 },
        { r: strategies.gap.compute(draws).num, w: 0.10 },
        { r: strategies.tendencia.compute(draws).num, w: 0.10 },
        { r: strategies.ciclo.compute(draws).num, w: 0.05 },
      ];
      for (let p = 0; p < 6; p++) {
        const scores = Array(10).fill(0) as number[];
        preds.forEach(({ r, w }) => { scores[r[p]] += w; });
        let maxS = -1, idx = 0;
        scores.forEach((s, i) => { if (s > maxS) { maxS = s; idx = i; } });
        num.push(idx);
        detail.push(`score ${maxS.toFixed(2)}`);
      }
      return { num, detail };
    },
  },

  // ── NUEVAS ──

  inercia: {
    label: 'INERCIA',
    icon: '⚡',
    explain: 'Media ponderada exponencial: sorteos recientes pesan mucho más que los antiguos. Captura la inercia del sistema.',
    logic: 'Σ(0.9^i × dígito)',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        let wSum = 0, wTotal = 0;
        for (let i = 0; i < draws.length; i++) {
          const w = Math.pow(0.9, i);
          wSum += (+draws[i][p]) * w;
          wTotal += w;
        }
        const wmean = wSum / Math.max(wTotal, 1);
        num.push(Math.round(wmean));
        detail.push(`μw=${wmean.toFixed(1)}`);
      }
      return { num, detail };
    },
  },

  vecinos: {
    label: 'VECINOS',
    icon: '🔍',
    explain: 'Busca el sorteo histórico más parecido al último y usa lo que salió DESPUÉS como predicción.',
    logic: 'min(distancia) → sig.',
    compute: (draws: Draw[]) => {
      if (draws.length < 3) return { num: [0,0,0,0,0,0], detail: Array(6).fill('sin data') };
      const last = draws[0];
      let bestDist = Infinity, bestIdx = 1;
      for (let i = 1; i < draws.length - 1; i++) {
        let dist = 0;
        for (let p = 0; p < 6; p++) dist += Math.abs(+last[p] - +draws[i][p]);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      const similar = draws[bestIdx];
      const next = draws[bestIdx - 1];
      const num = [...next].map(Number);
      const detail = num.map((_, p) => `${similar[p]}→${next[p]}`);
      return { num, detail };
    },
  },

  tendencia: {
    label: 'TENDENCIA',
    icon: '📈',
    explain: 'Regresión lineal: detecta si el dígito está subiendo o bajando en el tiempo y proyecta el siguiente valor.',
    logic: 'y = mx + b → next',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const vals: number[] = [];
        for (let i = draws.length - 1; i >= 0; i--) vals.push(+draws[i][p]);
        const n = vals.length;
        const xM = (n - 1) / 2;
        const yM = vals.reduce((a, b) => a + b, 0) / n;
        let num_ = 0, den = 0;
        for (let i = 0; i < n; i++) {
          num_ += (i - xM) * (vals[i] - yM);
          den += (i - xM) ** 2;
        }
        const slope = den !== 0 ? num_ / den : 0;
        const nextVal = Math.round(Math.max(0, Math.min(9, yM + slope * n)));
        const dir = slope > 0.02 ? '↑' : slope < -0.02 ? '↓' : '→';
        num.push(nextVal);
        detail.push(`${dir}${slope > 0 ? '+' : ''}${slope.toFixed(2)}`);
      }
      return { num, detail };
    },
  },

  ciclo: {
    label: 'CICLO',
    icon: '🔄',
    explain: 'Detecta periodicidad mediante autocorrelación. Si hay un ciclo, predice qué "toca" según ese ritmo.',
    logic: 'autocorr → repetir',
    compute: (draws: Draw[]) => {
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const vals: number[] = [];
        for (let i = draws.length - 1; i >= 0; i--) vals.push(+draws[i][p]);
        const n = vals.length;
        const mean = vals.reduce((a, b) => a + b, 0) / n;
        const vari = vals.reduce((a, b) => a + (b - mean) ** 2, 0);
        let bestLag = 2, bestCorr = -Infinity;
        if (vari > 0 && n > 4) {
          for (let lag = 2; lag < Math.min(11, Math.floor(n / 2)); lag++) {
            let corr = 0;
            for (let i = 0; i < n - lag; i++) corr += (vals[i] - mean) * (vals[i + lag] - mean);
            corr /= vari;
            if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
          }
        }
        // What happened bestLag ago (in draws order: index bestLag-1)
        const idx = bestLag - 1;
        const pred = idx >= 0 && idx < draws.length ? +draws[idx][p] : Math.round(mean);
        num.push(Math.max(0, Math.min(9, pred)));
        detail.push(`c=${bestLag} (${bestCorr.toFixed(2)})`);
      }
      return { num, detail };
    },
  },

  momentum: {
    label: 'MOMENTUM',
    icon: '🚀',
    explain: 'Calcula la "velocidad de cambio" de los últimos 5 sorteos por posición. Detecta caídas y subidas bruscas recientes.',
    logic: 'Σ ponderado de deltas',
    compute: (draws: Draw[]) => {
      if (draws.length < 2) return { num: [0,0,0,0,0,0], detail: Array(6).fill('sin data') };
      const last = draws[0];
      const window = Math.min(5, draws.length - 1);
      const num: number[] = [], detail: string[] = [];
      for (let p = 0; p < 6; p++) {
        const deltas: number[] = [];
        for (let i = 0; i < window; i++) {
          deltas.push(+draws[i][p] - +draws[i + 1][p]);
        }
        let wSum = 0, wTotal = 0;
        for (let i = 0; i < deltas.length; i++) {
          const w = window - i;
          wSum += deltas[i] * w;
          wTotal += w;
        }
        const avg = wSum / Math.max(wTotal, 1);
        const val = Math.max(0, Math.min(9, Math.round(+last[p] + avg)));
        const dir = avg > 0.3 ? '↑' : avg < -0.3 ? '↓' : '→';
        num.push(val);
        detail.push(`${dir}${avg > 0 ? '+' : ''}${avg.toFixed(1)}`);
      }
      return { num, detail };
    },
  },
};

export const STRAT_KEYS: StrategyName[] = [
  'hot', 'cold', 'markov', 'mean', 'gap', 'hybrid',
  'inercia', 'vecinos', 'tendencia', 'ciclo', 'momentum',
];

export function computeConsensus(draws: Draw[]): { num: number[]; agreement: number[] } {
  const allPreds = Object.values(strategies).map(s => s.compute(draws).num);
  const num: number[] = [], agreement: number[] = [];
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
