import { useMemo, useState } from 'react';
import type { Draw, StrategyName } from '../types';
import { strategies, computeConsensus, STRAT_KEYS } from '../utils/strategies';

interface Props {
  draws: Draw[];
}

export function StrategyPanel({ draws }: Props) {
  const [active, setActive] = useState<StrategyName>('hot');
  const [showComparison, setShowComparison] = useState(false);

  const strat = strategies[active];
  const result = useMemo(() => strat.compute(draws), [draws, active]);
  const sum = result.num.reduce((a, b) => a + b, 0);
  const pairs = result.num.filter(d => d % 2 === 0).length;

  const allResults = useMemo(() => {
    return STRAT_KEYS.map(key => {
      const s = strategies[key];
      const r = s.compute(draws);
      const rSum = r.num.reduce((a, b) => a + b, 0);
      const rPairs = r.num.filter(d => d % 2 === 0).length;
      return { key, label: `${s.icon} ${s.label}`, num: r.num, sum: rSum, pairs: rPairs, explain: s.explain };
    });
  }, [draws]);

  const consensus = useMemo(() => computeConsensus(draws), [draws]);
  const avgAgreement = consensus.agreement.reduce((a, b) => a + b, 0) / 6;

  return (
    <>
      <div className="strategy-selector">
        {STRAT_KEYS.map(key => (
          <button
            key={key}
            className={`strat-btn ${active === key ? 'active' : ''}`}
            onClick={() => setActive(key)}
          >
            {strategies[key].icon} {strategies[key].label}
          </button>
        ))}
      </div>

      <div className="prediction-card">
        <div className="pred-label">{strat.icon} {strat.label}</div>
        <div className="pred-explanation">{strat.explain}</div>
        <div className="pred-number">{result.num.join('')}</div>

        <div className="pred-digits">
          {result.num.map((d, i) => (
            <div key={i} className="pred-digit">
              <strong>{d}</strong>
              P{i + 1} · {result.detail[i]}
            </div>
          ))}
        </div>

        <div className="pred-meta">
          <div className="pred-meta-item"><strong>{sum}</strong>SUMA</div>
          <div className="pred-meta-item"><strong>{pairs}/6</strong>PARES</div>
          <div className="pred-meta-item"><strong>{strat.logic}</strong>MÉTODO</div>
        </div>

        <div className="pred-actions">
          <button className="pred-btn" onClick={() => setActive(active)}>↻ Recalcular</button>
          <button
            className="pred-btn secondary"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? '⊟ Ocultar' : '⊟ Comparar todas'}
          </button>
        </div>

        <p className="pred-note">Probabilidad real con cualquier combinación: <strong>1 entre 1,000,000</strong> (0.0001%).</p>
      </div>

      {showComparison && (
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Estrategia</th>
                <th>Predicción</th>
                <th>Suma</th>
                <th>Pares</th>
                <th>Lógica</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map(r => (
                <tr key={r.key}>
                  <td><strong>{r.label}</strong></td>
                  <td><span className="comp-pred">{r.num.join('')}</span></td>
                  <td>{r.sum}</td>
                  <td>{r.pairs}/6</td>
                  <td className="comp-logic">{r.explain.substring(0, 55)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="consensus">
            CONSENSO: <strong>{consensus.num.join('')}</strong> · concordancia {avgAgreement.toFixed(1)}/6
          </div>
        </div>
      )}
    </>
  );
}
