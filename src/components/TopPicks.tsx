import { useMemo } from 'react';
import type { Draw } from '../types';
import { strategies, computeConsensus, STRAT_KEYS } from '../utils/strategies';

interface Props {
  draws: Draw[];
}

// Order strategies by relevance (best first)
const RANKED_KEYS = [
  'hybrid',     // Combina todo
  'inercia',    // Captura tendencia reciente
  'momentum',   // Detecta cambios bruscos
  'markov',     // Transiciones
  'hot',        // Frecuencia histórica
  'vecinos',    // Patrón similar
  'tendencia',  // Regresión
  'ciclo',      // Periodicidad
  'gap',        // Atrasados
  'mean',       // Promedio
  'cold',       // Menos frecuente
] as const;

export function TopPicks({ draws }: Props) {
  const predictions = useMemo(() => {
    return RANKED_KEYS.map((key, rank) => {
      const s = strategies[key];
      const r = s.compute(draws);
      const num = r.num.join('');
      const sum = r.num.reduce((a, b) => a + b, 0);
      return { key, rank: rank + 1, icon: s.icon, label: s.label, num, sum, explain: s.explain };
    });
  }, [draws]);

  const consensus = useMemo(() => computeConsensus(draws), [draws]);
  const consensusNum = consensus.num.join('');
  const consensusSum = consensus.num.reduce((a, b) => a + b, 0);

  return (
    <div className="top-picks">
      <div className="tp-header">
        <div className="tp-title">🎯 Números para el próximo sorteo</div>
        <div className="tp-subtitle">Ordenados por relevancia · {draws.length} sorteos analizados</div>
      </div>

      <div className="tp-consensus">
        <div className="tp-consensus-label">CONSENSO GENERAL</div>
        <div className="tp-consensus-num">{consensusNum}</div>
        <div className="tp-consensus-sub">
          Suma {consensusSum} · Concordancia: {consensus.agreement.map((a, i) =>
            `P${i+1}:${a}/${STRAT_KEYS.length}`
          ).join(' · ')}
        </div>
      </div>

      <div className="tp-list">
        {predictions.map(p => (
          <div key={p.key} className={`tp-item ${p.rank <= 3 ? 'tp-top' : ''}`}>
            <div className="tp-rank">#{p.rank}</div>
            <div className="tp-info">
              <div className="tp-strat">{p.icon} {p.label}</div>
              <div className="tp-explain">{p.explain}</div>
            </div>
            <div className="tp-number">{p.num}</div>
            <div className="tp-sum">Σ{p.sum}</div>
          </div>
        ))}
      </div>

      <div className="tp-footer">
        Probabilidad de cada número: 1 entre 1,000,000 · Esto es un ejercicio experimental, no una predicción real.
      </div>
    </div>
  );
}
